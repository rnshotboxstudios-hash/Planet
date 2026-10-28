# Planet
An educational workflow-factory prototype for ages 10+. Describe a mission, name your Overseer, place five tools, and try a simulated run. Missing tools can be added automatically. Progress is stored on the current browser; completed practice notes can be downloaded.

## Develop
Node.js 22.12+ or 24 is recommended.

```sh
npm ci --cache /workspace/.npm-cache
npm run dev
```

`npm run build` creates production assets in `dist`. `npm run preview` serves that build locally.

## Current scope
The default practice world uses educational examples. The Live AI Workshop connects to a Node server, generates mission-specific structured plans, equips agents with outline/draft/review tools, passes artifacts between steps, and preserves completed work locally for retries. Live model execution has not been verified with real credentials. No credentials are required. It does not browse, code autonomously, publish products, process payments, or create real businesses. The Starnet reference was not verified: the supplied message contained no link and GitHub search was blocked in the setup environment.

A production version needs a server-side model integration using an actually available model, secure tool execution, source-backed research, bounded retry and cost limits, adult controls for external actions, and child privacy protections. Never put API credentials in frontend code. Do not represent practice output as verified research or a deployed product.

## Live AI workshop
Start `npm run api` in one terminal and `npm run dev` in another. Vite proxies `/api` to the local Node server on port 8787. Configure `OPENAI_API_KEY` and `PLANET_MODEL` securely in the server environment; use a model your account actually supports. No model name or capability is assumed. Never expose credentials through a Vite variable or commit them. The server binds to loopback and is a development server, not an authenticated public deployment.

`npm test` verifies request validation, missing-credential reporting, structured model requests, transient-error retry limits, and authorization failure handling with mocked model responses. Live output requires real model access. The workshop performs text drafting and review only; research browsing, code execution, product deployment, payments, and autonomous tool creation are not implemented.
