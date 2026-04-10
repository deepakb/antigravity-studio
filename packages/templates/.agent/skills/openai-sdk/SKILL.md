---
name: openai-sdk
description: "Hardened patterns for production OpenAI SDK usage. Focuses on reliability, structured governance, and cost-efficient scaling."
---

# SKILL: Enterprise OpenAI SDK

## Overview
Hardened patterns for production OpenAI SDK usage. Focuses on **reliability**, **structured governance**, and **cost-efficient scaling**.

## 1. Resilience & Rate Limiting
Never call OpenAI without a retry strategy. Next.js 15 Server Actions and Route Handlers must handle transient failures gracefully.

```typescript
const openai = new OpenAI({
  maxRetries: 5, // Default is 2. Increase for high-volume enterprise apps.
  timeout: 30000, // 30s timeout for complex generations.
});
```

## 2. Advanced Tool-Calling Safety
Tools (Functions) must be strictly typed and error-handled. Use **Parallel Tool Calling** where possible to reduce latency.

```typescript
// ✅ CORRECT: Standard result handling for tool calls
const response = await openai.chat.completions.create({
  model: "gpt-4o",
  tools: [/* ... */],
  parallel_tool_calls: true // Enabled by default in newer models
});

// Always check for tool_calls before proceeding
if (response.choices[0].message.tool_calls) {
  // Execute tools...
}
```

## 3. Cost Control & Token Management
- **Token Scrubbing**: Abort early if the input exceeds a budget (e.g., 8k tokens for small tasks).
- **Model Routing**: Use `gpt-4o-mini` for 90% of tasks (extraction, formatting). Reserve `gpt-4o` only for high-reasoning tasks.
- **Predictive Tokens**: Use `max_completion_tokens` (replacing `max_tokens`) to set hard budgets on generation.

## 4. Prompt Safety (Injection Defense)
Use XML tags to isolate user-provided data from system instructions.
```typescript
{
  role: "user",
  content: `Analyze the following code:\n\n<code>${userCode}</code>`
}
```

## 5. Enterprise Evaluations (Evals)
- Log every input/output pair with a `trace_id`.
- Use **Structured Output Parsing** (Zod) to ensure 100% adherence to your internal data contracts.
- Implement **LLM-as-a-Judge** to audit generated content for quality scores.

## Skills to Load Concurrently
- `rag-implementation` (for context-aware prompting)
- `input-validation-sanitization` (for Zod schemas)
- `ai-evals-monitoring`
