#!/usr/bin/env python3
"""Render paper.src.md into paper.md by replacing every {{path}} with the value
stored at that path in results.json, so that no number in the paper is typed
by hand.

    {{solar_terms/imcce_rounded_minutes/mae}}       value as stored
    {{solar_terms/imcce_unrounded_seconds/min|+.1f}} Python format spec
    {{utc7_vs_utc8/tet_years_differ|list}}          list joined with ", " (no separators)
    {{midnight/tet_closest_2026-2100/year|d}}        integer without separator
    {{new_moons/nasa_minutes/min|abs}}              absolute value
    {{utc7_vs_utc8/tet_years_differ|len}}           length of a list
    {{provenance/data_files/nasa/sha256|short}}     first 16 characters
    {{a/b|abs|.0f}}                                 specs apply left to right

Path segments are separated by "/"; a numeric segment indexes a list.
Integers are written with thousands separators, and a leading minus sign is
written as the Unicode minus. A missing path is an error.

    python3 fill.py paper.src.md results.json results-vsop.json > paper.md

Further JSON files are merged under a key taken from their name:
results-vsop.json becomes {{vsop/...}}.
"""

import json
import re
import sys

PATTERN = re.compile(r"\{\{([^{}|]+)(?:\|([^{}]+))?\}\}")


def lookup(data, path):
    cur = data
    for seg in path.strip().split("/"):
        if isinstance(cur, list):
            cur = cur[int(seg)]
        elif isinstance(cur, dict) and seg in cur:
            cur = cur[seg]
        else:
            raise KeyError(path)
    return cur


def fmt_number(v, spec=None):
    if isinstance(v, bool):
        return str(v).lower()
    if spec:
        out = format(v, spec)
    elif isinstance(v, int):
        out = format(v, ",")
    else:
        out = repr(v) if isinstance(v, float) else str(v)
    return out.replace("-", "−") if out.startswith(("-", "+-")) else out


def render(value, spec):
    if spec and "|" in spec:
        first, rest = spec.split("|", 1)
        if first == "abs":
            return render(abs(value), rest)
        raise ValueError(spec)
    if spec == "list":
        # lists hold years and small counts: no thousands separator
        return ", ".join(str(x) for x in value)
    if spec == "len":
        return str(len(value))
    if spec == "short":
        return str(value)[:16]
    if spec == "abs":
        return fmt_number(abs(value))
    if isinstance(value, (int, float)):
        return fmt_number(value, spec)
    return str(value)


def main():
    src, res, extra = sys.argv[1], sys.argv[2], sys.argv[3:]
    with open(res, encoding="utf-8") as f:
        data = json.load(f)
    for path in extra:
        key = path.rsplit("/", 1)[-1].replace("results-", "").replace(".json", "")
        with open(path, encoding="utf-8") as f:
            data[key] = json.load(f)
    with open(src, encoding="utf-8") as f:
        text = f.read()
    missing = []

    def sub(m):
        try:
            return render(lookup(data, m.group(1)), m.group(2))
        except (KeyError, IndexError, ValueError, TypeError):
            missing.append(m.group(0))
            return m.group(0)

    out = PATTERN.sub(sub, text)
    if missing:
        sys.stderr.write("unknown paths:\n  " + "\n  ".join(missing) + "\n")
        sys.exit(1)
    sys.stdout.write(out)


if __name__ == "__main__":
    main()
