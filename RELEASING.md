# Releasing

All npm packages (`@nhatnguyet/*`) and the Python package (`nhatnguyet`)
share one version number and are released together from a `vX.Y.Z` tag by
[`.github/workflows/release.yml`](.github/workflows/release.yml). Versions
follow [Semantic Versioning](https://semver.org/): patch releases (0.x.y) only
fix bugs; new features come in a minor release (0.x.0). While below 1.0.0, a
breaking change (to the public API or to a default output) also comes in a
minor release and is listed first in the CHANGELOG.

## What the release workflow does

On a pushed tag `vX.Y.Z`:

1. **check**: `release-tools.mjs check X.Y.Z` (every `package.json`, the
   internal `^X.Y.Z` dependencies, `pyproject.toml`, `__version__`, the CLI and
   MCP `VERSION` constants, `CITATION.cff`, `.zenodo.json` and a dated
   `CHANGELOG.md` section agree with the tag), then the TypeScript and Python
   test vectors, the build and every README example against the local packages.
2. **npm**: builds and publishes the packages in dependency order with
   `npm publish --provenance --access public` (a version that is already on
   npm is skipped, so a failed run can be re-run). Pre-release versions
   (`X.Y.Z-rc.1`) get the `next` dist-tag instead of `latest`.
3. **pypi**: builds the sdist and wheel and uploads them with
   `pypa/gh-action-pypi-publish` (trusted publishing, `skip-existing`).
4. **github-release**: creates the GitHub release `vX.Y.Z` with the notes from
   the `CHANGELOG.md` section, install lines and links to every published
   package (`release-tools.mjs notes X.Y.Z`). Zenodo archives the release and
   mints a version DOI.
5. **published**: runs [`published.yml`](.github/workflows/published.yml):
   in a clean runner, `npm install` of the published packages at `X.Y.Z` and
   `pip install nhatnguyet==X.Y.Z`, then every README example again. The same
   check runs every Monday and can be started by hand
   (Actions, Published packages, Run workflow).

## One-time setup (repository owner)

Nothing below can be done from the workflow itself.

### npm (trusted publishing)

1. For **each** package on npmjs.com (`@nhatnguyet/am-lich`, `bat-tu`,
   `le-hoi`, `than-so-hoc`, `tu-vi`, `cli`, `mcp`, `widgets`, `lunar`,
   `ziwei`, `bazi`, `numerology`, `festivals`): Settings, Trusted Publisher,
   GitHub Actions, with
   - Organization or user: `Nhat-Nguyet`
   - Repository: `nhatnguyet-lunar-ziwei-bazi-numerology`
   - Workflow filename: `release.yml`
   - Environment name: `npm`
2. npm only allows a trusted publisher on a package that already exists. For a
   package's **first** release (the five English-named packages `lunar`,
   `ziwei`, `bazi`, `numerology`, `festivals` in 0.3.0), add a granular
   access token with read and write access to the `@nhatnguyet` scope as the
   secret `NPM_TOKEN` of the `npm` environment. The workflow passes it as
   `NODE_AUTH_TOKEN`; npm uses the OIDC token instead whenever a trusted
   publisher is configured. After the first release, configure the trusted
   publishers, delete the secret and revoke the token.
3. Optional, once every package has a trusted publisher: package Settings,
   Publishing access, "Require two-factor authentication and disallow tokens".

Provenance needs `repository.url` in each `package.json` to point to this
repository; `release-tools.mjs check` verifies it.

### PyPI (trusted publishing)

On pypi.org, project `nhatnguyet`, Manage, Publishing, add a GitHub publisher:
owner `Nhat-Nguyet`, repository `nhatnguyet-lunar-ziwei-bazi-numerology`,
workflow `release.yml`, environment `pypi`. No token is stored anywhere.

### GitHub

- Settings, Environments: create `npm` and `pypi`. Adding yourself as a
  required reviewer makes every publish wait for one click.
- Settings, Rules: a tag ruleset for `v*` so that only maintainers can create
  release tags.
- Settings, Code security: enable **Private vulnerability reporting** (used by
  [SECURITY.md](SECURITY.md)).
- Zenodo: the repository switched on in the GitHub section of Zenodo, so each
  GitHub release gets a version DOI (`.zenodo.json` holds the metadata).

## Steps for a release

Replace `X.Y.Z` with the new version.

1. **Changelog.** In `CHANGELOG.md`, rename `## [Unreleased]` to
   `## [X.Y.Z] - YYYY-MM-DD`, start a new empty `## [Unreleased]` above it,
   and update the comparison links at the bottom:

   ```text
   [Unreleased]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/vX.Y.Z...HEAD
   [X.Y.Z]: https://github.com/Nhat-Nguyet/nhatnguyet-lunar-ziwei-bazi-numerology/compare/vPREVIOUS...vX.Y.Z
   ```

   Write for a developer outside Vietnam: English, what changed for them,
   breaking changes first under "Changed" or "Removed".

2. **Version numbers.** One command writes the version everywhere:

   ```bash
   node .github/scripts/release-tools.mjs set X.Y.Z
   ```

   It updates all `js/packages/*/package.json` files and the `^X.Y.Z` ranges
   between them, `python/pyproject.toml`, `python/nhatnguyet/__init__.py`, the
   `VERSION` constants of the CLI and the MCP server, `CITATION.cff` and
   `.zenodo.json`. If a number in the descriptions changed (festivals, test
   vectors), update the text of `CITATION.cff` and `.zenodo.json` as well.

3. **Generated files.**

   ```bash
   cd js && npm install && npm run docs     # API reference in docs/api
   ```

   If the reference engine changed, the test vectors in `ca-kiem/` are
   regenerated before this step and the README outputs updated to match.

4. **Checks**, all of which the release workflow runs again:

   ```bash
   node .github/scripts/release-tools.mjs check X.Y.Z
   (cd js && npm test && npm run build)
   (cd python && python3 -m unittest discover -s tests)
   node cong-cu/kiem-readme.mjs
   node .github/scripts/run-readme-code.mjs
   ```

5. **Commit and push** to `main` (`Release vX.Y.Z`) and wait for the Tests
   workflow to pass.

6. **Tag and push the tag.** This starts the release:

   ```bash
   git tag -a vX.Y.Z -m "vX.Y.Z"
   git push origin vX.Y.Z
   ```

7. **Watch** Actions, Release. Approve the `npm` and `pypi` environments if
   they require a reviewer. When it is green, check the release page, the
   provenance badge on npmjs.com, and the Published packages job at the end.

## Publish order

Packages are published dependencies first, so that nobody can install a
package whose dependency at the same version is not on npm yet:

1. `@nhatnguyet/am-lich` (no dependencies)
2. `@nhatnguyet/bat-tu`, `le-hoi`, `than-so-hoc`, `tu-vi`
3. `@nhatnguyet/cli`, `mcp`, `widgets`
4. the English-named aliases last: `@nhatnguyet/bazi`, `festivals`, `lunar`,
   `numerology`, `ziwei`

`node .github/scripts/release-tools.mjs order` prints the exact list the
workflow uses. The Python package has no dependencies and is published in
parallel.

## When something goes wrong

- **A job failed after some packages were published**: fix the cause (for
  example a missing trusted publisher) and use "Re-run failed jobs". Versions
  already on npm and PyPI are skipped.
- **A published version is broken**: never unpublish (npm forbids reuse of the
  version anyway). Release a patch version with the fix, then deprecate the
  broken one: `npm deprecate "@nhatnguyet/<pkg>@X.Y.Z" "Broken, use X.Y.Z+1"`
  for each package, and "Yank" the release on PyPI.
- **Publishing by hand** (only if Actions is unavailable): after the checks of
  step 4, from `js/`, `npm publish -w <package> --access public` in the order
  above, and from `python/`, `python -m build && twine upload dist/*`.
  Packages published this way carry no provenance; say so in the release
  notes.
