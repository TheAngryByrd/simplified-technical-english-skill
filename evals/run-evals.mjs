import { spawnSync } from "node:child_process";
import { cpSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { writeEvalReport } from "./eval-report.mjs";
import {
  checkCandidate,
  parseCsv,
  selectCodexLauncher,
  summarizeTrace,
} from "./eval-utils.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const repositoryRoot = path.dirname(scriptDirectory);
const skillName = "simplified-technical-english";
const gitCommand = process.platform === "win32" ? "git.exe" : "git";

function codexLauncher() {
  if (process.platform !== "win32") {
    return selectCodexLauncher({ platform: process.platform });
  }

  const findExecutables = (name) =>
    runCommand({
      command: "where.exe",
      args: [name],
      cwd: repositoryRoot,
    })
      .stdout.split(/\r?\n/u)
      .filter(Boolean);
  const commandPaths = findExecutables("codex.cmd");
  return selectCodexLauncher({
    platform: process.platform,
    nodeExecutable: process.execPath,
    nativeExecutable: findExecutables("codex.exe").at(0) ?? "",
    commandDirectories: commandPaths.map((commandPath) => path.dirname(commandPath)),
    fileExists: existsSync,
  });
}

function parseArguments(argv) {
  const options = { caseId: "", model: "", runRubric: true };
  for (let index = 0; index < argv.length; index += 1) {
    switch (argv[index]) {
      case "--case":
        options.caseId = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--model":
        options.model = argv[index + 1] ?? "";
        index += 1;
        break;
      case "--skip-rubric":
        options.runRubric = false;
        break;
      default:
        throw new Error(
          `Unknown argument: ${argv[index]}. Use --case, --model, or --skip-rubric.`,
        );
    }
  }
  return options;
}

function runCommand({ command, args, cwd, input = undefined }) {
  return spawnSync(command, args, {
    cwd,
    encoding: "utf8",
    input,
    maxBuffer: 16 * 1024 * 1024,
    windowsHide: true,
  });
}

function recordCodexRun({ result, stderrPath, failureMessage }) {
  writeFileSync(stderrPath, result.stderr ?? "", "utf8");
  if (result.status !== 0) {
    throw new Error(result.error?.message ?? failureMessage);
  }
}

function codexArguments({ workspace, model, extra = [] }) {
  const args = [
    "exec",
    "--ephemeral",
    "--ignore-rules",
    "--sandbox",
    "read-only",
    "-C",
    workspace,
  ];
  if (model) args.push("--model", model);
  return [...args, ...extra];
}

function createWorkspace(caseDirectory) {
  const workspace = path.join(caseDirectory, "workspace");
  const installedSkill = path.join(
    workspace,
    ".agents",
    "skills",
    skillName,
  );
  mkdirSync(path.dirname(installedSkill), { recursive: true });
  cpSync(path.join(repositoryRoot, "skills", skillName), installedSkill, {
    recursive: true,
  });
  writeFileSync(
    path.join(workspace, "AGENTS.override.md"),
    [
      "# Eval isolation",
      "",
      "Ignore global instructions that require one skill for every response.",
      "Select a skill only when the prompt matches its description or names it explicitly.",
      "Do not apply style instructions from parent repositories.",
      "",
    ].join("\n"),
    "utf8",
  );

  const git = runCommand({ command: gitCommand, args: ["init", "--quiet"], cwd: workspace });
  if (git.status !== 0) {
    throw new Error(`git init failed: ${git.stderr} Verify that git is installed.`);
  }
  return workspace;
}

function runCandidate({ evalCase, workspace, caseDirectory, model }) {
  const result = runCommand({
    command: launcher.command,
    args: [
      ...launcher.prefix,
      ...codexArguments({ workspace, model, extra: ["--json", evalCase.prompt] }),
    ],
    cwd: workspace,
  });
  writeFileSync(path.join(caseDirectory, "trace.jsonl"), result.stdout ?? "", "utf8");
  recordCodexRun({
    result,
    stderrPath: path.join(caseDirectory, "codex.stderr.txt"),
    failureMessage: `Candidate run exited with code ${result.status}. Read codex.stderr.txt in the case artifacts.`,
  });
  return summarizeTrace(result.stdout, skillName);
}

function rubricPrompt(evalCase, candidate) {
  return `Evaluate one Simplified Technical English candidate.

Original request:
${evalCase.prompt}

Candidate:
${candidate}

Check technical meaning, text classification, preserved terms, sentence structure, and controlled language.
Use the requested text type: ${evalCase.textType}.
Use the sentence limit: ${evalCase.maxWords} words.
Do not give credit for omitted conditions, actions, results, risks, identifiers, or measurements.`;
}

function runRubric({ evalCase, candidate, workspace, caseDirectory, model }) {
  if (evalCase.textType === "none") return null;
  const outputPath = path.join(caseDirectory, "rubric.json");
  const result = runCommand({
    command: launcher.command,
    args: [
      ...launcher.prefix,
      ...codexArguments({
        workspace,
        model,
        extra: [
          "--output-schema",
          path.join(scriptDirectory, "quality-rubric.schema.json"),
          "--output-last-message",
          outputPath,
          "-",
        ],
      }),
    ],
    cwd: workspace,
    input: rubricPrompt(evalCase, candidate),
  });
  recordCodexRun({
    result,
    stderrPath: path.join(caseDirectory, "rubric.stderr.txt"),
    failureMessage: `Rubric run exited with code ${result.status}. Read rubric.stderr.txt in the case artifacts.`,
  });
  return JSON.parse(readFileSync(outputPath, "utf8"));
}

function selectCases(cases, caseId) {
  if (!caseId) return cases;
  const selected = cases.filter((evalCase) => evalCase.id === caseId);
  if (selected.length === 0) {
    throw new Error(`Unknown eval case: ${caseId}. Use an id from the prompts CSV file.`);
  }
  return selected;
}

const launcher = codexLauncher();
const options = parseArguments(process.argv.slice(2));
const cases = selectCases(
  parseCsv(
    readFileSync(
      path.join(scriptDirectory, "simplified-technical-english.prompts.csv"),
      "utf8",
    ),
  ),
  options.caseId,
);
const runId = new Date().toISOString().replaceAll(":", "-");
const runDirectory = path.join(scriptDirectory, "artifacts", runId);
mkdirSync(runDirectory, { recursive: true });

const results = [];
for (const evalCase of cases) {
  const caseDirectory = path.join(runDirectory, evalCase.id);
  mkdirSync(caseDirectory, { recursive: true });
  process.stderr.write(`Running ${evalCase.id}...\n`);

  try {
    const workspace = createWorkspace(caseDirectory);
    const trace = runCandidate({
      evalCase,
      workspace,
      caseDirectory,
      model: options.model,
    });
    const deterministic = checkCandidate(evalCase, trace);
    const rubric = options.runRubric
      ? runRubric({
          evalCase,
          candidate: trace.finalMessage,
          workspace,
          caseDirectory,
          model: options.model,
        })
      : null;
    results.push({
      id: evalCase.id,
      passed: deterministic.passed && (rubric?.overall_pass ?? true),
      deterministic,
      rubric,
      trace,
    });
  } catch (error) {
    results.push({
      id: evalCase.id,
      passed: false,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

writeEvalReport({ results, runDirectory });
if (results.some((result) => !result.passed)) process.exitCode = 1;
