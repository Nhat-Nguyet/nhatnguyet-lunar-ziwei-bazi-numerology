# check.py: compare your port's answers with a ca-kiem file.
# usage: python3 ca-kiem/check.py ca-kiem/am-lich.json answers.jsonl
# answers.jsonl: one JSON value per line, the answer to ca[i], in the same order.
import json, math, sys

def drop(v, keys):
    if isinstance(v, dict):
        return {k: drop(x, keys) for k, x in v.items() if k not in keys}
    if isinstance(v, list):
        return [drop(x, keys) for x in v]
    return v

def diff(want, got, path="$"):
    if isinstance(want, bool) or isinstance(got, bool):
        return None if want is got else f"{path}: want {want!r}, got {got!r}"
    if isinstance(want, (int, float)) and isinstance(got, (int, float)):
        return None if math.isclose(want, got, rel_tol=0, abs_tol=1e-9) else f"{path}: want {want!r}, got {got!r}"
    if isinstance(want, dict) and isinstance(got, dict):
        for k in sorted(set(want) | set(got)):
            if k not in got: return f"{path}.{k}: missing"
            if k not in want: return f"{path}.{k}: unexpected key"
            r = diff(want[k], got[k], f"{path}.{k}")
            if r: return r
        return None
    if isinstance(want, list) and isinstance(got, list):
        if len(want) != len(got): return f"{path}: length {len(want)} vs {len(got)}"
        for i, (a, b) in enumerate(zip(want, got)):
            r = diff(a, b, f"{path}[{i}]")
            if r: return r
        return None
    return None if want == got and type(want) is type(got) else f"{path}: want {want!r}, got {got!r}"

suite = json.load(open(sys.argv[1], encoding="utf-8"))
keys = set(suite["khoaBo"])
answers = [json.loads(l) for l in open(sys.argv[2], encoding="utf-8") if l.strip()]
failed = 0
for i, case in enumerate(suite["ca"]):
    got = answers[i] if i < len(answers) else "<no answer>"
    r = diff(drop(case["ra"], keys), drop(got, keys))
    if r:
        failed += 1
        if failed <= 5: print(f"case {i} {json.dumps(case['vao'], ensure_ascii=False)}\n  {r}")
print(f"{suite['mon']}: {len(suite['ca']) - failed}/{len(suite['ca'])} passed")
sys.exit(1 if failed else 0)
