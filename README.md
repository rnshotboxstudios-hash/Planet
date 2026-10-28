# Planet — educational autonomous workflow factory

Planet is a work-in-progress, game-like agent workspace for ages 10+. Read `PLANET_ANCHOR.md` for the owner's product scope and `STARNET_REFERENCE.md` for the inspected runtime reference. The main action is **Blast Off**: goal → inbox → agent plan → actual tools → handoffs → outbox. It is not a fixed website generator.

## Run development

Use Node.js 22.12+ or 24. Run `npm ci --cache /workspace/.npm-cache`, then start `npm run api` and `npm run dev` in separate terminals. The API listens on loopback port 8787; Vite proxies `/api` there. If that port is occupied, set the same `PLANET_API_PORT` in both processes. The current development instance uses 8788.

Live planning/execution requires a server-side `PLANET_AI_KEY` (or existing `OPENAI_API_KEY`) and `PLANET_MODEL` naming a model your account supports. Never expose those credentials in client code, public demo files, logs or chat. Real provider access is not yet verified. This local development API lacks account authentication and is not a public production deployment.

## Current implementation

- Original 3D warehouse room views, alien exterior, collectible-style anime agents, ambient walking, camera controls, equipment inspector and saved student creative directions.
- Two navigable room profiles: Discovery & Production and Review & Growth. These reuse a warehouse shell; arbitrary construction and a full city are not implemented.
- Galactus/Architect equipment, specialist and layout repair foundations. Automatic maintenance is internal, not a student dispatch choice.
- Persistent server inbox and per-mission workspaces under ignored `.planet-data/missions`. Model-planned stages execute bounded tool loops; real files are written to each outbox. Events and completed stages survive reconnects and runtime restarts.
- Registered mission tools: text/document/file creation, original SVG vector artwork, handoff reads, and provider-backed live web search requiring actual search-call evidence plus citations. No generic website template is invoked by Blast Off.
- Invalid local tool calls are returned to Galactus for automatic correction within a repair budget. Unavailable external connections cause an honest saved hold, never invented success.
- Income-oriented missions remain open after production, pending a verified business outcome. Public posting, authorized storefronts, transaction verification, payout adapters, raster image generation and video production are not connected yet.

`POST /api/missions` persists and starts a mission, `GET /api/missions/:id` returns real progress/outbox, and `POST /api/missions/:id/run` resumes preserved work. `GET /api/missions` lists inbox entries. Earlier draft-only API endpoints remain for the separate writing workshop; the mission runtime is the main product path.

## Verification

`npm test` exercises task dispatch, outbox file creation, handoffs, automatic tool-call correction, restart recovery, concurrent launch deduplication, missing-connection holds, source-verification requirements, sales-versus-production status, API persistence and browser-client state handling. Model/provider fixtures are clearly test doubles, not evidence of real provider access. `npm run build` validates production assets. Chromium checks cover Blast Off, persisted server inbox status, room navigation, mobile layout and removal of the old website action.

## Preview package and investor visuals

`npm run demo` produces self-contained `previews/demo/planet-demo.html` with embedded code/fonts/styles. Its local 3D views work without model credentials. Real missions require the server runtime; the downloaded file is not a standalone autonomous agent service. The ZIP includes usage notes and third-party licenses. The cloud browser blocks `file:` navigation, so the portable package is checked on plain local HTTP with supporting requests blocked.

The 40-second investor reel in `previews/year-4` illustrates Year 1 workshop → Year 4 master workshop → district → planet. It animates concept artwork with original moving overlays; it is not live twenty-room app footage. Generated design pictures and actual screenshots are labeled separately.

## Scout task presets
The Scout’s first default task option is **Scour the Galaxy**. `scout-tasks.js` stores the complete research prompt and requested limits. **Load Task** selects and saves its mission without executing any search. **Blast Off** is the separate execution action. The selected preset ID reaches the server, where the full instructions are resolved from the shared catalog rather than truncated into the short creative-direction field. A preset starts its fixed UTC research window when connected execution begins; the runtime checks its ten-minute deadline between stages and tool calls. Other fine-grained source/query limits remain instructions for the provider until source-level search accounting is implemented; they must not be claimed as independently verified runtime enforcement.

## Artist default
`role-protocols.js` stores the complete Artist-only production protocol. `galactus.js` assigns its ID to Artists during provisioning and maintenance. The mission provider supplies the full protocol to Artist execution only, while Galactus receives it as a planning reference. It is visible under **Artist → Read Artist protocol**, without replacing creative directions or launching generation. Real image-production tools still need a connected adapter; installing a prompt does not supply a paid service.
