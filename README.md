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

Technical content can be accurate and still be difficult to follow. This skill gives agents a repeatable process for writing clearer text.

The skill helps teams:

- Put conditions and prerequisites before dependent actions.
- Use one consistent term for each concept.
- Separate instructions, descriptions, notes, and safety information.
- Keep procedures and descriptions within defined sentence limits.
- Preserve project terms, identifiers, measurements, and safety limits.
- Write comments that explain rules and non-obvious constraints.
- Check exact rules and dictionary entries without loading the complete PDF.

These checks help readers identify the actor, action, object, condition, and expected result.

## Repository structure

The installable skill is in [`skills/simplified-technical-english`](skills/simplified-technical-english).

The repository does not include the ASD-STE100 specification.

## Install the skill

This repository follows the [Agent Skills specification](https://agentskills.io/specification).

The same skill folder works with Codex, Claude Code, OpenCode, and other compatible agent harnesses.

### Install with the Skills CLI

Use the [Vercel Skills CLI](https://github.com/vercel-labs/skills) for automatic agent detection and installation:

The current CLI requires Node.js `22.20.0` or newer.

```text
npx skills add TheAngryByrd/simplified-technical-english-skill
```

The command works with Windows, macOS, and Linux. It detects supported agent harnesses and selects their correct directories.

Add `--global` to install the skill for all projects. Add `--copy` when symbolic links are unavailable.

List the available skill without installing it:

```text
npx skills add TheAngryByrd/simplified-technical-english-skill --list
```

### Install manually

Use manual installation when `npx` is unavailable.

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

Use these commands with macOS, Linux, or another POSIX shell:

```sh
mkdir -p "$HOME/.agents/skills"
cp -R \
  simplified-technical-english-skill/skills/simplified-technical-english \
  "$HOME/.agents/skills/"
```

Use these commands with Windows PowerShell:

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

Start a new session if the harness does not detect the skill automatically.

## Provide the specification

Obtain ASD-STE100 Issue 9 from the [official Issue 9 request page](https://www.asd-ste100.org/STE_downloads.html#article02-2l).

Store your authorized copy at `skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf`.

The repository ignores PDF files. Do not commit or redistribute the PDF unless you have permission from ASD.

Set the PDF path before you request a precise source check:

```sh
export ASD_STE100_PDF="$(pwd)/skills/simplified-technical-english/assets/ASD-STE100-ISSUE-9.pdf"
```

```powershell
$env:ASD_STE100_PDF = (Resolve-Path `
  .\skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf).Path
```

Install `uv` by using the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/).

The script declares its Python version and dependency.

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
