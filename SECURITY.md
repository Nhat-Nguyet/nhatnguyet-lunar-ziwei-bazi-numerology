# Security policy

## Supported versions

Security fixes are released for the latest minor version of the npm packages
`@nhatnguyet/*` and the Python package `nhatnguyet`. They share one version
number.

| Version | Supported |
|---|---|
| 0.4.x | Yes |
| 0.3.x and older | No, please upgrade |

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

- the libraries in `js/packages/` and `python/`, including `@nhatnguyet/iching`
  and `@nhatnguyet/fengshui` (for example, input that makes a function hang,
  crash the process or use unbounded memory);
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

The Python package is published from GitHub Actions with PyPI trusted
publishing and attestations from 0.3.0 on. The release workflow publishes the
npm packages with
[npm provenance](https://docs.npmjs.com/generating-provenance-statements) once
the npm account accepts it; until then (0.3.0 and 0.4.0) the npm packages are
published by hand from the release tag (`v0.3.0`, `v0.4.0`) and carry no
provenance, like 0.1.0 and 0.2.0. Each release note says how it was published.
The packages have no
third-party runtime dependencies, except `@nhatnguyet/mcp`, which depends on
the MCP SDK and zod at exact versions.
