# Bundled Offline Doc Chat

A separate bare React Native CLI POC. The sample office guide is part of the JavaScript source, and a quantized Qwen instruction model is bundled as an app resource. Users do not pick a document or model, and the app does not contact a server or download assets.

## Start the app

Requirements: Node.js 20+, Android Studio for Android, or Xcode and CocoaPods for iOS. Install packages while online, then build and install the release app. Runtime Q&A works offline.

```sh
npm install
npm run android
# macOS / iOS:
npx pod-install
npm run ios
```

The app loads the model at startup. On Android, it copies the bundled model into the app's private files directory on first launch; this first launch can take a while. On iOS, the model is loaded from the app bundle.

## Included content and model

- Document text: `src/sampleDocument.ts`
- Local passage ranking: `src/retrieval.ts`
- Bundled model: `assets/models/Qwen2.5-0.5B-Instruct-Q4_K_M.gguf`
- Model source: [bartowski/Qwen2.5-0.5B-Instruct-GGUF](https://huggingface.co/bartowski/Qwen2.5-0.5B-Instruct-GGUF)
- Model license: Apache-2.0; review the model card before redistributing.

The model is stored with Git LFS because it exceeds GitHub’s regular 100 MiB file limit. Install Git LFS before cloning this repository; after cloning, run `git lfs pull` if the model was not checked out automatically. The app does not download the model at runtime.

The GGUF file is about 398 MB. The installed app is correspondingly large; Android also needs additional free space for its first-launch private copy. The model is included in the project and is never fetched by the app.

The sample guide is intentionally fictional. To use another fixed document, replace the text in `src/sampleDocument.ts` and rebuild.

## Offline behavior

- Android removes the `INTERNET` permission from the merged manifest.
- The app contains no API client, network request, database, or analytics.
- Text ranking and answer generation run locally using `llama.rn` / `llama.cpp`.
- The user document and chat are fixed in code; chat state exists in memory for the current app session.

This is a small-model POC. Keyword retrieval is strongest when the question shares terms with the document. The model and retrieval code are English-oriented in this sample.
