# aeokit-mcp

Measure whether AI answer engines recommend your product.

When a buyer asks ChatGPT or Gemini for a tool, the engine names specific products. `aeokit` measures whether it names yours — live, repeatedly, with the statistics to say how confident that is, and the cited pages behind it.

```bash
claude mcp add aeokit --env AEOKIT_USER_OPENAI_API_KEY=sk-... -- uvx aeokit-mcp
```

Then ask your agent: *"I sell Acme, invoicing for freelancers. Do AI assistants recommend us?"*

Runs on **your** API keys. Keys are read only from the server environment — never accepted as tool parameters, because tool arguments land in conversation transcripts.

Run `check_keys` after installing to confirm your keys were picked up.

Full docs: https://aeokit.vercel.app/docs
