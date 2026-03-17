# SKILL: OpenAI Node SDK

## Overview
Patterns for using the official `openai` Node.js SDK securely and effectively. Covers chat completions, structured outputs (JSON), tool calling (Function Calling), and streaming.

## Installation
```bash
npm install openai zod
```

## Basic Configuration
```typescript
import OpenAI from 'openai';

// Initialize with environment variable automatically (OPENAI_API_KEY)
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Defaults to this, provided for clarity
  maxRetries: 3, // Enable exponential backoff
});
```

## 1. Structured Outputs (Strict JSON Responses)
Introduced in `gpt-4o-2024-08-06`, using the `response_format` JSON Schema. This guarantees 100% adherence to the defined schema. Use `zod` to declare the schema.

```typescript
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

const StepSchema = z.object({
  title: z.string(),
  description: z.string(),
  estimatedMinutes: z.number(),
});

const RecipeSchema = z.object({
  recipeName: z.string(),
  ingredients: z.array(z.string()),
  steps: z.array(StepSchema),
});

async function getRecipe(dishName: string) {
  const completion = await openai.beta.chat.completions.parse({
    model: 'gpt-4o',
    messages: [
      { role: 'system', content: 'You are an expert chef. Create recipes.' },
      { role: 'user', content: `Give me a recipe for ${dishName}.` },
    ],
    // Force structured output matching the schema
    response_format: zodResponseFormat(RecipeSchema, 'recipe'),
    temperature: 0.2,
  });

  const parsedRecipe = completion.choices[0].message.parsed;
  
  // parsedRecipe is fully typed according to RecipeSchema!
  console.log(parsedRecipe?.recipeName);
  return parsedRecipe;
}
```

## 2. Tool Calling (Function Calling)
Provide functions that the LLM can decide to execute to fetch missing realtime data or perform actions.

```typescript
async function fetchWeatherAndReport(location: string) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: `What's the weather like in ${location}?` }],
    tools: [
      {
        type: 'function',
        function: {
          name: 'get_current_weather',
          description: 'Get the current weather in a given location',
          parameters: {
            type: 'object',
            properties: {
              location: { type: 'string', description: 'The city and state, e.g. San Francisco, CA' },
              unit: { type: 'string', enum: ['celsius', 'fahrenheit'] },
            },
            required: ['location'],
          },
        },
      },
    ],
    tool_choice: 'auto', // Let the model decide whether to call tools
  });

  const responseMessage = completion.choices[0].message;

  // Did the model decide to call our tool?
  if (responseMessage.tool_calls) {
    // 1. We must execute the internal function
    for (const toolCall of responseMessage.tool_calls) {
      if (toolCall.function.name === 'get_current_weather') {
        const args = JSON.parse(toolCall.function.arguments);
        // Pretend this is a real DB/API call
        const functionResult = `{ "temperature": 72, "unit": "${args.unit || 'fahrenheit'}" }`;

        // 2. We must send the result back to the model in a new message array
        const finalResponse = await openai.chat.completions.create({
          model: 'gpt-4o',
          messages: [
            { role: 'user', content: `What's the weather like in ${location}?` },
            responseMessage, // Include the assistant's tool-call message
            {
               role: 'tool',
               tool_call_id: toolCall.id,
               content: functionResult, // The result of our execution
            }
          ]
        });
        
        return finalResponse.choices[0].message.content;
      }
    }
  }

  return responseMessage.content;
}
```

## 3. Native Streaming
Streams let you display data as it generates, reducing perceived latency.

```typescript
async function streamResponse(prompt: string) {
  const stream = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [{ role: 'user', content: prompt }],
    stream: true, // Enable streaming
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    process.stdout.write(content); // Print it character by character
  }
}
```

## Anti-Patterns
- **Using legacy models**: Stop using `gpt-3.5-turbo`. It's deprecated. Use `gpt-4o-mini` for the fastest, cheapest alternative.
- **Putting PII in prompts**: OpenAI logs default API requests for 30 days (though they say they don't use API data for training). Mask extreme PII locally before sending it to the API.
- **Leaking API Keys**: Never include `process.env.OPENAI_API_KEY` in browser (client-side) code. All OpenAI SDK calls MUST happen on the server (Next.js Route Handlers or Server Actions).
