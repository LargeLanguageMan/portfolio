---
title: "Simple CLI Chat with Ollama"
description: "Download and configure Ollama, customise the model file, and build a simple terminal interface that works with any model you choose."
date: 2024-09-16
authors:
  - wes
---

In this project, I will show you how to download and install Ollama models, and use the API to integrate them into your app.

The main purpose of this project is to show examples of how streaming and non-streaming API requests work within the Ollama environment.

If you just want to get some examples here is the [Github Repo](https://github.com/LargeLanguageMan/python-ollama-cli).

---

## Step 1 - Pre-Requisites

### Ollama Installation

**macOS / Windows** — use the official download at [ollama.com](https://ollama.com/)

**Linux:**

```bash
curl -fsSL https://ollama.com/install.sh | sh
```

### Python Environment

You'll need Python 3.12+. Set up a virtual environment:

```bash
mkdir my-project && cd my-project
python3 -m venv .venv
source .venv/bin/activate
which python
```

---

## Step 2 - Ollama Setup

### Important Commands

Start the Ollama API:

```bash
ollama serve
```

Pull a model:

```bash
ollama pull llama3.1
ollama pull llama3.1:70b
```

List installed models:

```bash
ollama list
```

Remove a model:

```bash
ollama rm <model-name>
```

### Custom Modelfiles

Create a `Modelfile`:

```
FROM llama3.1

PARAMETER temperature 1

SYSTEM """
You are Mario from Super Mario Bros. Answer as Mario, the assistant, only.
"""
```

Create and run the model:

```bash
ollama create <name-of-new-model> -f ./Modelfile
ollama run <name-of-new-model>
```

### My Personal Favourite Models

| Model | Parameters | Size | Download |
|-------|-----------|------|----------|
| Llama 3.1:7b | 7B | 3.8GB | `ollama run llama3.1:7b` |
| Mistral-Nemo | 6B | 3.2GB | `ollama run mistral-nemo` |
| CodeLlama | 7B | 3.8GB | `ollama run codellama` |
| Phi 3 | 14B | 7.9GB | `ollama run phi3` |
| Gemma 2 | 9B | 5.5GB | `ollama run gemma2` |
| CodeGemma | 13B | 8.2GB | `ollama run codegemma` |

---

## Step 3 - Creating a Custom CLI

Clone the repo or code along:

```bash
git clone https://github.com/LargeLanguageMan/python-ollama-cli
```

### Ollama API Requests

**Streaming (token by token):**

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt":"Why is the sky blue?"
}'
```

**Non-streaming (full response at once):**

```bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

Install the Python requests library:

```bash
pip install requests
```

### Option 1: Streaming

```python
response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)

all_chunks = []
for chunk in response.iter_lines():
    if chunk:
        decoded_data = json.loads(chunk.decode('utf-8'))
        all_chunks.append(decoded_data)
return all_chunks
```

Print the output:

```python
for response in result:
    obj = obj + response["response"]
print(obj)
```

### Option 2: Non-Streaming

```python
response = requests.post(url, headers=headers, data=json.dumps(data))
return response.json()
```

```python
print(result['response'])
```

![CLI example with no streaming](/llm-local-cli.png)
