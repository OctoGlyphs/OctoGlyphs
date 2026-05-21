# Security Policy

OctoGlyphs is designed as a privacy-first local companion. Host plugins must emit metadata only and must not capture raw user work.

## Do not collect

OctoGlyphs plugins must not collect or emit:

- Prompt text.
- Assistant response text.
- Source code.
- File contents.
- Diffs.
- Shell commands or terminal output.
- Tool arguments or full tool results.
- Secrets, tokens, credentials, environment variables, or private keys.

## Allowed metadata

Plugins may emit sanitized fields such as event type, timestamp, duration, success/failure state, approximate prompt length or token count when safely exposed by the host, completion duration, tool category, and non-content commit summary counts.

## Reporting issues

Please report privacy or security issues through GitHub issues if they are safe to discuss publicly. If a report includes private data, credentials, or an exploit path that should not be public yet, contact the project maintainers privately first.

## Token hygiene

Never commit personal access tokens, API keys, npm tokens, GitHub tokens, local config files containing secrets, or generated credential caches.
