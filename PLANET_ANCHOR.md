# Planet — working product anchor

This is the working scope provided by the owner. It supersedes any earlier framing of recovery as asking a student to diagnose a run or decide which maintenance agent to send. Future coding tasks must read this file before changing product behavior. The current app is still a prototype; this document is a target, not a list of shipped capabilities.

## What the student does

Planet is a hybrid educational game and real online-business workspace for ages 10+. The student chooses a business idea, gives creative direction, changes research instructions, revises/approves products, and designs the planet. Tedious AI configuration, dependency diagnosis, tool assignment, routing, and routine maintenance are Planet's responsibility. Income is an intended real business outcome, not a guaranteed game reward.

## Galactus and the Architect

Galactus is the working name of the Overseer/Manager. It translates a mission into a team and workflow, supplies each role's tools and dependencies, monitors the work, diagnoses errors, and applies and verifies repairs. It may create specialist/replacement agents when a task needs them, change the workflow, and retry the affected step while keeping completed work.

The Architect is automatically delegated equipment, desk/workstation, bay, conveyor, communications, room-size, placement, and routing discrepancies. Students never choose whether to dispatch Galactus or the Architect. Galactus stays responsible for the result and explains repairs in child-readable language. A repair is successful only after the relevant check or task succeeds; retrying alone is not repair.

Capabilities must be real registered tools with authorization, supported inputs/outputs, preflight checks, retry/recovery rules, and observability. The visual desk, bay, or satellite represents a capability provisioned by Planet; the student need not know the hidden prerequisite. Galactus should eventually use coding/build tools through an isolated execution environment for supported repairs, with tests and rollback. It must not claim tools, access, research, deployments, or funds that have not actually worked.

## Roles and student direction

- Scout/researcher: communications and research workstation automatically supplied. Search broadly; accept student-specified niche sources, undiscovered communities, demographics, and research questions. Distinguish sourced evidence from assumptions.
- Artist: image tools and art workstation automatically supplied. Iterate on product designs and audience appeal; student can request revisions or approve work without a hard-coded product revision count. Usage costs remain visible and controlled by account policy.
- Video producer: video tools, storage and rendering workstation supplied when the mission needs video.
- Builder/publisher: create and package the product/site/deliverable using supported tools.
- Reviewer: check accuracy, quality, rights and release readiness before delivery.
- Promotional agent: find relevant free channels and prepare promotional material. Posting uses authorized accounts and channel rules; the account's adult/school authorization policy controls external actions. The student is not required to configure a posting pipeline manually.
- Scaler: react to verified sales and agreed thresholds, propose/apply allowed capacity and workflow changes. Simulated revenue cannot trigger real spending or scaling.

## World and learning

Start with a warehouse room. Expand naturally into rooms, floors, buildings and a planet. Fix awkward space/layout automatically rather than emitting placement errors. Show workstations, inboxes, bays and handoffs in an understandable workplace metaphor. Use original oversized-head anime collectible characters, octagonal/bevelled Minecraft-inspired construction, thick readable borders, green/wood/stone palette, and alien landscapes outside buildings. Ambient Sims/StarNet-like motion does not count as actual task completion.

Students learn workflow design, workplace organization, delegation, quality, customer needs and scaling by doing. Create a tutorial/educational video and a teacher-ready curriculum with lessons, exercises, assessment rubrics and classroom guidance. The commercial product includes software and curriculum for schools/academies.

## Real-world connections

Real business accounts, public posting, storefronts, payment providers and teen payouts need supported integrations and verified eligibility. Guardian/school permissions should be established at account setup, rather than turning every routine operation into a student troubleshooting decision. Country, age, provider and school requirements must be checked before enabling earning/payout functions. Do not present a universal legal entitlement to income for all under-16 users.

## Implementation and owner-review assumptions

These are provisional design choices for owner review after a concrete one/two-room demonstration exists:

1. Two starting rooms: Discovery & Production; Review & Growth. A shared inbox distributes typed tasks; deliverables move through dependency-checked handoffs.
2. Role templates provision capability manifests automatically. An adapter registry connects tools to actual service credentials and availability. Visual equipment is derived from that manifest.
3. Galactus runs preflight → execute → classify error → dispatch repair → verify → continue. Architect repairs are separate internal tasks with no student dispatch choice.
4. Automatic repairs have time/cost/attempt budgets and recorded changes. Exhausted attempts become an honest managed hold with Galactus preserving work and notifying the account administrator only if external action is necessary. No endless retry loop or false success.
5. Student directions are versioned mission inputs. A changed artistic/research instruction invalidates affected downstream outputs, not unrelated completed work. Approval is a creative decision, separate from equipment repair.
6. Promotional posting and revenue-driven scaling are disabled until the corresponding adapters, permissions and verification tests exist. Delivery and integration status remain explicit.

## Acceptance demonstration

Use an owner's business idea to build one or two actual rooms. Show the idea becoming a team with the right capabilities, student-directed research/design revisions, real downloadable outputs, and a working pipeline. Deliberately remove equipment, introduce a layout contradiction, and omit a specialist. Galactus must automatically assign repairs/add the specialist, verify the fix, and continue without asking the student to troubleshoot or dispatch the Architect. Separately prove that unavailable credentials/permissions are not misrepresented as a successful repair. Add public posting, verified sales triggers and payouts only after their own end-to-end validation.

## Primary-action correction

The main action is **Blast Off**: send the student's goal into the task inbox and execute a goal-specific agent pipeline. Planet is not a website builder. Do not use a fixed website template or generic report as a substitute for a requested business task. If the objective is a sale, production files alone do not satisfy that objective: track production, authorized listing/promotion and the verified transaction as distinct states. The real runtime's events, tool receipts and outbox drive work status; ambient animation does not.
