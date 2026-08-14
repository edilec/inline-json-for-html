# Contributing

Contributions that improve correctness, compatibility, documentation, or test
coverage are welcome.

## Before opening a pull request

1. Fork the repository and create a focused branch.
2. Add or update tests for every behavior change.
3. Run `npm test`.
4. Run `npm pack --dry-run` and inspect the package allowlist.
5. Explain the parsing context and security boundary affected by the change.

Please keep pull requests small and avoid adding runtime dependencies without
a clear, reviewed need.
