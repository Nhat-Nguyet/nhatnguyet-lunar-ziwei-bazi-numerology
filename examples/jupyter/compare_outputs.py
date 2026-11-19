"""Compares the text outputs of two runs of a notebook (the committed one and a
fresh execution). Images are not compared byte for byte (PNG encoders differ);
they only have to be present. Exits 1 on any difference or on stderr output.

    python compare_outputs.py committed.ipynb executed.ipynb
"""
import json
import sys


def outputs(path):
    nb = json.load(open(path, encoding="utf-8"))
    res = []
    for i, cell in enumerate(nb["cells"]):
        for o in cell.get("outputs", []):
            if o["output_type"] == "error" or o.get("name") == "stderr":
                sys.exit(f"{path}: cell {i} has an error or stderr output")
            if o["output_type"] == "stream":
                # The kernel may split one cell's stdout into several stream
                # outputs at any point (buffering), so consecutive streams of
                # a cell are compared as one text.
                if res and res[-1][0] == i and res[-1][1] == "text":
                    res[-1] = (i, "text", res[-1][2] + "".join(o["text"]))
                else:
                    res.append((i, "text", "".join(o["text"])))
            else:
                res.append((i, "image" if "image/png" in o.get("data", {}) else "data", ""))
    return res


a, b = outputs(sys.argv[1]), outputs(sys.argv[2])
if a != b:
    for x, y in zip(a, b):
        if x != y:
            print("committed:", x, "\nexecuted: ", y, sep="\n")
            break
    sys.exit(f"outputs differ ({len(a)} vs {len(b)} outputs): re-execute and commit the notebook")
print(f"notebook outputs match ({len(a)} outputs, {sum(1 for o in a if o[1] == 'image')} charts)")
