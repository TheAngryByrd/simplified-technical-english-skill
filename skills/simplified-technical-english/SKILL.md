---
name: simplified-technical-english
description: Write and review technical text with project-aware ASD-STE100 Issue 9 guidance. Use for technical documentation, code comments, procedures, software text, safety instructions, and controlled-language reviews. Do not use for creative writing, casual conversation, or general translation.
---

# Simplified Technical English

Use ASD-STE100 Issue 9 as the primary controlled-language source. Apply project terminology and technical accuracy before general language preferences.

## Workflow

1. Identify the reader, task, and required result.
2. Classify the text as a procedure, description, note, or safety instruction.
3. Identify approved project terms, identifiers, and required wording.
4. Use one term for each concept.
5. Draft the smallest complete statement.
6. Apply the applicable rules in this file.
7. Load [the writing-rules reference](references/issue-9-writing-rules.md) for precise rule mapping or a detailed review.
8. Load [the dictionary reference](references/issue-9-dictionary.md) when vocabulary details are material.
9. Review each changed sentence.

Completion means that the text:

- Preserves the technical meaning.
- Uses project terms consistently.
- Contains no unresolved ambiguity.
- Includes each necessary condition, action, result, and risk.

## Core writing rules

- Use common, concrete words.
- Use a project term when it is the correct technical term.
- Use an approved word only with its approved meaning and word form.
- Use American English unless the project requires a different form.
- Use active voice.
- Use passive voice only when the agent is unknown.
- Use a clear verb for each action.
- Do not replace a clear verb with a noun phrase.
- Do not use a technical noun as a verb.
- Do not use a technical verb as a noun.
- Keep a multi-word noun to three words or fewer.
- Introduce a necessary longer term before you use a clear short form.
- Do not omit necessary words.
- Do not use contractions.
- Do not use unapproved phrasal verbs.
- Do not use a semicolon.
- Use lists when they make complex text easier to read.
- Use the same term and sentence pattern for the same object or action.

## Procedures

- Use a maximum of 20 words in each sentence.
- Write one instruction in each sentence.
- Combine instructions only when the actions occur at the same time.
- Start each instruction with an imperative verb.
- Put a condition before the command that depends on it.
- Separate the condition with a comma.
- Put each prerequisite before the dependent action.
- State the expected result when the result is important.

## Descriptions and notes

- Use a maximum of 25 words in each sentence.
- Give information gradually.
- Use one subject in each sentence.
- Use one topic in each paragraph.
- Use no more than six sentences in each paragraph.
- Repeat key terms when repetition makes the connection clear.
- Do not put instructions, requirements, limits, or safety information in a note.

## Safety instructions

- Use the project's risk label.
- Use a warning for a risk of injury or death.
- Use a caution for a risk of damage.
- Start with a clear command or condition.
- Explain the risk or possible result.
- Preserve safety wording, measurements, limits, identifiers, and part numbers.

## Code comments and software text

- Explain why the code exists.
- State the rule or non-obvious constraint that the code preserves.
- Do not restate the code.
- For a workaround, state the condition that requires it.
- Include the issue or removal condition when known.
- For an error message, name the failed operation or invalid value.
- State a corrective action when the user can correct the problem.
- Preserve the repository format when a message is not a complete sentence.

## Modal verbs

- Use `must` for an obligation.
- Use `can` for possibility, ability, or permission.
- Do not use `may` as a verb in STE text.
- Do not add `must` before a normal imperative instruction.

## Final review

Ask these questions:

- Can the reader identify the actor, action, and object?
- Can the reader distinguish information from an instruction?
- Does each condition occur before the dependent action?
- Does each project term have one meaning and one spelling?
- Can a pronoun refer to more than one noun?
- Does each procedure sentence contain 20 words or fewer?
- Does each description or note sentence contain 25 words or fewer?
- Can a reader interpret a sentence in two different ways?

Rewrite each sentence that fails a check.

## Source verification

Do not load or extract the complete source PDF into the context window.

1. Obtain Issue 9 from the [official Issue 9 request page](https://www.asd-ste100.org/STE_downloads.html#article02-2l).
2. Save the PDF as `assets/ASD-STE100-ISSUE-9.pdf`.
3. Set `ASD_STE100_PDF` to the saved PDF path.
4. Use this file for routine writing and reviews.
5. Run the bounded search script when an exact source check is necessary.
6. Read only the returned excerpt and cited page.
7. Extract no more than three adjacent PDF pages for one question.
8. Process separate rule groups during a full audit.

Run these commands from the skill folder:

```text
uv run scripts/search_issue_9.py "Rule 5.3"
uv run scripts/search_issue_9.py --word "may"
uv run scripts/search_issue_9.py --pdf ./assets/ASD-STE100-ISSUE-9.pdf "Rule 5.3"
```

Do not claim complete ASD-STE100 compliance without a complete review.

Do not claim certification or ASD endorsement.
