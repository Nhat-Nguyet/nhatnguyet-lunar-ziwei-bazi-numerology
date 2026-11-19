# Jupyter: Tết in Vietnam and China, 1900 to 2100

[`tet-vietnam-vs-china.ipynb`](tet-vietnam-vs-china.ipynb) uses the `nhatnguyet`
Python package to compare the Vietnamese lunar calendar (UTC+7) with the
Chinese one (UTC+8) over 201 years. It is saved with its outputs, so GitHub
shows the tables and charts without running anything.

What it finds:

- Tết falls on a different day in 10 of 201 years; in 1985 the gap is a whole
  month (21 January in Vietnam, 20 February in China).
- 99 of 2,491 lunar months start on a different day, and the leap month
  differs in 6 years (1917, 1922, 1938, 1984, 1985, 1987).
- Two charts: the date of Tết year by year, and the differing months by decade.

## Run it (about 2 minutes)

```bash
python3 -m venv .venv && . .venv/bin/activate
pip install -r requirements.txt jupyterlab
jupyter lab tet-vietnam-vs-china.ipynb
```

Or open the notebook in VS Code or Google Colab (add a first cell
`%pip install nhatnguyet matplotlib`). The package itself needs only the
Python standard library (3.9+); matplotlib is for the charts.

From version 0.3.0, install `nhatnguyet>=0.3.0` from PyPI. Inside this
repository `examples/test-all.sh jupyter` installs the local package from
`../../python`, executes the notebook and checks that every printed output
matches the saved one (`compare_outputs.py`).

Data: Nhat Nguyet (nhatnguyet.org)
