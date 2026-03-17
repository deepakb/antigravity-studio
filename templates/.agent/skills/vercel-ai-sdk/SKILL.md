# SKILL: Vercel AI SDK

## Overview
The **Vercel AI SDK** is the industry standard for integrating AI into Next.js React applications. It abstract away vendor specifics (OpenAI, Anthropic, Gemini) and provides a unified interface for streaming text, streaming React Server Components (Generative UI), and tool calling.

## Installation
```bash
npm i ai @ai-sdk/openai @ai-sdk/anthropic @ai-sdk/google zod
```

## 1. AI SDK Core (Server-Side Execution)
Use Core for server-side scripts, simple text generation, and strictly typed JSON object generation. It uses unified model strings across providers.

```typescript
// backend-script.ts
import { generateText, generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';       // uses OPENAI_API_KEY
import { anthropic } from '@ai-sdk/anthropic'; // uses ANTHROPIC_API_KEY
import { z } from 'zod';

async function generateGreeting() {
  // Simple text generation
  const { text } = await generateText({
    // Easily swap 'openai:gpt-4o' with 'anthropic:claude-3-7-sonnet-20250219'
    model: openai('gpt-4o'), 
    prompt: 'Write a short welcome message.',
  });
  console.log(text);
}

async function extractUser() {
  // Guaranteed structured JSON output powered by Zod validation
  const { object } = await generateObject({
    model: anthropic('claude-3-5-haiku-20241022'),
    schema: z.object({
      name: z.string(),
      age: z.number(),
    }),
    prompt: 'My name is John and I am 42 years old.',
  });
  console.log(object.name); // John (Fully typed)
}
```

## 2. AI SDK UI (useChat hook)
Client-side React hooks for building instant chat applications. The hooks manage state, loading indicators, and API fetching out of the box.

### Server-Side Route Handler
```typescript
// app/api/chat/route.ts
import { openai } from '@ai-sdk/openai';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  // streamText automatically handles SSE (Server-Sent Events) formatting
  const result = streamText({
    model: openai('gpt-4o-mini'),
    messages,
  });

  return result.toDataStreamResponse();
}
```

### Client-Side Component
```tsx
// app/page.tsx
'use client';
import { useChat } from 'ai/react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat();

  return (
    <div className="flex flex-col p-4 max-w-xl mx-auto">
      {messages.map(m => (
        <div key={m.id} className="mb-4">
          <strong>{m.role === 'user' ? 'You: ' : 'AI: '}</strong>
          {m.content}
        </div>
      ))}

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input 
          value={input} 
          onChange={handleInputChange}
          placeholder="Say something..." 
          className="border p-2 w-full"
        />
        <button disabled={isLoading} type="submit" className="bg-blue-500 text-white p-2">
          Send
        </button>
      </form>
    </div>
  );
}
```

## 3. Tool Calling with `streamText`
Give the LLM abilities (like weather, internal DB lookups) directly in the streaming loop.

```typescript
import { openai } from '@ai-sdk/openai';
import { streamText, tool } from 'ai';
import { z } from 'zod';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = streamText({
    model: openai('gpt-4o'),
    messages,
    tools: {
      getWeather: tool({
        description: 'Get the current weather for a city',
        parameters: z.object({ city: z.string() }),
        // The LLM decides to call this, and the SDK automatically executes it
        execute: async ({ city }) => {
          const temp = city === 'Boston' ? 45 : 72; // Fake DB
          return { temperature: temp, condition: 'Sunny' };
        },
      }),
    },
    // The SDK automatically sends the execution result back to the LLM to summarize
    maxSteps: 5, 
  });

  return result.toDataStreamResponse();
}
```

## Anti-Patterns
- **Vendor Lock-In**: Using the raw `openai` or `@anthropic-ai/sdk` SDKs inside your frontend components or generic API routes. If you ever want to switch models (which happens frequently as open-source catches up), you'll have to rewrite the entire data-fetching logic. The Vercel AI SDK lets you change models by changing a single string `openai('...')` -> `google('...')`.
