#!/usr/bin/env -S uv run --script
# /// script
# requires-python = ">=3.10"
# dependencies = [
#     "pypdf>=5,<7",
# ]
# ///

# ─── How to run ───
# 1. Install uv: https://docs.astral.sh/uv/getting-started/installation/
# 2. Run: uv run search_issue_9.py --pdf <PDF_PATH> "Rule 5.3"
# 3. Or set ASD_STE100_PDF and omit --pdf.
# ──────────────────

from __future__ import annotations

import argparse
import json
import os
import re
import sys
from pathlib import Path
from typing import TypedDict

try:
    from pypdf import PdfReader
except ImportError as exc:
    raise SystemExit(
        "pypdf is required. Install it with: python -m pip install pypdf"
    ) from exc


PDF_ENV_VAR = "ASD_STE100_PDF"
MAX_PAGES = 3
MAX_CONTEXT_CHARS = 800

RULE_SECTION_PAGES = {
    1: (45, 61),
    2: (63, 65),
    3: (67, 75),
    4: (77, 85),
    5: (87, 93),
    6: (95, 101),
    7: (103, 105),
    8: (107, 113),
    9: (115, 127),
}
DICTIONARY_START_PAGE = 131


class SearchHit(TypedDict):
    physical_pdf_page: int
    printed_page: str | None
    excerpt: str


class SearchResult(TypedDict):
    query: str
    mode: str
    pdf: str
    page_count: int
    returned_pages: int
    max_pages: int
    hits: list[SearchHit]


def configured_pdf() -> Path | None:
    value = os.environ.get(PDF_ENV_VAR)
    return Path(value).expanduser() if value else None


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description=(
            "Search a local Issue 9 PDF and return short excerpts from "
            "no more than three matching pages."
        )
    )
    parser.add_argument("query", nargs="?", help='Text to find, such as "Rule 5.3".')
    parser.add_argument(
        "--word",
        help="Find a dictionary word entry. This limits the search to Part 2.",
    )
    parser.add_argument(
        "--max-pages",
        type=int,
        default=MAX_PAGES,
        help="Maximum matching pages to return. The hard limit is 3.",
    )
    parser.add_argument(
        "--context-chars",
        type=int,
        default=450,
        help="Characters before and after a match. The hard limit is 800.",
    )
    parser.add_argument("--json", action="store_true", help="Return JSON.")
    parser.add_argument(
        "--pdf",
        type=Path,
        default=configured_pdf(),
        help=f"Local Issue 9 PDF. Defaults to the {PDF_ENV_VAR} value.",
    )
    args = parser.parse_args()

    if bool(args.query) == bool(args.word):
        parser.error("provide one query or one --word value")
    if args.pdf is None:
        parser.error(f"provide --pdf or set {PDF_ENV_VAR}")
    if not 1 <= args.max_pages <= MAX_PAGES:
        parser.error("--max-pages must be between 1 and 3")
    if not 50 <= args.context_chars <= MAX_CONTEXT_CHARS:
        parser.error("--context-chars must be between 50 and 800")
    return args


def physical_pages(query: str, word_search: bool, page_count: int) -> range:
    if word_search:
        return range(DICTIONARY_START_PAGE, page_count + 1)

    rule_match = re.search(r"\brule\s+([1-9])\.\d+\b", query, re.IGNORECASE)
    if rule_match:
        start, end = RULE_SECTION_PAGES[int(rule_match.group(1))]
        return range(start, min(end, page_count) + 1)

    return range(1, page_count + 1)


def match_pattern(query: str) -> re.Pattern[str]:
    return re.compile(re.escape(query), re.IGNORECASE)


def dictionary_entry_pattern(word: str) -> re.Pattern[str]:
    return re.compile(
        rf"(?im)^\s*{re.escape(word)}\s+\([^)\r\n]+\)",
        re.IGNORECASE,
    )


def printed_page(text: str) -> str | None:
    matches = re.findall(
        r"\bPage\s+([A-Z0-9]+(?:-[A-Z0-9]+)+|\d+)\b",
        text,
        re.IGNORECASE,
    )
    return matches[-1] if matches else None


def excerpt(text: str, match: re.Match[str], context_chars: int) -> str:
    start = max(0, match.start() - context_chars)
    end = min(len(text), match.end() + context_chars)
    value = re.sub(r"\s+", " ", text[start:end]).strip()
    if start:
        value = "... " + value
    if end < len(text):
        value += " ..."
    return value


def search(args: argparse.Namespace) -> SearchResult:
    pdf_path = args.pdf.expanduser().resolve()
    if not pdf_path.is_file():
        raise SystemExit(f"PDF not found: {pdf_path}")

    query = args.word or args.query
    assert query is not None

    reader = PdfReader(pdf_path)
    page_numbers = physical_pages(query, bool(args.word), len(reader.pages))

    def collect(pattern: re.Pattern[str]) -> list[SearchHit]:
        hits: list[SearchHit] = []
        for page_number in page_numbers:
            text = reader.pages[page_number - 1].extract_text() or ""
            match = pattern.search(text)
            if not match:
                continue

            hits.append(
                {
                    "physical_pdf_page": page_number,
                    "printed_page": printed_page(text),
                    "excerpt": excerpt(text, match, args.context_chars),
                }
            )
            if len(hits) >= args.max_pages:
                break
        return hits

    if args.word:
        hits = collect(dictionary_entry_pattern(query))
        if not hits:
            hits = collect(re.compile(rf"\b{re.escape(query)}\b", re.IGNORECASE))
    else:
        hits = collect(match_pattern(query))

    return {
        "query": query,
        "mode": "dictionary-word" if args.word else "text",
        "pdf": str(pdf_path),
        "page_count": len(reader.pages),
        "returned_pages": len(hits),
        "max_pages": args.max_pages,
        "hits": hits,
    }


def print_text(result: SearchResult) -> None:
    print(f"Query: {result['query']}")
    print(
        f"Matches returned: {result['returned_pages']} "
        f"(limit {result['max_pages']})"
    )
    for hit in result["hits"]:
        printed = hit["printed_page"] or "unknown"
        print()
        print(f"PDF page {hit['physical_pdf_page']} (printed page {printed})")
        print(hit["excerpt"])


def main() -> int:
    args = parse_args()
    result = search(args)
    if args.json:
        print(json.dumps(result, indent=2, ensure_ascii=False))
    else:
        print_text(result)
    return 0 if result["hits"] else 1


if __name__ == "__main__":
    sys.exit(main())
