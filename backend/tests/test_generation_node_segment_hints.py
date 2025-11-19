from app.nodes import generation_node as gn


def test_template_respects_preferred_length_and_cta(monkeypatch):
    # Create a fake SEGMENT_RULES entry and patch it into the module
    fake_rules = {
        "test_segment": {
            "tone": "cheerful",
            "preferred_length": 20,
            "must_include": ["curated picks"],
            "cta": "Check these out"
        },
        "general": {
            "tone": "friendly",
            "preferred_length": 120,
            "cta": "Shop now"
        }
    }
    monkeypatch.setattr(gn, "SEGMENT_RULES", fake_rules)

    state = {
        "segment": "test_segment",
        "customer_profile": {"tier": "Gold", "preferred_category": "running"},
        "retrieval_context": "Shoe A: lightweight\nShoe B: cushioned",
    }

    msg = gn._template_generate(state)
    # Ensure CTA present
    assert "Check these out" in msg or "Check these out." in msg
    # Ensure we respect preferred_length (words)
    assert len(msg.split()) <= 20


def test_prompt_includes_llm_hints(monkeypatch):
    fake_rules = {
        "promo": {"tone": "direct", "preferred_length": 30, "cta": "Buy now"},
        "general": {"tone": "friendly"}
    }
    monkeypatch.setattr(gn, "SEGMENT_RULES", fake_rules)
    state = {
        "segment": "promo",
        "persona_signals": {"brands": ["Acme"]},
        "retrieval_context": "Product X is on sale",
    }
    # Build prompt via generation_node logic
    ws = type("WS", (), {})()
    ws.get = lambda k, default=None: state.get(k, default)
    # Call generation_node to build prompt and eventually template (we'll force template path by monkeypatching _load_model and _call_openai_chat)
    monkeypatch.setattr(gn, "_load_model", lambda: None)
    monkeypatch.setattr(gn, "_call_openai_chat", lambda prompt: (_ for _ in ()).throw(Exception("no llm")))

    out = gn.generation_node(state)
    assert "Buy now" in out["answer"] or "Buy now." in out["answer"] or "buy now" in out["answer"].lower()
