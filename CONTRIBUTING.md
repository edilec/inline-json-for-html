# Contributing

Contributions that improve correctness, compatibility, documentation, or test
coverage are welcome.

## Before opening a pull request

1. Fork the repository and create a focused branch.
2. Add or update tests for every behavior change.
3. Run `npm test`.
4. Run `npm run check` and inspect the package allowlist.
5. Add a security vector for changes to escaping or parsing behavior.
6. Explain the parsing context and security boundary affected by the change.

Please keep pull requests small and avoid adding runtime dependencies without
a clear, reviewed need.

## Security-sensitive changes

Do not include a live exploit against a third-party site or disclose a private
report in a pull request. Coordinate security fixes through the process in
[`SECURITY.md`](./SECURITY.md).

Changes to supported contexts, escaping rules, package exports, or release
permissions require maintainer review even when tests pass.
