# Releasing

Releases are created from an existing reviewed version tag through the manually
dispatched `Release` workflow. The workflow does not create or move tags.

## Repository setup

Configure a GitHub Actions environment named `release` and limit approvals to
the release maintainers. Protect `v*` tags against deletion or movement outside
the maintainer path, and require the normal CI and security checks on `main`.

## Prepare and publish

1. Merge the reviewed change.
2. Set the package version and add a dated changelog section.
3. Run `npm run check` and inspect `npm pack --dry-run` from a clean checkout.
4. Create a signed or verified annotated `v<package version>` tag on the
   reviewed commit and push it without changing its dates or authorship.
5. Dispatch the `Release` workflow with that existing tag.
6. Approve the `release` environment only after the verification job passes.

The workflow validates the tag, package version, changelog, tests, coverage,
documentation links, and package allowlist. It records the verified source
commit with the generated package, re-resolves the tag immediately before
publication, transfers only those verified artifacts into the write-enabled
job, and refuses to replace an existing release.

Do not publish a release solely to create profile activity.
