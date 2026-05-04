from __future__ import annotations

import importlib.util
import json
import subprocess
import sys
import time
import unittest
import urllib.request
from pathlib import Path

PLUGIN_ROOT = Path(__file__).resolve().parents[1]


def load_plugin_module():
    spec = importlib.util.spec_from_file_location("octoglyphs_hermes_plugin", PLUGIN_ROOT / "__init__.py")
    module = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(module)
    return module


class FakeContext:
    def __init__(self):
        self.hooks = []
        self.commands = []

    def register_hook(self, name, handler):
        self.hooks.append((name, handler))

    def register_command(self, name, handler, description=""):
        self.commands.append((name, handler, description))


class HermesPluginTests(unittest.TestCase):
    def test_registers_expected_hooks_and_command(self):
        module = load_plugin_module()
        ctx = FakeContext()
        module.register(ctx)
        self.assertEqual(
            [name for name, _handler in ctx.hooks],
            [
                "on_session_start",
                "pre_llm_call",
                "post_tool_call",
                "post_llm_call",
                "on_session_end",
                "on_session_finalize",
                "on_session_reset",
            ],
        )
        self.assertEqual([name for name, _handler, _description in ctx.commands], ["octoglyphs"])

    def test_sanitizer_drops_raw_sensitive_fields(self):
        module = load_plugin_module()
        event = module._sanitize_event(
            {
                "type": "prompt.sent",
                "timestamp": 123,
                "prompt_chars": 40,
                "prompt_tokens": 10,
                "prompt": "never leak this",
                "tool_input": {"command": "cat secret"},
                "assistant_response": "never leak this either",
                "secret": "token",
            }
        )
        self.assertEqual(event, {"type": "prompt.sent", "timestamp": 123, "prompt_chars": 40, "prompt_tokens": 10})

    def test_tool_mapping_uses_category_only(self):
        module = load_plugin_module()
        self.assertEqual(module._categorize_tool("write_file"), "file_write")
        self.assertEqual(module._categorize_tool("terminal"), "shell")
        self.assertEqual(module._categorize_tool("web_fetch"), "web")
        self.assertEqual(module._categorize_tool("unknown_custom_tool"), "other")

    def test_hooks_do_not_return_context(self):
        module = load_plugin_module()
        module._ensure_sidecar = lambda: 9
        module._emit = lambda event, port=None: None
        result = module.pre_llm_call(session_id="s", user_message="hello secret prompt", conversation_history=[])
        self.assertIsNone(result)


class HermesSidecarTests(unittest.TestCase):
    def test_sidecar_health_and_event_sanitization(self):
        port = 18992
        process = subprocess.Popen(
            [sys.executable, str(PLUGIN_ROOT / "octoglyphs_sidecar.py")],
            cwd=str(PLUGIN_ROOT),
            env={"OCTOGLYPHS_HERMES_PORT": str(port)},
            stdout=subprocess.DEVNULL,
            stderr=subprocess.DEVNULL,
        )
        try:
            deadline = time.time() + 3
            health = None
            while time.time() < deadline:
                try:
                    with urllib.request.urlopen(f"http://127.0.0.1:{port}/octoglyphs/health", timeout=0.25) as response:
                        health = json.loads(response.read().decode("utf-8"))
                    break
                except Exception:
                    time.sleep(0.1)
            self.assertIsNotNone(health)
            self.assertEqual(health["host"], "hermes")
            body = json.dumps(
                {
                    "protocol": "octoglyphs.events.v1",
                    "event": {
                        "type": "tool.used",
                        "timestamp": 123,
                        "tool_kind": "shell",
                        "duration_ms": 1,
                        "success": True,
                        "args": {"command": "cat secret"},
                        "result": "secret output",
                    },
                }
            ).encode("utf-8")
            request = urllib.request.Request(
                f"http://127.0.0.1:{port}/octoglyphs/events",
                data=body,
                headers={"content-type": "application/json"},
                method="POST",
            )
            with urllib.request.urlopen(request, timeout=0.5) as response:
                posted = json.loads(response.read().decode("utf-8"))
            self.assertTrue(posted["ok"])
        finally:
            process.terminate()
            process.wait(timeout=3)


if __name__ == "__main__":
    unittest.main()
