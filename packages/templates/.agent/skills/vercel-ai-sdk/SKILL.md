---
name: vercel-ai-sdk
description: "Hardened patterns for using the Vercel AI SDK (`ai`) in production-ready Next.js 15 applications. Focuses on RSC Streaming, Structured States, and ..."
---

# SKILL: Enterprise Vercel AI SDK

## Overview
Hardened patterns for using the **Vercel AI SDK** (`ai`) in production-ready Next.js 15 applications. Focuses on **RSC Streaming**, **Structured States**, and **Agentic Tool-Calling**.

## 1. RSC Streaming (Server-Side UI)
Leverage `streamText` and `DataStream` for sub-second perceived latency.
- **Pattern**: Use `streamText` in a Server Action and `useChat` or `useCompletion` in the Client.

```typescript
// ✅ Server Action
export async function chatAction(messages: Message[]) {
  const result = await streamText({
    model: openai('gpt-4o'),
    messages,
    system: '...',
  });
  return result.toDataStreamResponse();
}
```

## 2. Generative UI (Dynamic Components)
Inject UI components directly into the stream.
- **Core Pattern**: Use `StreamData` to pass structured component props along with text.

## 3. Tool Calling & Agentic Loops
The Vercel AI SDK makes tool-calling intuitive for agents.
```typescript
const result = await streamText({
  model: anthropic('claude-3-5-sonnet-20241022'),
  tools: {
    getWeather: {
      description: 'Get weather for a location',
      parameters: z.object({ location: z.string() }),
      execute: async ({ location }) => { /* ... */ }
    }
  },
  maxSteps: 5 // Allow multi-step agentic loops
});
```

## 4. Middleware & Adapter Patterns
- **Provider Agnostic**: Use the Core v3 API to easily swap between OpenAI, Anthropic, and Google.
- **Persistence**: Integrate `onFinish` to save chat history to your DB (e.g., Prisma).

## 5. Security & Error Handling
- **Server Action Validation**: Always wrap streams in a Zod-validated auth check.
- **Aborting Streams**: Ensure `abortController` is respected locally to save on token costs if the user closes the window.

## Skills to Load
- `nextjs-app-router`
- `react-streaming-patterns`
- `openai-sdk`
- `anthropic-claude-sdk`
