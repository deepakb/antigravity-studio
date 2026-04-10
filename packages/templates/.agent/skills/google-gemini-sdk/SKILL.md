---
name: google-gemini-sdk
description: "Advanced patterns for Gemini 1.5 Pro/Flash in production. Focuses on Native Multimodality, Massive Context (1M-2M), and Cost-Efficient Intelligence."
---

# SKILL: Enterprise Google Gemini SDK

## Overview
Advanced patterns for **Gemini 1.5 Pro/Flash** in production. Focuses on **Native Multimodality**, **Massive Context (1M-2M)**, and **Cost-Efficient Intelligence**.

## 1. Native Multimodality (Vision & Audio)
Gemini allows processing images, video, and audio natively without conversion to text.
- **Pattern**: Pass `inlineData` or `fileData` for direct processing.
- **Efficiency**: Use `Gemini 1.5 Flash` for identifying objects in video or transcribing long audio files.

```typescript
const result = await model.generateContent([
  "Describe this video in detail",
  { fileData: { fileUri: "https://your-storage.com/video.mp4", mimeType: "video/mp4" } }
]);
```

## 2. Massive Context Management (1M - 2M Tokens)
Gemini 1.5 Pro supports up to 2M tokens.
- **Context Caching**: For static knowledge of your codebase or documentation.
- **Search vs Retrieval**: Use Gemini's massive context to "look over everything" when precision RAG is not enough.

## 3. High-Integrity Tool Calling
Gemini's tool calling is highly effective for internal system integration.
```typescript
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-pro",
  tools: [{ functionDeclarations: [/* ... */] }],
});
```

## 4. Controlled Stop Sequences
Use `stopSequences` to prevent the model from drifting or generating unnecessary content.
```typescript
const generationConfig = {
  stopSequences: ["\nEND_OF_DOCUMENT"],
  maxOutputTokens: 2000,
  temperature: 0.4,
};
```

## 5. Security & Safety Settings
Explicitly configure `safetySettings` to match your enterprise policy.
```typescript
const safetySettings = [
  { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
  { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
];
```

## Skills to Load
- `multimodal-processing`
- `enterprise-rag`
- `long-context-strategies`
