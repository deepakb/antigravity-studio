# SKILL: LangChain TypeScript

## Overview
**LangChain** provides deep abstractions for chaining components together to build autonomous agents, highly complex custom RAG pipelines, and graph-based memory. 

*Note: For simple web chat apps in Next.js, Vercel AI SDK is superior. Use LangChain.js when you require massive data ingestion (PDF loaders, web scrapers), complex orchestration (LangGraph), or a wide variety of third-party tool integrations out-of-the-box.*

## Installation
```bash
npm install @langchain/core @langchain/openai @langchain/community
```

## 1. LangChain Expression Language (LCEL)
LCEL is the standard, declarative way to compose chains. It uses the `.pipe()` method (similar to Unix pipes) to pass the output of one component directly into the input of the next.

```typescript
import { ChatOpenAI } from '@langchain/openai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StringOutputParser } from '@langchain/core/output_parsers';

async function basicChain() {
  const model = new ChatOpenAI({ modelName: 'gpt-4o', temperature: 0 });
  const parser = new StringOutputParser(); // Strips AIMessage metadata, returns raw string

  // Define a prompt template with variables
  const prompt = ChatPromptTemplate.fromMessages([
    ['system', 'You are a translator. Translate {language_from} to {language_to}.'],
    ['user', '{text}'],
  ]);

  // Compose the chain using LCEL
  const chain = prompt.pipe(model).pipe(parser);

  // Invoke the chain by passing the dictionary of variables
  const result = await chain.invoke({
    language_from: 'English',
    language_to: 'French',
    text: 'LangChain makes building AI applications easy.',
  });

  console.log(result); // "LangChain facilite la création d'applications d'IA."
}
```

## 2. Document Loaders & Splitters (For RAG)
LangChain's biggest strength is its immense library of data ingesters.

```typescript
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';

async function ingestPDF(filePath: string) {
  // 1. Load the raw document
  const loader = new PDFLoader(filePath);
  const docs = await loader.load();

  // 2. Split the document into digestible chunks (crucial for Vector DBs)
  const splitter = new RecursiveCharacterTextSplitter({
    chunkSize: 1000,    // Target max characters per chunk
    chunkOverlap: 200,  // Overlap to preserve context between chunks
  });

  const splitDocs = await splitter.splitDocuments(docs);
  console.log(`Split into ${splitDocs.length} chunks.`);
  
  return splitDocs; // Can now be embedded and stored in Pinecone/pgvector
}
```

## 3. Basic ReAct Agent
Agents use LLMs as a reasoning engine to determine *which* actions to take and *what inputs* to pass to them.

```typescript
import { ChatOpenAI } from "@langchain/openai";
import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { Calculator } from "@langchain/community/tools/calculator";
import { ChatPromptTemplate } from "@langchain/core/prompts";

async function runAgent() {
  const llm = new ChatOpenAI({ model: "gpt-4o", temperature: 0 });
  
  // Provide pre-built LangChain tools (or write custom ones)
  const tools = [new Calculator()];

  // Create standard agent prompt
  const prompt = ChatPromptTemplate.fromMessages([
    ["system", "You are a helpful assistant with a calculator tool."],
    ["placeholder", "{chat_history}"],
    ["human", "{input}"],
    ["placeholder", "{agent_scratchpad}"], // Where the agent stores intermediate tool thoughts
  ]);

  const agent = createToolCallingAgent({ llm, tools, prompt });

  // The Executor handles the while-loop (Think -> Action -> Observe -> Final Answer)
  const agentExecutor = new AgentExecutor({ agent, tools });

  const result = await agentExecutor.invoke({
    input: "If I have 15 apples and buy 23 more, then divide them equally among 4 friends, how many do they each get?",
  });

  console.log(result.output); 
}
```

## Anti-Patterns
- **Overcomplicating APIs**: Building a 5-step LCEL chain for a simple REST route that just needs a one-shot OpenAPI call.
- **Ignoring the Prompt Template abstractions**: Building huge manual string interpolations instead of `ChatPromptTemplate`. LangChain templates handle edge cases for different vendor messaging rules under the hood.
