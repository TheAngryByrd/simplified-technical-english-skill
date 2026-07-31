import { writeFileSync } from "node:fs";
import path from "node:path";

export function writeEvalReport({ results, runDirectory }) {
  writeFileSync(
    path.join(runDirectory, "summary.json"),
    `${JSON.stringify(results, null, 2)}\n`,
    "utf8",
  );
  console.table(
    results.map((result) => ({
      id: result.id,
      pass: result.passed,
      activation: result.deterministic?.checks.trigger ?? false,
      invoked: result.trace?.invokedSkill ?? false,
      rubric: result.rubric?.score ?? "not run",
      commands: result.trace?.commandCount ?? 0,
      tokens: result.trace
        ? result.trace.inputTokens + result.trace.outputTokens
        : 0,
      error: result.error ?? "",
    })),
  );
  console.log(`Artifacts: ${runDirectory}`);
}
