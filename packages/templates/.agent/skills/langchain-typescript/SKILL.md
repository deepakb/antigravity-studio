---
name: langchain-typescript
description: "Advanced patterns for LangChain.js in production. Focuses on LCEL (LangChain Expression Language), Custom Toolkits, and Persistent State Management."
---

# SKILL: Enterprise LangChain (LCEL)

## Overview
Advanced patterns for **LangChain.js** in production. Focuses on **LCEL (LangChain Expression Language)**, **Custom Toolkits**, and **Persistent State Management**.

## 1. LCEL Architecture (LangChain Expression Language)
Move away from legacy "Chains" to the newer pipe (`|`) syntax.
- **Pattern**: `Prompt | Model | Parser`.
- **Benefit**: Built-in tracing, parallelization, and streaming support.

```typescript
const chain = prompt
  .pipe(model)
  .pipe(new JsonOutputParser());

await chain.invoke({ input: "..." });
```

## 2. Advanced Toolkits & Custom Tools
Build reusable tool bundles for specific project domains.
- **Strategy**: Define tools with explicit Zod schemas.
- **Auth**: Always inject `userContext` into tool execution to prevent unauthorized data access.

## 3. Vector Store Persistence (VectorStores)
Abstract your DB interactions using LangChain's vector store wrappers.
- **Supported**: Pinecone, Supabase (pgvector), Qdrant, Memory.

## 4. LangGraph (Complex State)
For multi-step, cyclic agent interactions, use **LangGraph**.
- **State**: Maintain a persistent `state` object that flows through nodes.
- **Logic**: Use `Edges` to determine the next agent in the sequence based on the current context.

## 5. Observability (LangSmith)
Production LangChain apps MUST use tracing.
- **Config**: Set `LANGCHAIN_TRACING_V2=true`.
- **Debugging**: Inspect the exact prompt variables and model raw outputs on every step.

## Skills to Load
- `rag-implementation`
- `agentic-tool-calling`
- `vector-database-strategies`
