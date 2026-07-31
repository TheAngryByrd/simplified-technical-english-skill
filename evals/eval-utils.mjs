import path from "node:path";

export function selectCodexLauncher({
  platform,
  nodeExecutable,
  nativeExecutable,
  commandDirectories,
  fileExists,
}) {
  if (platform !== "win32") return { command: "codex", prefix: [] };
  if (nativeExecutable) return { command: nativeExecutable, prefix: [] };

  const cliDirectories = [path.win32.dirname(nodeExecutable), ...commandDirectories];
  const cliPath = cliDirectories
    .map((directory) =>
      path.win32.join(
        directory,
        "node_modules",
        "@openai",
        "codex",
        "bin",
        "codex.js",
      ),
    )
    .find(fileExists);
  if (cliPath) return { command: nodeExecutable, prefix: [cliPath] };

  throw new Error("Install Codex with npm or add codex.exe to PATH.");
}

function parseRows(csv) {
  const rows = [];
  let row = [];
  let field = "";
  let quoted = false;

  for (let index = 0; index < csv.length; index += 1) {
    const character = csv[index];
    const next = csv[index + 1];

    if (character === '"' && quoted && next === '"') {
      field += '"';
      index += 1;
    } else if (character === '"') {
      quoted = !quoted;
    } else if (character === "," && !quoted) {
      row.push(field);
      field = "";
    } else if ((character === "\n" || character === "\r") && !quoted) {
      if (character === "\r" && next === "\n") index += 1;
      row.push(field);
      if (row.some((value) => value.length > 0)) rows.push(row);
      row = [];
      field = "";
    } else {
      field += character;
    }
  }

  if (quoted) {
    throw new Error("CSV contains an unclosed quoted field. Add the closing double quote.");
  }
  row.push(field);
  if (row.some((value) => value.length > 0)) rows.push(row);
  return rows;
}

export function parseCsv(csv) {
  const [header, ...rows] = parseRows(csv.trim());
  const expectedHeader = [
    "id",
    "should_trigger",
    "text_type",
    "max_words",
    "required_terms",
    "prompt",
  ];

  if (header?.join(",") !== expectedHeader.join(",")) {
    throw new Error(`CSV header must be: ${expectedHeader.join(",")}`);
  }

  return rows.map((values, index) => {
    if (values.length !== expectedHeader.length) {
      throw new Error(
        `CSV row ${index + 2} has ${values.length} fields. Use exactly ${expectedHeader.length} fields.`,
      );
    }

    const [id, trigger, textType, maxWords, terms, prompt] = values;
    if (trigger !== "true" && trigger !== "false") {
      throw new Error(`CSV row ${index + 2} should_trigger must be true or false.`);
    }
    if (!new Set(["procedure", "description", "note", "safety", "none"]).has(textType)) {
      throw new Error(
        `CSV row ${index + 2} text_type must be procedure, description, note, safety, or none.`,
      );
    }

    const parsedMaxWords = Number.parseInt(maxWords, 10);
    if (!Number.isInteger(parsedMaxWords) || parsedMaxWords < 0) {
      throw new Error(`CSV row ${index + 2} max_words must be a nonnegative integer.`);
    }

    return {
      id,
      shouldTrigger: trigger === "true",
      textType,
      maxWords: parsedMaxWords,
      requiredTerms: terms ? terms.split("|") : [],
      prompt,
    };
  });
}

export function summarizeTrace(jsonl, skillName) {
  const events = jsonl
    .split(/\r?\n/u)
    .filter(Boolean)
    .map((line) => JSON.parse(line));
  const commandItems = events
    .filter((event) => event.type === "item.completed")
    .map((event) => event.item)
    .filter((item) => item?.type === "command_execution");
  const agentMessages = events
    .filter((event) => event.type === "item.completed")
    .map((event) => event.item)
    .filter((item) => item?.type === "agent_message");
  const completedTurn = events.findLast((event) => event.type === "turn.completed");
  const skillPath = `/skills/${skillName}/skill.md`.toLowerCase();

  return {
    // Codex JSONL has no skill event, so a SKILL.md read is the observable activation signal.
    invokedSkill: commandItems.some(
      (item) =>
        typeof item.command === "string" &&
        item.command.replace(/[\\/]+/gu, "/").toLowerCase().includes(skillPath),
    ),
    finalMessage: agentMessages.at(-1)?.text ?? "",
    commandCount: commandItems.length,
    inputTokens: completedTurn?.usage?.input_tokens ?? 0,
    outputTokens: completedTurn?.usage?.output_tokens ?? 0,
  };
}

function wordCount(value) {
  return value.match(/[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*/gu)?.length ?? 0;
}

function sentences(value) {
  return value
    .replace(/```[\s\S]*?```/gu, " ")
    .split(/(?<=[.!?])\s+|\r?\n+/u)
    .map((sentence) => sentence.replace(/^\s*(?:[-*#]+|\d+[.)])\s*/u, "").trim())
    .filter(Boolean);
}

function passesBasicFormChecks(value) {
  const contraction = /\b(?:can't|couldn't|didn't|doesn't|don't|hadn't|hasn't|haven't|isn't|shouldn't|wasn't|weren't|won't|wouldn't|you'll|you're|you've|they'll|they're|they've|we'll|we're|we've|it's)\b/iu;
  return !value.includes(";") && !contraction.test(value) && !/\bmay\b/iu.test(value);
}

export function checkCandidate(evalCase, trace) {
  const checks = {
    trigger: trace.invokedSkill === evalCase.shouldTrigger,
    hasOutput: trace.finalMessage.trim().length > 0,
    preservesTerms: evalCase.requiredTerms.every((term) =>
      trace.finalMessage.includes(term),
    ),
    sentenceLimit:
      evalCase.maxWords === 0 ||
      sentences(trace.finalMessage).every(
        (sentence) => wordCount(sentence) <= evalCase.maxWords,
      ),
    basicForms:
      evalCase.textType === "none" || passesBasicFormChecks(trace.finalMessage),
  };

  return {
    passed: Object.values(checks).every(Boolean),
    checks,
  };
}
