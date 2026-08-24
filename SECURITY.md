# Security policy

## Supported versions

Security fixes are provided for the latest release.

| Version | Supported |
| --- | --- |
| 0.1.x | Yes |

## Report a vulnerability

Please do not open a public issue for a suspected vulnerability. Email
[hello@edilec.com](mailto:hello@edilec.com) with:

- the affected version;
- a minimal reproduction;
- the expected and observed behavior; and
- any conditions required to reproduce the issue.

Include only the minimum data needed to reproduce the problem. Do not send
real credentials, customer data, or third-party personal information.

Edilec will coordinate validation, remediation, release preparation, and any
public disclosure with the reporter. Security findings are not discussed in a
public issue before a fix or mitigation is available.

## Scope boundary

This package only prepares JSON for the text content of an HTML script
element. It is not a general-purpose sanitizer for HTML, JavaScript, CSS,
URLs, or arbitrary attributes.

Review [`docs/threat-model.md`](./docs/threat-model.md) for the protected data
flow, assumptions, non-goals, and residual risks.
