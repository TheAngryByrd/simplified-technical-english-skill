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

## Repository structure

The installable skill is in [`skills/simplified-technical-english`](skills/simplified-technical-english).

The repository does not include the ASD-STE100 specification.

## Install the skill

Clone the repository:

```powershell
git clone https://github.com/TheAngryByrd/simplified-technical-english-skill.git
```

Copy the skill into your shared agent skill folder:

```powershell
Copy-Item -Recurse -Force `
  .\simplified-technical-english-skill\skills\simplified-technical-english `
  "$HOME\.agents\skills\simplified-technical-english"
```

For a Codex-only installation, copy the skill into `$HOME\.codex\skills` instead.

Restart the agent after installation.

## Provide the specification

Obtain ASD-STE100 Issue 9 from the [official Issue 9 request page](https://www.asd-ste100.org/STE_downloads.html#article02-2l).

Store your authorized copy at `skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf`.

The repository ignores PDF files. Do not commit or redistribute the PDF unless you have permission from ASD.

Set the PDF path before you request a precise source check:

```powershell
$env:ASD_STE100_PDF = (Resolve-Path `
  .\skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf).Path
```

Install `uv` by using the [official installation instructions](https://docs.astral.sh/uv/getting-started/installation/).

The script declares its Python version and dependency.

Run a bounded rule search:

```powershell
uv run skills\simplified-technical-english\scripts\search_issue_9.py "Rule 5.3"
```

Run a bounded dictionary search:

```powershell
uv run skills\simplified-technical-english\scripts\search_issue_9.py --word "may"
```

You can provide the PDF path for one command:

```powershell
uv run skills\simplified-technical-english\scripts\search_issue_9.py `
  --pdf .\skills\simplified-technical-english\assets\ASD-STE100-ISSUE-9.pdf `
  "Rule 5.3"
```

## Scope

The skill provides writing guidance. It does not include the complete standard or dictionary.

The skill does not claim certification, ASD endorsement, or complete ASD-STE100 compliance.

See [NOTICE.md](NOTICE.md) for copyright and trademark information.

## License

The original repository material uses the [MIT License](LICENSE).

The license does not apply to ASD publications or trademarks.
