# Using DURA with Cline

## One-Command Setup
```bash
npm install -g dura-mcp
```

Then add to VS Code Settings:
```json
{
  "cline.mcpServers": {
    "dura": {
      "command": "dura-mcp"
    }
  }
}
```

Restart VS Code and you're done! 🎉

## What You Can Do

Ask Cline natural questions about dependencies:

- "Analyze dependencies for https://github.com/expressjs/express"
- "What are the risky dependencies in React?"
- "Should I update my dependencies?"
- "Show me breaking changes in this repo"
- "Give me a risk summary for Next.js"

Cline will automatically use DURA to analyze and provide detailed answers.

## Video Tutorial

[coming soon!]

## Need Help?

- [GitHub Issues](https://github.com/ArchieTansaria/dura/issues)
- [Documentation](https://github.com/ArchieTansaria/dura)