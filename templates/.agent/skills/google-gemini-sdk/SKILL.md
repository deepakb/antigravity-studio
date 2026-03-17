# SKILL: Google Gemini SDK

## Overview
Patterns for using the latest `@google/genai` (official Google Gen AI SDK) for True Multimodality (images, audio, video) and massively enormous context windows (up to 2 Million tokens in Gemini 1.5 Pro).

## Installation
*Note: Use the new `@google/genai` package, NOT `@google/generative-ai` (which is the legacy client).*

```bash
npm install @google/genai
```

## Configuration
```typescript
import { GoogleGenAI } from '@google/genai';

// Automatically uses GEMINI_API_KEY from environment
const ai = new GoogleGenAI({}); 
```

## 1. Basic Generation with System Instructions
Gemini `generateContent` integrates system prompts as a configuration parameter rather than a message role.

```typescript
async function askGemini(prompt: string) {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      systemInstruction: 'You are a sarcastic robot.',
      temperature: 0.7,
      maxOutputTokens: 500,
    }
  });

  console.log(response.text);
}
```

## 2. Multimodal Inputs (Images/Audio/Video/Files)
Gemini handles non-text inputs better than any other model natively. If the file is small, send it inline (Base64). If it's large (a 30-page PDF or an hour-long MP4), you must upload it via the File API first.

### Inline Image Example (Small Files)
```typescript
import fs from 'fs';

async function analyzeLocalImage() {
  const imageBuf = fs.readFileSync('./diagram.jpg');
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: [
      "Describe this architecture diagram in detail.",
      {
        inlineData: {
          data: imageBuf.toString("base64"),
          mimeType: "image/jpeg"
        }
      }
    ]
  });
  
  console.log(response.text);
}
```

### File API Example (Massive Files)
Use the File API to cache huge files (up to 2GB per file) on Google's servers for 2 days to take advantage of the 2M token context window.

```typescript
async function analyzeMassiveVideo() {
  // 1. Upload the file
  console.log("Uploading video...");
  const uploadResult = await ai.files.upload({
    file: 'presentation.mp4',
    mimeType: 'video/mp4',
  });

  console.log(`Uploaded as: ${uploadResult.name}`);

  // 2. Wait for Google to process the video (can take minutes for large files)
  let fileInfo;
  do {
    await new Promise((r) => setTimeout(r, 5000));
    fileInfo = await ai.files.get({ name: uploadResult.name });
    console.log(`Processing state: ${fileInfo.state}`);
  } while (fileInfo.state === 'PROCESSING');

  if (fileInfo.state === 'FAILED') {
    throw new Error("Video processing failed.");
  }

  // 3. Ask Gemini to analyze the uploaded file
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-pro', // Pro is strictly better for massive video reasoning
    contents: [
      fileInfo,
      "Summarize the presenter's three main arguments and specify the timestamps where they occur."
    ]
  });

  console.log(response.text);
  
  // 4. Cleanup (Optional, expires automatically after 48h)
  await ai.files.delete({ name: uploadResult.name });
}
```

## 3. Structured Outputs (JSON Schema)
Force Gemini to output JSON using an Object schema definition.

```typescript
import { Type, Schema } from '@google/genai';

const responseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    heroName: { type: Type.STRING },
    powers: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
    },
  },
  required: ['heroName', 'powers'],
};

async function createHero() {
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: 'Create a fire-based superhero',
    config: {
      responseMimeType: 'application/json', // CRITICAL: Must be set to JSON
      responseSchema: responseSchema,
    },
  });

  return JSON.parse(response.text);
}
```

## Recommended Models
1. `gemini-2.5-flash`: The default. Extremely fast, very cheap, handles 95% of tasks.
2. `gemini-2.5-pro`: The heavy reasoner. Slower, more expensive. Use only for massive complex logic, massive context windows (1M+ tokens), or deep code writing.
3. `gemini-2.5-flash-8b`: Micro model for incredibly fast, simple classification tasks.
