# StarNet's function and Planet's implementation direction

Inspected source: https://github.com/androoAGI/starnet at commit `8e8311987eaf2ddc49cfc1e31f2dc3a7dcba3bec`.

The current README describes a local-first desktop agent harness, not a website creator. A room is a capability-scoped team; a hallway is an authorized handoff; a placed object grants a real tool capability. Agents run model → tool → result loops with their own workspace, persisted transcripts, budgets and permissions. Real deliverables appear as files in an OUTBOX. Its README explicitly says revenue, work, model activity and spend must not be simulated as real.

The actual `sidecar/loop.js` source confirms bounded agent runs, dispatch, paired tool results, cancellation/budget guards and observable events. `docs/HARNESS_ARCHITECTURE.md` is a reference/target document, not independent proof every described feature shipped; current README and source were inspected together.

Planet follows that general runtime approach with its own code and artwork. The student says what business outcome they want; Galactus assembles capabilities, supplies equipment, dispatches actual tools, delegates repair to the Architect and advances typed handoffs. Blast Off launches the mission, rather than choosing a canned website output. The first implementation supports outbox file tools, SVG vector artwork, and a provider-backed cited search adapter. Image/video service production and external publishing/sales require their own connected adapters.

A website is a possible deliverable only when the task asks for it. A file is not a sale. A revenue objective remains open until an authorized transaction can be verified. No sales connector or payment integration has been implemented yet.

StarNet source was read for understanding; no StarNet source code, art, sprites or brand assets were copied in this implementation.
