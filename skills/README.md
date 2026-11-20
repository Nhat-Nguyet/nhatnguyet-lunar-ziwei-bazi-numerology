# Skills for AI assistants

`nhatnguyet/SKILL.md` is an [Agent Skill](https://docs.claude.com/en/docs/agents-and-tools/agent-skills/overview):
it tells an assistant to compute lunar dates, solar terms, stem-branch pillars,
Zi Wei Dou Shu and BaZi charts, numerology numbers, Vietnamese festival
dates, I Ching hexagrams and Six Lines charts and the feng shui rules of
traditional schools with the Nhat Nguyet tools instead of estimating them, which tool to call
and which conventions to state (Vietnam time UTC+7, the Tý hour, Start of Spring
for BaZi years).

## Install

**Claude Code**: copy the folder into your skills directory.

```bash
# for you, in every project
mkdir -p ~/.claude/skills && cp -r skills/nhatnguyet ~/.claude/skills/
# or for one project (commit it so the team gets it)
mkdir -p .claude/skills && cp -r skills/nhatnguyet .claude/skills/
```

**Claude apps (claude.ai, Claude Desktop)**: zip the folder
(`cd skills && zip -r nhatnguyet.zip nhatnguyet`) and upload the zip in the
Skills section of Settings.

**Other assistants that read `SKILL.md` folders**: copy `skills/nhatnguyet`
to the directory where that assistant loads skills.

The skill calls `npx -y @nhatnguyet/cli ... --json` (Node.js 18+) or
`python -m nhatnguyet ... --json` (`pip install nhatnguyet`, Python 3.9+), so
one of the two must be available where the assistant runs commands.

## With the MCP server

When the assistant cannot run commands, connect the MCP server instead (setup
for Claude Desktop, Claude Code, Cursor and VS Code in
[`js/packages/mcp/README.md`](../js/packages/mcp/README.md)):

```bash
claude mcp add nhatnguyet -- npx -y @nhatnguyet/mcp
```

The skill prefers the MCP tools when they are connected; installing both is fine.
