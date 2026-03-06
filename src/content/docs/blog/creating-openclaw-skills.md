---
title: "How I Learned to Build OpenClaw Skills (Without Breaking Everything)"
description: "A first-person walkthrough of learning to create OpenClaw skills, properly enable them in openclaw.json, and use the skill-creator skill to iterate faster."
date: 2026-03-06
authors:
  - wes
---

I’ve been spending more time trying to make my OpenClaw setup actually useful day to day — not just “cool demo” useful, but repeatable, reliable, real workflow useful.

The biggest shift for me was learning to build **skills** properly.

At first, I treated skills like random instruction files. Sometimes they worked, sometimes they didn’t, and I’d end up wondering why the assistant felt inconsistent between sessions. After a bit of trial and error, I realized skills are less like prompts and more like reusable operating procedures.

Here’s the process I wish I followed from day one.

---

## What clicked for me: skills = repeatable behavior

When I don’t use skills, I keep rewriting the same context over and over.  
When I do use skills, OpenClaw has structure and defaults to follow.

That means:

- less prompt babysitting
- better consistency
- cleaner outputs
- fewer “why did it do that?” moments

---

## Step 1: I started by creating a proper skill folder

Skills live in my workspace under:

```bash
~/.openclaw/workspace/skills/
```

So I created one like this:

```bash
mkdir -p ~/.openclaw/workspace/skills/my-skill
```

Then added:

```bash
~/.openclaw/workspace/skills/my-skill/SKILL.md
```

Simple enough — but this alone is **not** enough (this tripped me up early).

---

## Step 2: I stopped writing vague SKILL.md files

My first versions were way too generic. The assistant had room to interpret too much, which meant inconsistent output.

Now I always include:

- what the skill is for
- when to use it
- when **not** to use it
- default behavior (date ranges, formats, limits)
- known caveats/failure handling

A basic structure I use:

```md
---
name: my-skill
description: "Handle one focused workflow consistently."
---

## Purpose
## When to use
## When not to use
## Steps
## Caveats
```

Once I started doing this, output quality got way more stable.

---

## Step 3 (the part I missed): you must enable skills in `openclaw.json`

This was the biggest “ohhhh that’s why” moment for me.

Just creating the folder doesn’t automatically make OpenClaw use the skill. You still need to enable it in config.

Example (sanitized):

```json
{
  "skills": {
    "install": {
      "nodeManager": "npm"
    },
    "entries": {
      "playwright-mcp": {
        "enabled": true
      },
      "ga4-mcp": {
        "enabled": true,
        "env": {
          "GOOGLE_APPLICATION_CREDENTIALS": "/opt/openclaw/secrets/ga4.json",
          "GA4_PROPERTY_ID": "YOUR_GA4_PROPERTY_ID",
          "GOOGLE_PROJECT_ID": "YOUR_GOOGLE_PROJECT_ID"
        }
      }
    }
  }
}
```

Important: never publish your real IDs/secrets in examples. Use placeholders.

---

## Step 4: I learned to iterate skills like code, not docs

This mindset helped a lot.

When a task goes wrong, I don’t just blame the model anymore — I update the skill:
- tighten the instructions
- clarify defaults
- add guardrails
- retest

That feedback loop is where the real improvements happen.

---

## The meta unlock: using `skill-creator` to build better skills

OpenClaw has a `skill-creator` skill specifically for creating and updating skills.

Once I started using that, writing new skills got much faster and cleaner.  
It’s kind of recursive in the best way: use a skill to improve your skills.

If you’re building more than one workflow, it’s worth using early.

---

## Mistakes I made (so you can skip them)

- Assuming folder creation = skill is active
- Writing instructions that were too broad
- Mixing multiple responsibilities into one skill
- Forgetting to document edge cases
- Accidentally exposing real config values in examples

---

## Final thought

I used to think better prompting was the answer.  
Now I think better **skill design** is the answer.

Prompting helps for one-off tasks.  
Skills help when you want OpenClaw to be dependable over time.

If you’re learning this too, hopefully this saves you a few painful loops I had to learn the hard way.
