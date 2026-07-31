# ASD-STE100 Issue 9 dictionary

Use this reference when a review depends on an approved word, meaning, part of speech, word form, technical noun, or technical verb.

The source is Part 2 of `../assets/ASD-STE100-ISSUE-9.pdf`. The dictionary introduction starts on printed page 2-0-3, PDF page 131.

## Dictionary scope

Issue 9 states that the dictionary contains:

- 875 approved words.
- 1,274 selected words that are not approved.
- Approved meanings and parts of speech.
- Approved verb and adjective forms.
- STE examples and non-STE examples.
- Approved alternatives for selected non-approved words.

The dictionary does not contain the complete set of technical nouns and technical verbs for a project. The project or industry must control those terms.

## How to read an entry

The dictionary has four columns:

1. The word and its part of speech.
2. The approved meaning or approved alternatives.
3. An STE example.
4. A non-STE example.

An uppercase entry is approved. A lowercase entry is not approved. Use an approved word only with the part of speech, meaning, and forms that the entry permits.

The dictionary uses these identifiers:

- `(TN)` means technical noun.
- `(TV)` means technical verb.

Do not treat an approved alternative as a safe word-for-word replacement when the sentence structure or technical meaning must also change. Rule 9.1 requires a different sentence construction when direct replacement is insufficient.

## Review procedure

1. Preserve product names, identifiers, measurements, part numbers, and approved project terms.
2. Identify each word that is not a project technical noun or technical verb.
3. Find the dictionary entry in the PDF.
4. Check capitalization status, part of speech, approved meaning, and permitted form.
5. Use the entry's example to verify the intended construction.
6. If the entry is not approved, use an approved alternative only when it preserves the meaning.
7. Rewrite the sentence when a direct replacement causes ambiguity or incorrect grammar.
8. Recheck the final sentence.

## Important Issue 9 entries

- `MUST (v)` is approved to show obligation.
- `CAN (v)` is approved for possibility, ability, or permission.
- `may (v)` is not approved; the dictionary gives `CAN (v)` as the alternative.

Use `must` carefully in procedures. Rule 5.3 says not to put `must` before an imperative command unless the obligation is safety-critical or expresses an important condition.

## Technical terminology

Create or use a project glossary that records:

- The approved term.
- Its part of speech.
- Its single intended meaning.
- Permitted forms.
- Forbidden synonyms or obsolete terms.

When project terminology conflicts with a general writing preference, preserve the accurate project term and make the surrounding sentence clear.

## Source verification

Run `../scripts/search_issue_9.py --word "<word>"` when:

- An exact approved meaning is material.
- A word can have more than one part of speech.
- An alternative can change the technical meaning.
- A compliance claim depends on the entry.

Read only the returned excerpt and cited page. Do not infer dictionary approval from common English usage.
