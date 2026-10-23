import { text, number, flag, list, object, hash, report, unique, safePath, type Lesson, type Input } from "./core";

// A focused local experiment derived from this lesson’s reviewed presentation.
export const lesson: Lesson = {
  number: 35,
  title: "Routing with Verified Outcomes",
  description: "Routing chooses a model and effort for a task. Sending every task to an expensive configuration can waste resources, while a lightweight route may miss difficult cases.",
  concepts: ["Independent answer verification", "Confidence is not correctness", "Block fallback while a worker is uncertain"],
  scope: "Runs a bounded two-tier cascade with authored worker answers and a host-only answer key. No model benchmarking is claimed. Each run starts from a fresh local seed. The run journal stores results, not production workflow state.",
  cases: [{"id": "0", "label": "Escalate an incorrect light result", "input": {"lightAnswer": "41", "deepAnswer": "42", "lightState": "settled", "confidence": 0.99}, "expected": "passed", "checks": {"attempts": 2}}, {"id": "1", "label": "Do not duplicate an uncertain worker", "input": {"lightAnswer": "41", "deepAnswer": "42", "lightState": "uncertain", "confidence": 0.99}, "expected": "unconfirmed", "checks": {"attempts": 1}}, {"id": "2", "label": "Accept an independently correct light result", "input": {"lightAnswer": "42", "deepAnswer": "wrong", "lightState": "settled", "confidence": 0.2}, "expected": "passed", "checks": {"attempts": 1}}],
  async run(input) {

const expected="42",state=text(input,"lightState");
if(state!=="settled")return report("unconfirmed","Reconcile the existing worker before a fallback",{attempts:1,confidenceUsedAsGate:false},["Admit a light attempt","Block cascading while remote state is uncertain"]);
const first=text(input,"lightAnswer").trim()===expected,second=text(input,"deepAnswer").trim()===expected;
return report(first||second?"passed":"rejected","Selected a route using host-verified correctness",{attempts:first?1:2,acceptedTier:first?"light":second?"deep":null,reportedConfidence:number(input,"confidence"),confidenceUsedAsGate:false},["Keep the answer key out of worker context","Verify independently","Escalate only after the previous attempt settles"]);

  }
};
