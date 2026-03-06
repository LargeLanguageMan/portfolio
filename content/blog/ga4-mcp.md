---
title: "Building a GA4 MCP Server and Using It Across Codex, Claude, Gemini, and OpenClaw"
description: "Learn how to build a Google Analytics 4 MCP server and connect it to multiple AI agents — Claude, Codex, Gemini CLI, and OpenClaw — giving every model direct, real-time access to your GA4 data."
---

# Building a GA4 MCP Server and Using It Across Codex, Claude, Gemini, and OpenClaw

One of the most powerful things you can do with modern AI agents is give them direct access to real data. Instead of hallucinating analytics insights, the model can actually query your Google Analytics 4 property in real time.

In this guide I'll show how I built a Google Analytics 4 MCP server and connected it to **Codex**, **Claude**, **Gemini CLI**, and **OpenClaw** — creating a single analytics gateway that any AI agent can use.

---

## What Is an MCP Server?

MCP (Model Context Protocol) is an open standard that lets AI agents connect to external data sources and tools through a structured interface. Rather than building one-off integrations for every model, you build a single MCP server and any compatible agent can use it.

For GA4, this means your AI agents stop guessing and start reading real numbers directly from your analytics property.

---

## Step 1 — Create a Google Cloud Service Account

The cleanest way to authenticate GA4 programmatically is with a service account — no user login required, no OAuth dance.

### 1. Create a project in Google Cloud

Go to [Google Cloud Console](https://console.cloud.google.com) and create a new project.

```
ga4-mcp-project
```

### 2. Enable the Google Analytics Data API

Navigate to **APIs & Services → Library** and enable:

```
Google Analytics Data API
```

### 3. Create a Service Account

Navigate to **IAM & Admin → Service Accounts**, click **Create Service Account**, and give it a name:

```
ga4-mcp-service
```

### 4. Generate a JSON key

Inside the service account, go to **Keys → Add Key → Create New Key → JSON**.

This downloads a credentials file:

```
ga4-service-account.json
```

### 5. Grant the Service Account access to your GA4 property

Open your GA4 property in Google Analytics, then go to **Admin → Property Access Management**.

Add the service account email:

```
xxx-yyy@project-id.iam.gserviceaccount.com
```

Set the role to **Viewer**. That's it — the service account can now read your GA4 data.

---

## Step 2 — Install the GA4 MCP Server

The GA4 MCP server is available as a Python package. The recommended install method is `pipx`, which keeps it isolated in its own environment.

### Install pipx

On macOS:

```bash
python3 -m pip install --user pipx
python3 -m pipx ensurepath
```

On Ubuntu:

```bash
sudo apt install pipx python3-venv
pipx ensurepath
```

### Install the GA4 MCP server

```bash
pipx install analytics-mcp
```

Verify the install:

```bash
which analytics-mcp
analytics-mcp --help
```

---

## Step 3 — Store Credentials Securely

Keep your JSON key out of your home directory and version control.

```bash
sudo mkdir -p /opt/openclaw/secrets
sudo chown $USER:$USER /opt/openclaw/secrets

mv ga4-service-account.json /opt/openclaw/secrets/ga4.json
chmod 600 /opt/openclaw/secrets/ga4.json
```

---

## Step 4 — Set Environment Variables

The MCP server reads credentials through three environment variables:

```bash
export GOOGLE_APPLICATION_CREDENTIALS="/opt/openclaw/secrets/ga4.json"
export GA4_PROPERTY_ID="12345678"
export GOOGLE_PROJECT_ID="your-project-id"
```

Test the server directly:

```bash
analytics-mcp
```

If it starts without errors, authentication is working.

---

## Step 5 — Using GA4 MCP in Codex

Codex loads MCP servers via a TOML config file at `~/.codex/config.toml`:

```toml
[mcp.servers.ga4]
command = "analytics-mcp"

[mcp.servers.ga4.env]
GOOGLE_APPLICATION_CREDENTIALS = "/opt/openclaw/secrets/ga4.json"
GA4_PROPERTY_ID = "12345678"
GOOGLE_PROJECT_ID = "your-project-id"
```

Restart Codex. You can now prompt it naturally:

```
Show my top pages in GA4 for the last 30 days
```

---

## Step 6 — Using GA4 MCP in Claude

Claude Code reads MCP server config from `~/.claude.json`:

```json
{
  "mcpServers": {
    "ga4": {
      "command": "analytics-mcp",
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/opt/openclaw/secrets/ga4.json",
        "GA4_PROPERTY_ID": "12345678",
        "GOOGLE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

Restart Claude Code. Claude now has live GA4 access inside any project session.

---

## Step 7 — Using GA4 MCP in Gemini CLI

Gemini CLI uses a JSON settings file at `~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "ga4": {
      "type": "stdio",
      "command": "analytics-mcp",
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/opt/openclaw/secrets/ga4.json",
        "GA4_PROPERTY_ID": "12345678",
        "GOOGLE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

Restart Gemini CLI and confirm the server is loaded:

```bash
/mcp list
```

You should see:

```
ga4 (stdio)
```

---

## Step 8 — Adding GA4 to OpenClaw

OpenClaw uses a skill system. Skills live inside the workspace at `~/.openclaw/workspace/skills/`.

### Create the skill directory and manifest

```bash
mkdir ~/.openclaw/workspace/skills/ga4-mcp
```

Create `~/.openclaw/workspace/skills/ga4-mcp/SKILL.md`:

```markdown
---
name: ga4-mcp
description: "Query Google Analytics 4 via analytics-mcp."
metadata: {"openclaw":{"emoji":"📈","os":["linux"],"requires":{"bins":["analytics-mcp"]}}}
---
```

### Enable the skill in OpenClaw config

Edit `~/.openclaw/openclaw.json` and add the skill entry:

```json
"skills": {
  "install": {
    "nodeManager": "npm"
  },
  "entries": {
    "ga4-mcp": {
      "enabled": true,
      "env": {
        "GOOGLE_APPLICATION_CREDENTIALS": "/opt/openclaw/secrets/ga4.json",
        "GA4_PROPERTY_ID": "12345678",
        "GOOGLE_PROJECT_ID": "your-project-id"
      }
    }
  }
}
```

Restart OpenClaw and verify:

```bash
systemctl --user restart openclaw-gateway
openclaw skills list
```

You should see `📈 ga4-mcp` in the output.

---

## The Final Architecture

After completing this setup, a single MCP server serves analytics data to every agent:

```
          AI Agents
      ┌────────┼────────┐
      │        │        │
    Codex    Claude   Gemini
      │        │        │
      └────────┴────────┘
               │
          analytics-mcp
               │
   Google Analytics Data API
               │
              GA4
```

OpenClaw connects to the same gateway via its skill system.

---

## Why This Architecture Works

Using MCP gives you:

- **Credential isolation** — service account instead of personal OAuth tokens
- **Reusable integrations** — one server, multiple agents
- **Structured tool calls** — models get typed responses, not raw text
- **A single source of truth** — all agents query the same live data

Instead of building a separate analytics integration for every model you use, you build one MCP server and connect everything to it.

---

## 5 Real Analytics Prompts You Can Now Run

Once your GA4 MCP is connected, try these across any of the agents above:

1. **Funnel analysis** — "Show me the drop-off rate at each step of my checkout funnel for the last 14 days"
2. **Channel attribution** — "Which acquisition channels drove the most conversions last month?"
3. **Content performance** — "List my top 10 pages by engagement rate and average session duration"
4. **Anomaly detection** — "Were there any unusual spikes or drops in sessions this week compared to last week?"
5. **Cohort insight** — "How does retention differ between users who arrived via organic search vs paid?"

These are the kinds of questions that used to require a dedicated analyst or a BI tool. With GA4 MCP, any model answers them instantly with real data.
