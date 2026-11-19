# Security policy

## Supported versions

Security fixes are released for the latest minor version of the npm packages
`@nhatnguyet/*` and the Python package `nhatnguyet`. They share one version
number.

| Version | Supported |
|---|---|
| 0.3.x | Yes |
| 0.2.x and older | No, please upgrade |

## Reporting a vulnerability

Please do not open a public issue for a security problem.

- Preferred: use **Report a vulnerability** on the
  [Security tab](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/security/advisories/new)
  of this repository (GitHub private vulnerability reporting).
- Or email **lienhe@nhatnguyet.org** with "Security" in the subject.

Include the package and version, what an attacker can do, and the smallest
input or steps that show it. You will get a reply within 3 working days and a
status update at least every 7 days until the issue is closed. Once a fix is
released we credit the reporter in the release notes and the advisory, unless
you prefer not to be named.

## Scope

In scope:

- the libraries in `js/packages/` and `python/` (for example, input that makes
  a function hang, crash the process or use unbounded memory);
- `@nhatnguyet/cli` and the `nhatnguyet` command (for example, writing files
  outside the path given to `--svg`);
- `@nhatnguyet/mcp` (for example, a tool call that reads or writes files, or
  reaches the network);
- `@nhatnguyet/widgets` and the SVG renderers (for example, markup injection
  through a name or an attribute that ends up in the page or the SVG);
- the release pipeline: the GitHub Actions workflows in `.github/workflows/`
  that publish to npm and PyPI.

Out of scope: the results of the calculations themselves (a wrong lunar date
or star position is a bug; please use the
[issue tracker](https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/issues)),
and the website nhatnguyet.org (report those to the same email address).

## How releases are protected

From 0.3.0 on, npm packages are published from GitHub Actions with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements), and
the Python package with PyPI trusted publishing, so every published version can
be traced to the commit and workflow run that built it. Versions 0.1.0 and
0.2.0 were published by hand and carry no attestations. The packages have no
third-party runtime dependencies, except `@nhatnguyet/mcp`, which depends on
the MCP SDK and zod at exact versions.
