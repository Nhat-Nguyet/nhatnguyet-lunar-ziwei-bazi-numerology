#!/usr/bin/env python3
"""Score a model's answers on the Nhat Nguyet AI evaluation set.

    python3 ai-eval/score.py answers.jsonl
    python3 ai-eval/score.py answers.jsonl --json summary.json
    python3 ai-eval/score.py --self-test

answers.jsonl has one line per question: {"id": "<question id>", "answer": ...}
where "answer" is the JSON object the question asks for, or the model's raw
reply as a string (the first JSON object in it is used). A question with no
answer line counts as wrong.

Names (stems, branches, pillars, solar terms, bureaus) are accepted in
Vietnamese (with or without diacritics when that is unambiguous), English or
pinyin (with or without tones) and Chinese characters (simplified or
traditional), through the Nhat Nguyet terminology dataset
(du-lieu/terminology/terminology.json). Solar-term moments are right when the
date and time are within one minute of the reference.

Standard library only, Python 3.9+. Data: Nhat Nguyet (nhatnguyet.org).
"""

import argparse
import json
import os
import re
import sys
import unicodedata
from datetime import datetime

HERE = os.path.dirname(os.path.abspath(__file__))
QUESTIONS = os.path.join(HERE, "questions.jsonl")
GLOSSARY = os.path.join(HERE, "..", "du-lieu", "terminology", "terminology.json")

TASK_CATEGORY = {
    "day_pillar": "sexagenary-cycle",
    "year_pillar": "sexagenary-cycle",
    "bazi_pillars": "sexagenary-cycle",
    "solar_term_on_date": "solar-term",
    "ziwei_life_palace": "earthly-branch",
    "ziwei_star_palace": "earthly-branch",
    "ziwei_bureau": "ziwei-bureau",
}
TASK_KEY = {
    "day_pillar": "pillar",
    "year_pillar": "pillar",
    "solar_term_on_date": "solar_term",
    "ziwei_life_palace": "branch",
    "ziwei_star_palace": "branch",
    "ziwei_bureau": "bureau",
}
PILLARS = ("year", "month", "day", "hour")


# ------------------------------------------------------------------ names

def _exact(s):
    s = unicodedata.normalize("NFC", str(s)).strip().lower()
    return re.sub(r"[\s\-_.·,'\"]+", "", s)


def _folded(s):
    s = unicodedata.normalize("NFD", _exact(s)).replace("đ", "d")
    s = "".join(c for c in s if not unicodedata.combining(c))
    return s.replace("ü", "u")


class Names:
    """Map any accepted spelling of a term to its glossary id, per category."""

    def __init__(self, path):
        with open(path, encoding="utf-8") as f:
            rows = json.load(f)["terms"]
        self.exact = {}
        folded = {}
        for r in rows:
            cat = r["category"]
            spellings = [r["vi"], r["en"], r["zh"], r["han"], r["pinyin"], r["code"]]
            spellings += [x for x in r["vi_alt"].split("|") if x]
            spellings += [x for x in r["en_alt"].split("|") if x]
            for s in spellings:
                if not s:
                    continue
                self.exact.setdefault((cat, _exact(s)), set()).add(r["id"])
                folded.setdefault((cat, _folded(s)), set()).add(r["id"])
        # A folded spelling is accepted only when it points to one term
        # ("Ty" could be Tý or Tỵ, so it is not).
        self.folded = {k: next(iter(v)) for k, v in folded.items() if len(v) == 1}
        self.exact = {k: next(iter(v)) for k, v in self.exact.items() if len(v) == 1}

    def id(self, category, value):
        if value is None:
            return None
        if isinstance(value, dict):
            for k in ("vi", "en", "zh", "name"):
                if k in value:
                    return self.id(category, value[k])
            return None
        if category == "ziwei-bureau" and re.fullmatch(r"\s*[2-6]\s*", str(value)):
            value = str(value).strip()
        return self.exact.get((category, _exact(value))) or self.folded.get((category, _folded(value)))


# ------------------------------------------------------------------ answers

def first_json(text):
    """The first balanced JSON object in a string, or None."""
    if not isinstance(text, str):
        return None
    start = text.find("{")
    while start >= 0:
        depth = 0
        in_str = False
        esc = False
        for i in range(start, len(text)):
            c = text[i]
            if in_str:
                if esc:
                    esc = False
                elif c == "\\":
                    esc = True
                elif c == '"':
                    in_str = False
            elif c == '"':
                in_str = True
            elif c == "{":
                depth += 1
            elif c == "}":
                depth -= 1
                if depth == 0:
                    try:
                        return json.loads(text[start:i + 1])
                    except ValueError:
                        break
        start = text.find("{", start + 1)
    return None


def as_object(answer):
    if isinstance(answer, dict):
        return answer
    return first_json(answer) if isinstance(answer, str) else None


def as_int(x):
    try:
        if isinstance(x, bool):
            return None
        return int(str(x).strip())
    except (TypeError, ValueError):
        return None


def as_bool(x):
    if isinstance(x, bool):
        return x
    s = str(x).strip().lower()
    if s in ("true", "yes", "1", "leap", "có", "là", "是", "闰"):
        return True
    if s in ("false", "no", "0", "không", "否", ""):
        return False
    return None


def as_date(x):
    m = re.search(r"(\d{4})-(\d{1,2})-(\d{1,2})", str(x or ""))
    return f"{int(m.group(1)):04d}-{int(m.group(2)):02d}-{int(m.group(3)):02d}" if m else None


def as_time(x):
    m = re.search(r"(\d{1,2}):(\d{2})", str(x or ""))
    return (int(m.group(1)), int(m.group(2))) if m else None


# ------------------------------------------------------------------ scoring

def score_item(q, answer, names):
    """Return (correct, detail) for one question; detail counts BaZi pillars."""
    task = q["task"]
    gold = q["answer"]
    obj = as_object(answer)
    if task == "lunar_date":
        if not obj:
            return False, None
        ok = all(as_int(obj.get(k)) == gold[k] for k in ("year", "month", "day"))
        return ok and as_bool(obj.get("leap", False)) == gold["leap"], None
    if task == "tet_date":
        return (as_date((obj or {}).get("date", answer if isinstance(answer, str) else None)) == gold["date"]), None
    if task == "solar_term_moment":
        if not obj:
            return False, None
        d, t = as_date(obj.get("date")), as_time(obj.get("time"))
        if not d or not t:
            return False, None
        got = datetime.strptime(d, "%Y-%m-%d").replace(hour=t[0], minute=t[1])
        ref = datetime.strptime(gold["date"] + " " + gold["time"], "%Y-%m-%d %H:%M")
        return abs((got - ref).total_seconds()) <= 60, None
    if task == "numerology":
        if not obj:
            return False, None
        return as_int(obj.get("life_path")) == gold["life_path"] and as_int(obj.get("expression")) == gold["expression"], None
    if task == "bazi_pillars":
        if not obj:
            return False, 0
        cat = TASK_CATEGORY[task]
        right = sum(1 for k in PILLARS if names.id(cat, obj.get(k)) is not None and names.id(cat, obj.get(k)) == names.id(cat, gold[k]))
        return right == 4, right
    if task in TASK_KEY:
        cat = TASK_CATEGORY[task]
        key = TASK_KEY[task]
        value = obj.get(key) if obj else (answer if isinstance(answer, str) else None)
        if task == "ziwei_bureau":
            want = gold[key]["number"]
            got = names.id(cat, value)
            return got is not None and got == names.id(cat, want), None
        got = names.id(cat, value)
        return got is not None and got == names.id(cat, gold[key]), None
    raise ValueError("unknown task " + task)


def load_jsonl(path):
    with open(path, encoding="utf-8") as f:
        return [json.loads(line) for line in f if line.strip()]


def score(questions, answers, names):
    by_id = {}
    for a in answers:
        if "id" in a:
            by_id[a["id"]] = a.get("answer", a.get("response", a.get("output")))
    tasks = {}
    missing = 0
    pillars_right = pillars_total = 0
    for q in questions:
        t = tasks.setdefault(q["task"], {"n": 0, "correct": 0, "easy": [0, 0], "hard": [0, 0]})
        t["n"] += 1
        t[q["difficulty"]][1] += 1
        if q["id"] not in by_id:
            missing += 1
            ok, detail = False, 0 if q["task"] == "bazi_pillars" else None
        else:
            ok, detail = score_item(q, by_id[q["id"]], names)
        if q["task"] == "bazi_pillars":
            pillars_right += detail or 0
            pillars_total += 4
        if ok:
            t["correct"] += 1
            t[q["difficulty"]][0] += 1
    total = sum(t["n"] for t in tasks.values())
    correct = sum(t["correct"] for t in tasks.values())
    hard = [sum(t["hard"][0] for t in tasks.values()), sum(t["hard"][1] for t in tasks.values())]
    easy = [sum(t["easy"][0] for t in tasks.values()), sum(t["easy"][1] for t in tasks.values())]
    return {
        "total": total,
        "correct": correct,
        "accuracy": correct / total if total else 0.0,
        "easy_accuracy": easy[0] / easy[1] if easy[1] else None,
        "hard_accuracy": hard[0] / hard[1] if hard[1] else None,
        "missing_answers": missing,
        "bazi_pillar_accuracy": pillars_right / pillars_total if pillars_total else None,
        "tasks": {
            k: {
                "n": v["n"],
                "accuracy": v["correct"] / v["n"],
                "easy_accuracy": v["easy"][0] / v["easy"][1] if v["easy"][1] else None,
                "hard_accuracy": v["hard"][0] / v["hard"][1] if v["hard"][1] else None,
            }
            for k, v in tasks.items()
        },
    }


def pct(x):
    return "" if x is None else f"{100 * x:.1f}%"


def print_table(s):
    print("| Task | Items | Accuracy | Easy | Hard |")
    print("|---|---:|---:|---:|---:|")
    for k, v in s["tasks"].items():
        print(f"| {k} | {v['n']} | {pct(v['accuracy'])} | {pct(v['easy_accuracy'])} | {pct(v['hard_accuracy'])} |")
    print(f"| **All** | **{s['total']}** | **{pct(s['accuracy'])}** | {pct(s['easy_accuracy'])} | {pct(s['hard_accuracy'])} |")
    print()
    print(f"Missing answers: {s['missing_answers']}. BaZi pillars right one by one: {pct(s['bazi_pillar_accuracy'])}.")


# ------------------------------------------------------------------ self-test

def self_test(questions, names):
    """The reference answers, written in each language, must score 100%; a shifted copy must not."""
    for lang in ("vi", "en", "zh"):
        answers = []
        for q in questions:
            g = q["answer"]
            if q["task"] == "ziwei_bureau":
                a = {"bureau": g["bureau"][lang]}
            elif q["task"] == "bazi_pillars":
                a = {k: g[k][lang] for k in PILLARS}
            elif q["task"] in TASK_KEY:
                a = {TASK_KEY[q["task"]]: g[TASK_KEY[q["task"]]][lang]}
            else:
                a = g
            # Half of them as a raw reply string, as a model would write it.
            answers.append({"id": q["id"], "answer": a if len(answers) % 2 else "Answer: " + json.dumps(a, ensure_ascii=False)})
        s = score(questions, answers, names)
        if s["correct"] != s["total"]:
            bad = [q["id"] for q, a in zip(questions, answers) if not score_item(q, a["answer"], names)[0]]
            raise SystemExit(f"self-test failed for {lang}: {s['correct']}/{s['total']}, first wrong {bad[:5]}")
    shifted = [{"id": questions[(i + 1) % len(questions)]["id"], "answer": q["answer"]} for i, q in enumerate(questions)]
    s = score(questions, shifted, names)
    if s["accuracy"] > 0.5:
        raise SystemExit(f"self-test failed: mismatched answers scored {pct(s['accuracy'])}")
    print(f"self-test passed: {len(questions)} reference answers score 100% in vi, en and zh; mismatched answers score {pct(s['accuracy'])}.")


def main():
    ap = argparse.ArgumentParser(description=__doc__.split("\n\n")[0])
    ap.add_argument("answers", nargs="?", help="JSONL file of {id, answer}")
    ap.add_argument("--questions", default=QUESTIONS)
    ap.add_argument("--glossary", default=GLOSSARY)
    ap.add_argument("--json", help="also write the summary as JSON to this file")
    ap.add_argument("--self-test", action="store_true", help="check the scorer on the reference answers")
    args = ap.parse_args()
    names = Names(args.glossary)
    questions = load_jsonl(args.questions)
    if args.self_test:
        self_test(questions, names)
        return
    if not args.answers:
        ap.error("give an answers file, or --self-test")
    s = score(questions, load_jsonl(args.answers), names)
    print_table(s)
    if args.json:
        with open(args.json, "w", encoding="utf-8") as f:
            json.dump(s, f, ensure_ascii=False, indent=2)
            f.write("\n")


if __name__ == "__main__":
    main()
