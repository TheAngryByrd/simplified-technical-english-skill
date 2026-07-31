# Simplified Technical English skill

This repository contains an unofficial agent skill for clear technical writing.

The skill applies project-aware guidance based on ASD-STE100 Simplified Technical English Issue 9.

It supports these text types:

- Code comments
- Documentation
- README content
- Change notes
- Error messages
- Procedures
- Descriptions
- Safety instructions

## Why this skill is useful

### Why ASD-STE100 exists

[ASD-STE100](https://www.asd-ste100.org/STE_downloads.html#article02-2l) is a [controlled natural language](https://en.wikipedia.org/wiki/Controlled_natural_language) and an international standard for technical documentation.

Technical readers do not always use English as their native language. Many English words also have multiple meanings and synonyms.

Complex sentence structures can also cause confusion. In aerospace, readers must understand maintenance and operation documents so systems operate safely and correctly.

The standard controls grammar, style, and vocabulary to reduce these sources of confusion.

### How the skill helps fix LLM word slop

[Large language models](https://en.wikipedia.org/wiki/Large_language_model) can produce fluent text that is vague, repetitive, or longer than necessary. This output is often called [word slop](https://en.wikipedia.org/wiki/AI_slop).

The skill replaces a general clarity request with specific checks:

- Identify the actor, action, object, condition, and expected result.
- Use one consistent term for each concept.
- Prefer active voice and direct verbs.
- Keep each sentence within a defined word limit.
- Put conditions and prerequisites before dependent actions.
- Separate instructions, descriptions, notes, and safety information.
- Preserve project terms, identifiers, measurements, and safety limits.
- Remove ambiguous pronouns, unnecessary synonyms, and hidden actions.

These constraints make LLM output easier to review. They do not prove that the output is technically correct.

Project terms and technical accuracy still take priority.

## Repository structure

The installable skill is in [`skills/simplified-technical-english`](skills/simplified-technical-english).

The repository does not include the ASD-STE100 specification.

## Install the skill

This repository follows the [Agent Skills specification](https://agentskills.io/specification).

The same skill folder works with Codex, Claude Code, OpenCode, and other compatible agent harnesses.

### Install with the Skills CLI

The Skills CLI requires [Node.js](https://nodejs.org/) `22.20.0` or newer.

Use the [Vercel Skills CLI](https://github.com/vercel-labs/skills) for automatic agent detection and installation:

```text
npx skills add TheAngryByrd/simplified-technical-english-skill
```

The command works with Windows, macOS, and Linux. It detects supported agent harnesses and selects their correct directories.

Add `--global` to install the skill for all projects. When symbolic links are unavailable, add `--copy`.

List the available skill without installing it:

```text
npx skills add TheAngryByrd/simplified-technical-english-skill --list
```

### Install manually

When `npx` is unavailable, use manual installation.

Clone the repository on Windows, macOS, or Linux:

```text
git clone https://github.com/TheAngryByrd/simplified-technical-english-skill.git
```

Choose the installation scope and harness directory:

| Harness | User directory | Project directory |
|---|---|---|
| [Codex](https://learn.chatgpt.com/docs/build-skills) | `~/.agents/skills` | `.agents/skills` |
| [Claude Code](https://code.claude.com/docs/en/skills) | `~/.claude/skills` | `.claude/skills` |
| [OpenCode](https://opencode.ai/docs/skills/) | `~/.agents/skills` or `~/.config/opencode/skills` | `.agents/skills` or `.opencode/skills` |
| Other compatible harnesses | Use the configured user skill directory. | Use the configured project skill directory. |

Copy the complete `skills/simplified-technical-english` folder into the selected directory.

From the directory that contains the cloned repository, run these commands in a POSIX shell:

```sh
mkdir -p "$HOME/.agents/skills"
cp -R \
  simplified-technical-english-skill/skills/simplified-technical-english \
  "$HOME/.agents/skills/"
```

From the directory that contains the cloned repository, run these commands in Windows PowerShell:

```powershell
New-Item -ItemType Directory -Force "$HOME\.agents\skills" | Out-Null
Copy-Item -Recurse -Force `
  .\simplified-technical-english-skill\skills\simplified-technical-english `
  "$HOME\.agents\skills\simplified-technical-english"
```

These examples use the shared Codex and OpenCode directory.

For Claude Code, replace `.agents/skills` with `.claude/skills`.

The final directory must contain this entry point:

```text
<skill-directory>/simplified-technical-english/SKILL.md
```

## Use the skill

Request the skill by name for one task:

```text
Use the simplified-technical-english skill to review README.md.
```

Use the skill for other technical text:

```text
Use the simplified-technical-english skill to rewrite this error message.
```

For continuous project guidance, add an instruction to the harness project file. For example, add this instruction to [`AGENTS.md`](https://agents.md/):

```markdown
Use the `simplified-technical-english` skill for technical prose.
```

List the detected skills after installation:

```text
npx skills list
```

The output includes `simplified-technical-english`.

If the harness does not detect the skill automatically, start a new session.

## Optional: provide the specification

The skill does not require the PDF for routine writing and review.

Provide an authorized PDF only when you need a precise source check.

Obtain ASD-STE100 Issue 9 from the [official Issue 9 request page](https://www.asd-ste100.org/STE_downloads.html#article02-2l).

Store your authorized copy at `skills/simplified-technical-english/assets/ASD-STE100-ISSUE-9.pdf`.

The repository ignores PDF files.

Do not commit the PDF.

Do not redistribute the PDF unless you have permission from [ASD](https://www.asd-europe.org/).

Set the PDF path before you request a precise source check:

```sh
export ASD_STE100_PDF="$(pwd)/skills/simplified-technical-english/assets/ASD-STE100-ISSUE-9.pdf"
```

```powershell
$env:ASD_STE100_PDF = (Resolve-Path `
  .\skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf).Path
```

### Search the PDF for precise information

The optional `search_issue_9.py` script searches your local PDF for exact rules and dictionary entries. The following examples use `uv` to run the script.

The search script uses Python and [`pypdf`](https://pypi.org/project/pypdf/) to read the PDF.

The script declares Python 3.10 or newer and `pypdf` version 5 or 6 in its inline metadata.

`uv` reads this metadata, selects a compatible Python version, and installs `pypdf` in an isolated environment. This process avoids manual environment setup.

`uv` is the documented runner, but it is not required. You can use another Python 3.10 environment that provides a compatible `pypdf` version.

Install `uv` by using the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/).

Run a bounded rule search:

```text
uv run skills/simplified-technical-english/scripts/search_issue_9.py "Rule 5.3"
```

Run a bounded dictionary search:

```text
uv run skills/simplified-technical-english/scripts/search_issue_9.py --word "may"
```

You can provide the PDF path for one command:

```text
uv run skills/simplified-technical-english/scripts/search_issue_9.py --pdf ./skills/simplified-technical-english/assets/ASD-STE100-ISSUE-9.pdf "Rule 5.3"
```

## Scope

The skill provides writing guidance. It does not include the complete standard or dictionary.

The skill does not claim certification, ASD endorsement, or complete ASD-STE100 compliance.

See [NOTICE.md](NOTICE.md) for copyright and trademark information.

## License

The original repository material uses the [MIT License](LICENSE).

The license does not apply to ASD publications or trademarks.
