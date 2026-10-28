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
The default practice world uses educational examples. The Live AI Workshop connects to a Node server, generates mission-specific structured plans, equips agents with outline/draft/review tools, passes artifacts between steps, and preserves completed work locally for retries. Live model execution has not been verified with real credentials. Practice mode needs no credentials. It does not browse, code autonomously, publish products, process payments, or create real businesses. The layout reference is [StarNet by androoAGI](https://github.com/androoAGI/starnet), inspected after the user supplied the link. Planet uses original procedural geometry and interface code; no StarNet art or source was copied.

A production version needs a server-side model integration using an actually available model, secure tool execution, source-backed research, bounded retry and cost limits, adult controls for external actions, and child privacy protections. Never put API credentials in frontend code. Do not represent practice output as verified research or a deployed product.

## Live AI workshop
Start `npm run api` in one terminal and `npm run dev` in another. Vite proxies `/api` to the local Node server on port 8787. Configure `OPENAI_API_KEY` and `PLANET_MODEL` securely in the server environment; use a model your account actually supports. No model name or capability is assumed. Never expose credentials through a Vite variable or commit them. The server binds to loopback and is a development server, not an authenticated public deployment.

`npm test` verifies request validation, missing-credential reporting, structured model requests, transient-error retry limits, and authorization failure handling with mocked model responses. Live output requires real model access. The workshop performs text drafting and review only; research browsing, code execution, product deployment, payments, and autonomous tool creation are not implemented.

## Factory world
The UI is a Three.js warehouse with a cutaway structure, windows onto an alien biome, a ringed planet, original big-headed anime-style workers, work bays, and an animated conveyor. Drag the room to orbit, use +/− to zoom, and click or drop tools into the room. The camera reset button restores the default view. An Overseer can assemble all five supported practice stations with their tools. The world currently uses five fixed workflow bays, not arbitrary room editing.

The interface self-hosts its font and uses original geometry without external image downloads. A WebGL-capable browser is required for the 3D view; basic build controls remain usable if graphics initialization fails. Reduced-motion preferences disable idle character movement.

Visual updates are reviewed with an actual browser screenshot and a separately labeled generated picture. Preview images are checked into the `planet-preview` branch for HTTPS viewing.

## Investor reel and execution recovery
`previews/year-4/planet-year4-investor-reel.mp4` is a silent 40-second animated concept reel: Year 1 workshop, Year 4 master workshop, district, planet (10 seconds each). The original concept plates remain static; independently animated crew sprites, parcels, and energy overlays illustrate proposed motion. This is not live app footage. Reproduce with `python scripts/render-concept-reel.py` using Pillow and ffmpeg.

The actual 3D app also has ambient walking/visiting/work gestures and a LIFE pause control. The server caches validated successful model-step artifacts atomically under ignored `.planet-data/outputs`; failed requests remain retryable and identical simultaneous requests share one execution. Tests cover restart recovery and retry behavior with injected tool functions. Real model execution is still unverified pending a secure server credential (`PLANET_AI_KEY`, or an existing `OPENAI_API_KEY`) and an available `PLANET_MODEL`. The proxy-secret destination is `api.openai.com`.

## Galactus and Architect foundation
Read `PLANET_ANCHOR.md` for the owner's authoritative product requirements and provisional architecture assumptions. `galactus.js` provides role kits, a two-room blueprint, equipment/bay preflight, automatic Architect dispatch, specialist creation, bounded repair, and result verification through injected tool adapters. `POST /api/blueprint` returns a proposed equipment/team manifest, explicitly marked not connected to real execution. The mission workspace now renders two navigable room views from the crew manifest; live service execution remains separate. Tests inject tool failures and prove automatic repairs without student dispatch; external research/image/video/promotion/scaling adapters are not implemented by those tests.

## Two-room mission workspace
Select **Plan my team** or **Mission rooms**. Galactus provisions Discovery & Production (Scout, Artist/Video producer, Builder) and Review & Growth (Reviewer, Promoter, Scaler). Each room has its own rendered crew, labeled bays, contextual equipment and saved creative directions. These views currently use the same original warehouse shell with different equipment profiles; arbitrary construction and planet navigation are not implemented yet.

The **Build website draft** action runs a local packaging adapter followed by a structural-review adapter through Galactus, producing an actual downloadable HTML website. Student instructions are escaped into the creative brief. A sandboxed preview is available. This is template-generated output, not AI-generated art or web research, and is not deployed or payment-enabled. Equipment/bay discrepancies are repaired at workspace opening and preflight. Persistent room state, directions and generated drafts are saved on this browser.

Run `npm run demo` to build a self-contained `previews/demo/planet-demo.html` with embedded fonts, code and styles. The downloadable ZIP includes this file and usage notes. The standalone package has been checked on a plain local HTTP server with all supporting network requests blocked; this tests that its local rooms and template export need no asset server or model service. The cloud browser's administrative policy blocks `file:` navigation, so direct double-click opening was not verified in this execution environment. Use a local HTTP server if your browser blocks local HTML.
