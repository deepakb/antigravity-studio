---
name: anthropic-claude-sdk
description: "Patterns for leveraging Claude 3.5 Sonnet/Haiku in high-integrity systems. Focuses on Prompt Caching, Artifact Handling, and Massive Context Resili..."
---

# SKILL: Enterprise Anthropic Claude SDK

## Overview
Patterns for leveraging **Claude 3.5 Sonnet/Haiku** in high-integrity systems. Focuses on **Prompt Caching**, **Artifact Handling**, and **Massive Context Resilience**.

## 1. Prompt Caching (Cost Optimization)
Claude supports caching for large system prompts or frequently reused context.
- **Breakpoint**: Add `cache_control: { type: "ephemeral" }` at the end of the system block or largest message.
- **Savings**: Reduces cost by up to 90% for repeated RAG or code analysis tasks.

```typescript
const msg = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  system: [
    {
      type: "text",
      text: LARGE_CONTEXT,
      cache_control: { type: "ephemeral" } // Cache this massive context
    }
  ],
  messages: [{ role: "user", content: "Query about context" }]
});
```

## 2. Model Routing Matrix
- **Claude 3.5 Sonnet**: The primary model for coding, complex reasoning, and nuance.
- **Claude 3.5 Haiku**: Sub-second latency. Ideal for classification, routing, and fast text processing.

## 3. High-Integrity Tool Calling
Claude's tool-calling is highly deterministic. Use it with **Force Tool Use** for extraction tasks.
```typescript
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  tool_choice: { type: "tool", name: "extract_metadata" }, // Force specific tool
  tools: [/* ... */],
});
```

## 4. Handling Massive Context (200k+)
- **Middle-Out Attention**: Keep the most critical information at the start and end of the prompt.
- **Chunking Strategy**: Even with 200k, prefer RAG for specific lookup to reduce "Needle-in-a-Haystack" issues and cost.

## 5. Security & PII
- **Zero Data Training**: Enterprise API data is not used for training by default.
- **Safety Filtering**: Use `anthropic-safety` layers for filtering toxicity.

## Skills to Load
- `prompt-caching-strategies`
- `rag-implementation`
- `ai-ui-streaming`
