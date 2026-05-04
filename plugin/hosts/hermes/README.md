# OctoGlyphs for Hermes

OctoGlyphs is a privacy-first companion tank for Hermes. It turns session lifecycle, prompt, response, and tool metadata into gems, rewards, danger, and energy in the shared OctoGlyphs tank.

When enabled, Hermes prints a tank link at session start:

```text
Your OctoGlyph is blindly feeding on this Hermes session.
Open your tank: http://localhost:18792/octoglyphs
```

## Privacy promise

The Hermes plugin is passive and metadata-only.

It never sends raw prompts, assistant responses, file contents, tool arguments, terminal output, diffs, or secrets. It emits only sanitized event metadata such as event type, timestamp, prompt length, estimated token count, tool category, success flag, and duration when available.

The plugin does not inject context into Hermes, even though Hermes allows `pre_llm_call` plugins to do so.

## Local install for testing

From this repository:

```bash
mkdir -p ~/.hermes/plugins
rm -rf ~/.hermes/plugins/octoglyphs
cp -R /home/crai/Desktop/octoglyphs-release/plugin/hosts/hermes ~/.hermes/plugins/octoglyphs
hermes plugins enable octoglyphs
hermes
```

Then open:

```text
http://localhost:18792/octoglyphs
```

Inside Hermes, you can also run:

```text
/octoglyphs
```

That prints the tank URL, health URL, sidecar state, and privacy reminder.

## Fresh-machine install target

Once published in a layout Hermes can install directly, expected flow is:

```bash
hermes plugins install OctoGlyphs/OctoGlyphs
hermes plugins enable octoglyphs
hermes
```

If Hermes requires the plugin manifest at the repository root for GitHub installs, use the local copy flow above until we split or package this host plugin.

## Event mapping

Hermes hook mapping:

```text
on_session_start      -> session.started and response.started
pre_llm_call          -> prompt.sent and response.started
post_tool_call        -> tool.used or commit.created
post_llm_call         -> response.completed
on_session_end        -> session.ended
on_session_finalize   -> session.ended
on_session_reset      -> session.started
```

## Verification

Run static checks and unit tests from the plugin folder:

```bash
cd /home/crai/Desktop/octoglyphs-release/plugin/hosts/hermes
python -m py_compile __init__.py octoglyphs_sidecar.py
python -m unittest discover -s tests
```

Manual test:

```bash
mkdir -p ~/.hermes/plugins
rm -rf ~/.hermes/plugins/octoglyphs
cp -R /home/crai/Desktop/octoglyphs-release/plugin/hosts/hermes ~/.hermes/plugins/octoglyphs
hermes plugins enable octoglyphs
hermes
```

Expected checks:

- Hermes shows OctoGlyphs in plugin list.
- Session start prints the tank URL.
- `http://localhost:18792/octoglyphs/health` returns healthy JSON.
- Prompt sends spawn or reconcile gems.
- Tool calls create tool rewards.
- Event payloads contain no raw prompt, response, file content, tool args, terminal output, diffs, or secrets.
