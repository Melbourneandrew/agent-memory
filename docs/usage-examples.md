# Usage Examples

These examples assume you have configured a [Backboard](https://backboard.io) API key (see [Configuration](configuration.md)).

## Add Memories

From command argument:

```bash
agent-memory add "Project kickoff is Monday at 09:00."
```

From stdin:

```bash
cat notes.txt | agent-memory add
```

## Search Memories

```bash
agent-memory search "kickoff"
agent-memory search "project schedule" --limit 3 --format json
```

## List with Pagination

```bash
agent-memory list --page 1 --page-size 20
agent-memory list --page 2 --page-size 20 --format json
```

## Update and Delete by ID

```bash
agent-memory update mem_123 "Project kickoff moved to Tuesday 10:00."
agent-memory delete mem_123
```

## JSON Output for Automation

```bash
agent-memory list --format json
agent-memory stats --format json
agent-memory status op_456 --format json
```

## End-to-End Workflow

```bash
# 1) Configure auth
agent-memory config set api-key <your-api-key>

# 2) Add memory
agent-memory add "User prefers concise bullet summaries."

# 3) Search memory
agent-memory search "concise summaries" --limit 5

# 4) Inspect usage
agent-memory stats

# 5) Launch Web UI
agent-memory web
```
