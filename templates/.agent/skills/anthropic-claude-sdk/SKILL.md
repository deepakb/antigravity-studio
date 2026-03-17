# SKILL: Anthropic Claude SDK

## Overview
Patterns for using `@anthropic-ai/sdk`, optimal for nuanced reasoning, intense coding tasks, and massive document context. Claude differs from OpenAI in strictness (it requires explicit `user` and `assistant` role alternation) and excels at XML-driven prompting.

## Installation
```bash
npm install @anthropic-ai/sdk
```

## Configuration
```typescript
import Anthropic from '@anthropic-ai/sdk';

// Automatically uses ANTHROPIC_API_KEY from env
const anthropic = new Anthropic({
  maxRetries: 3,
});
```

## 1. The Messages API (Basic Inference)
Claude expects the "System" prompt to be a configuration parameter, NOT a message in the array.

```typescript
async function askClaude(userPrompt: string) {
  const msg = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 1000,
    system: "You are a highly concise code reviewer. Respond only with actionable bullet points.", // <--- System prompt goes here
    messages: [
      { role: 'user', content: userPrompt }
    ],
    temperature: 0.1,
  });

  console.log(msg.content[0].text);
}
```

## 2. Prefilling Assistant Responses (A Claude Superpower)
You can force Claude to start its response with a specific phrase. This is the ultimate "jailbreak" for strict formatting. If you want Claude to *only* output JSON, you prefill the assistant response with `{`.

```typescript
async function extractJSON(text: string) {
  const msg = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 1000,
    system: "Extract names and ages from the text. ONLY output a raw JSON array. Do not use markdown blocks.",
    messages: [
      { role: 'user', content: text },
      // PREFILL: We literally force Claude's first token to be the start of a JSON array
      { role: 'assistant', content: "[" }
    ]
  });

  // Because you prefilled `[`, you must prepend it back to the parsed output
  const rawJSON = "[" + msg.content[0].text;
  return JSON.parse(rawJSON);
}
```

## 3. Streaming Responses
Anthropic has native block streaming, perfect for Server-Sent Events (SSE).

```typescript
async function streamClaude(prompt: string) {
  const stream = await anthropic.messages.create({
    model: 'claude-3-7-sonnet-20250219',
    max_tokens: 1000,
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const messageStreamEvent of stream) {
    if (messageStreamEvent.type === 'content_block_delta') {
      process.stdout.write(messageStreamEvent.delta.text);
    }
  }
}
```

## 4. XML Formatting for Context
Claude has been expressly fine-tuned to prefer XML delimiters for large blocks of context. Always wrap documents, snippets, or retrieved knowledge in XML tags.

```typescript
// ✅ Good Claude Prompt Construction
const prompt = `
Please summarize the following financial document, focusing on Q3 revenue.

<financial_document>
${largeDocumentText}
</financial_document>

Take your time and explain your analysis step-by-step inside <thinking> tags before providing the final summary inside <summary> tags.
`;
```

## Model Matrix (Claude 3.5 & 3.7)
1. `claude-3-7-sonnet-20250219` — The absolute workhorse. Best-in-class coding model. Highest reasoning. Always default to this for heavy logic.
2. `claude-3-5-haiku-20241022` — Extremely fast, very cheap. Use for basic extraction, routing queries, or chat bots where speed is prioritized.
3. `claude-3-opus-20240229` — Use rarely. Replaced mainly by 3.5 Sonnet, but sometimes used for extremely long-form creative writing/prose.

## Anti-Patterns
- **Role repetition**: `[user, user, assistant]` will throw an API error. Claude requires exact alternation: `[user, assistant, user]`. If you have multiple user messages, concatenate their content into a single `user` message block before sending.
- **Putting the System in Messages**: `[{role: 'system', content: '...'}]` will fail. Use the `system:` top-level config property.
