import assert from "node:assert/strict";
import test from "node:test";

import {
  checkCandidate,
  parseCsv,
  selectCodexLauncher,
  summarizeTrace,
} from "./eval-utils.mjs";

test("selectCodexLauncher uses a native Windows executable when one is available", () => {
  // Given
  const options = {
    platform: "win32",
    nodeExecutable: "C:\\node.exe",
    nativeExecutable: "C:\\tools\\codex.exe",
    commandDirectories: ["C:\\npm"],
    fileExists: () => true,
  };

  // When
  const launcher = selectCodexLauncher(options);

  // Then
  assert.deepEqual(launcher, {
    command: "C:\\tools\\codex.exe",
    prefix: [],
  });
});

test("selectCodexLauncher uses the npm CLI when Windows has no native executable", () => {
  // Given
  const cliPath =
    "C:\\npm\\node_modules\\@openai\\codex\\bin\\codex.js";
  const options = {
    platform: "win32",
    nodeExecutable: "C:\\node.exe",
    nativeExecutable: "",
    commandDirectories: ["C:\\npm"],
    fileExists: (candidate) => candidate === cliPath,
  };

  // When
  const launcher = selectCodexLauncher(options);

  // Then
  assert.deepEqual(launcher, {
    command: "C:\\node.exe",
    prefix: [cliPath],
  });
});

test("parseCsv parses quoted commas when the CSV contains an eval case", () => {
  // Given
  const csv = [
    "id,should_trigger,text_type,max_words,required_terms,prompt",
    'procedure,true,procedure,20,"ALM-42|48 V","Rewrite the alert, but preserve values."',
  ].join("\n");

  // When
  const cases = parseCsv(csv);

  // Then
  assert.deepEqual(cases, [
    {
      id: "procedure",
      shouldTrigger: true,
      textType: "procedure",
      maxWords: 20,
      requiredTerms: ["ALM-42", "48 V"],
      prompt: "Rewrite the alert, but preserve values.",
    },
  ]);
});

test("parseCsv gives permitted values when should_trigger is invalid", () => {
  // Given
  const csv = [
    "id,should_trigger,text_type,max_words,required_terms,prompt",
    'procedure,yes,procedure,20,,"Rewrite the procedure."',
  ].join("\n");

  // When
  const parseInvalidCsv = () => parseCsv(csv);

  // Then
  assert.throws(
    parseInvalidCsv,
    /should_trigger must be true or false/u,
  );
});

test("summarizeTrace finds a skill read in command events", () => {
  // Given
  const jsonl = [
    JSON.stringify({
      type: "item.completed",
      item: {
        type: "command_execution",
        command:
          "Get-Content C:\\\\work\\\\.agents\\\\skills\\\\simplified-technical-english\\\\SKILL.md",
      },
    }),
    JSON.stringify({
      type: "item.completed",
      item: { type: "agent_message", text: "Select the correct file." },
    }),
    JSON.stringify({
      type: "turn.completed",
      usage: { input_tokens: 120, output_tokens: 12 },
    }),
  ].join("\n");

  // When
  const summary = summarizeTrace(jsonl, "simplified-technical-english");

  // Then
  assert.deepEqual(summary, {
    invokedSkill: true,
    finalMessage: "Select the correct file.",
    commandCount: 1,
    inputTokens: 120,
    outputTokens: 12,
  });
});

test("checkCandidate reports observable procedure rule failures", () => {
  // Given
  const evalCase = {
    id: "procedure",
    shouldTrigger: true,
    textType: "procedure",
    maxWords: 5,
    requiredTerms: ["ALM-42"],
    prompt: "Rewrite the procedure.",
  };
  const trace = {
    invokedSkill: false,
    finalMessage: "You may replace the filter; then restart it immediately now.",
    commandCount: 0,
    inputTokens: 10,
    outputTokens: 10,
  };

  // When
  const result = checkCandidate(evalCase, trace);

  // Then
  assert.deepEqual(result, {
    passed: false,
    checks: {
      trigger: false,
      hasOutput: true,
      preservesTerms: false,
      sentenceLimit: false,
      basicForms: false,
    },
  });
});
