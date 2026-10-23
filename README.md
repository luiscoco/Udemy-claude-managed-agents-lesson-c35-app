# C35 · Routing with Verified Outcomes

Runs a bounded two-tier cascade with authored worker answers and a host-only answer key. No model benchmarking is claimed. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.

## Concepts students will learn

- Independent answer verification
- Confidence is not correctness
- Block fallback while a worker is uncertain

## Configure and run

Use Node.js 24 or later. In PowerShell, from this repository's folder:

```powershell
node --version
npm ci
Copy-Item .env.example .env
notepad .env
```

No API key is required for the local experiment. Optional live commentary requires your own API key, agent ID and environment ID. It explains the local result; it does not activate the integration discussed in the lesson.

For the optional live path, set your API key, then run npm run setup if you do not already have resource IDs. The script creates the environment before a text-only agent, saves each ID immediately, and reuses IDs already configured. It uses CLAUDE_MODEL or the source default; choose a model available to your account. An uncertain network failure may have created a resource: inspect your account before retrying.

```powershell
npm start
```

Open `http://127.0.0.1:3035`. Navigation leads to `/guide.html#learning`, `/guide.html#run-guide`, `/architecture.html`, and the application lab. If you change `PORT`, use the configured port. Keep the terminal running; stop with Ctrl+C. `npm run dev` also starts the web application.

Select the first scenario, inspect its editable fields, press Run experiment, and compare the outcome and evidence with the table above. Select another scenario to investigate the boundary condition.

## Create your .env file

Copy `.env.example` to `.env` and enter your own values. Do not commit the real file. Restart the server after editing it. The example contains safe placeholders; optional settings may be left blank to use source defaults. Resource IDs and keys stay on the server.

```dotenv
ANTHROPIC_API_KEY=your_api_key
CLAUDE_MANAGED_AGENT_ID=your_agent_id
CLAUDE_MANAGED_ENVIRONMENT_ID=your_environment_id
PORT=3035
```

## How the app was build

### 1. Block fallback while the first worker is unsettled

The existing attempt must be settled before another route is considered. Unknown remote state is unconfirmed rather than an invitation to create a second worker.

Source: [src/lesson.ts](src/lesson.ts#L13) · selected statements

```typescript
const expected = "42",
  state = text(input, "lightState");

if (state !== "settled")
  return report(
    "unconfirmed",
    "Reconcile the existing worker before a fallback",
    { attempts: 1, confidenceUsedAsGate: false },
    ["Admit a light attempt", "Block cascading while remote state is uncertain"],
  );
```

### 2. Select a tier using host-checked correctness

Answers are compared with the local answer key. Reported confidence is retained as evidence but never controls acceptance; the reducer plans one or two attempts without launching either worker.

Source: [src/lesson.ts](src/lesson.ts#L15) · selected statements

```typescript
const first = text(input, "lightAnswer").trim() === expected,
  second = text(input, "deepAnswer").trim() === expected;

return report(
  first || second ? "passed" : "rejected",
  "Selected a route using host-verified correctness",
  {
    attempts: first ? 1 : 2,
    acceptedTier: first ? "light" : second ? "deep" : null,
    reportedConfidence: number(input, "confidence"),
    confidenceUsedAsGate: false,
  },
  [
    "Keep the answer key out of worker context",
    "Verify independently",
    "Escalate only after the previous attempt settles",
  ],
);
```

### Check your understanding

Run **Escalate an incorrect light result** in the application. Compare the result with these scenario expectations:

```json
{
  "input": {
    "lightAnswer": "41",
    "deepAnswer": "42",
    "lightState": "settled",
    "confidence": 0.99
  },
  "expectedOutcome": "passed",
  "checkEvidence": {
    "attempts": 2
  }
}
```

Then try **Do not duplicate an uncertain worker**. Its expected outcome is `unconfirmed`; identify the condition or evidence field that explains the difference.

## Validation

```powershell
npm test
python scripts/verify-walkthrough.py
```

The source hash check detects when walkthrough excerpts need refreshing. Browser verification covers page navigation, readable text, mobile layout, dark mode, diagram and image routes. Local scenarios and live provider calls are recorded separately in the workspace verification report; local success is not evidence of a live provider operation.

## Repository contents

Application sources, student web pages, safe configuration example and documentation images are included. `node_modules`, `presentation`, `output`, `reviewed`, `v3`, `teaching-material`, build output, local journals, credentials and local resource files are ignored. Existing teaching videos and presentations remain in the original workspace.
