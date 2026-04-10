---
name: rag-implementation
description: "Hardened, production-grade RAG patterns. Focuses on Hybrid Search, Context Re-ranking, and Self-Correction to eliminate hallucinations."
---

# SKILL: Enterprise RAG (Retrieval-Augmented Generation)

## Overview
Hardened, production-grade **RAG** patterns. Focuses on **Hybrid Search**, **Context Re-ranking**, and **Self-Correction** to eliminate hallucinations.

## 1. Hybrid Search (Semantic + Keyword)
Vector search alone often misses exact keywords (e.g., product IDs, obscure function names).
- **Pattern**: Combine Vector (Nearest Neighbor) with Full-Text (BM25/Fuzzy) search.
- **Implementation**: pgvector (hybrid) or Pinecone (metadata filtering).

## 2. Professional Context Re-ranking
Retrieving `topK: 20` often includes noise.
- **Protocol**: Retrieve 20–50 candidates. Use a **Cross-Encoder Model** (e.g., `Cohere Rerank`) to score and pick the top 5 absolute matches.
- **Benefit**: Drastically improves "Needle-in-a-Haystack" retrieval accuracy.

## 3. Self-Correction & Critique (Corrective RAG)
Don't trust the first generation.
- **Pattern**: Use a second LLM call to "critique" the answer against the context.
- **Checklist**:
  - Is the answer supported by the text?
  - Does it introduce external hallucinations?
  - Are all sources cited?

## 4. Document Citations & Provenance
Every AI response MUST cite its source to provide user trust.
- **Format**: `Source: [file_name.md](url) (Score: 0.95)`.
- **Reason**: Allows the developer to verify the AI's "facts" immediately.

## 5. Handling Dynamic Data (Agentic RAG)
For real-time data (stock prices, current git status), use **Tools** instead of static embeddings.
- **Routing**: `Is this a static doc query?` → RAG. `Is this a real-time system query?` → Tool Call.

## Skills to Load
- `vector-database-strategies`
- `cross-encoder-reranking`
- `prompt-injection-defense`
- `ai-evals-monitoring`
