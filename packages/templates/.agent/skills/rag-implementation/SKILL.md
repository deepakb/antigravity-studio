# SKILL: RAG Implementation (Retrieval-Augmented Generation)

## Overview
Retrieval-Augmented Generation (RAG) grounds an LLM's responses in factual, external data that it wasn't originally trained on. This prevents hallucinations and allows querying proprietary or private enterprise data. 

## The RAG Pipeline Elements

1. **Ingestion & Text Splitting**: Converting PDFs/Markdown/HTML into raw text, then splitting them into digestible "Chunks" (usually 500-1000 tokens) with overlap so context isn't lost between chunks.
2. **Embedding**: Converting text chunks into arrays of floating-point numbers (Vectors) using an embedding model (e.g., OpenAI `text-embedding-3-small`).
3. **Vector Database**: Storing these vectors in a specialized DB (Pinecone, Qdrant, Milvus, pgvector).
4. **Retrieval**: Taking the user's query, embedding it into a vector, and doing a Cosine Similarity Search in the DB to find the 'K' most semantically similar chunks.
5. **Generation**: Injecting the retrieved chunks into the LLM system prompt and asking it to answer the user's query *based strictly on the provided context*.

## 1. Embedding and Storing Data (Pinecone Example)

```bash
npm i @pinecone-database/pinecone openai
```

```typescript
import { Pinecone } from '@pinecone-database/pinecone';
import OpenAI from 'openai';

const pc = new Pinecone();
const openai = new OpenAI();
const index = pc.Index('enterprise-docs');

async function embedAndStore(documentId: string, textChunks: string[]) {
  // 1. Generate embeddings in batch
  const embeddings = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: textChunks,
    dimensions: 1536, // Must match the Vector DB index dimensions
  });

  // 2. Format for Pinecone
  const vectors = textChunks.map((chunk, i) => ({
    id: `${documentId}-chunk-${i}`,
    values: embeddings.data[i].embedding,
    metadata: {
      text: chunk, // Store the original text to retrieve later!
      docId: documentId,
      source: 'Internal Wiki',
    },
  }));

  // 3. Upsert into Vector DB
  await index.upsert(vectors);
  console.log(`Stored ${vectors.length} vectors!`);
}
```

## 2. Retrieving and Querying

```typescript
async function queryRAG(userQuery: string) {
  // 1. Embed the user's search query
  const queryEmbedding = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: userQuery,
  });

  // 2. Search Pinecone for the Top 5 most similar chunks
  const searchResults = await index.query({
    vector: queryEmbedding.data[0].embedding,
    topK: 5,
    includeMetadata: true,
  });

  // 3. Extract the original text from the metadata
  const contextText = searchResults.matches
    .map((match) => match.metadata?.text)
    .join('\n\n---\n\n'); // Separate chunks clearly for the LLM

  // 4. Send the context + user query to the LLM
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'system',
        content: `You are a helpful assistant. Use ONLY the following Context to answer the user's question. If the answer is not contained in the context, say "I don't know based on the provided documents."
        
        <context>
        ${contextText}
        </context>`,
      },
      { role: 'user', content: userQuery },
    ],
  });

  return completion.choices[0].message.content;
}
```

## Anti-Patterns
- **Not defining "I don't know"**: If you don't explicitly tell the LLM to fall back to "I don't know" when the RAG context is insufficient, it will revert to its base training data and hallucinate a plausible-sounding answer.
- **Injecting thousands of chunks**: Don't retrieve `topK: 100` and flood the context window. Use a fast retrieval method (BM25 or basic Vector search) to get 50 chunks, then use a Cross-Encoder (Reranker) API (like Cohere Rerank) to perfectly sort those 50 down to the absolute best 5 before passing them to the expensive LLM.
- **RAG on Relational Data**: Don't use RAG to answer queries like "Who is the customer with the highest total purchases?" Vector databases do semantic similarity, not SQL aggregations. For data analytics, use Tool Calling (Text-to-SQL) instead.
