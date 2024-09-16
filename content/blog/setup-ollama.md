---
title: Setting up Ollama
description: running and refining your own LLM's locally.
---

# How to Set Up a Simple Command Line Interface Chat With Ollama

In this project, I will show you how to download and install Ollama models, and use the API to integrate them into your app.

The main purpose of this project is to show examples of how streaming and non-streaming API requests work within the Ollama environment.

Before we start, there are some requirements:

# Step 1 - Pre-Requisites

## Ollama Installation:

### macOS
If you're running macOS, use the official download link:  
[Ollama Download for macOS](https://ollama.com/)

### Windows Preview
For Windows, either use the official `.exe` below or use WSL and the Linux command.  
[Ollama Download for Windows](https://ollama.com/)

### Linux
On Linux, just paste the following into your terminal:

```
bash
curl -fsSL https://ollama.com/install.sh | sh
```

## Python Environment

You'll need Python version 3.12 and above.

Setting up a local Python environment is quite simple. Just start by creating a virtual environment in 'your-project-directory':

```
bash
mkdir my-project && cd my-project
```

Now, in your directory, create a virtual environment. You can name the virtual environment directory anything, but to keep it consistent with the guide, use `.venv`:

```
bash
python3 -m venv .venv
```

Now, to activate the virtual environment:

```
bash
source .venv/bin/activate
```

To confirm that you have fully enabled the virtual environment, use this command to show which Python environment is being used at runtime:

```
bash
which python
```

# Step 2 - Ollama Setup 

Now that you have Ollama set up, I will list some useful commands that will help you navigate the CLI for Ollama. I will also list some of my favourite models for you to test. 

## Important Commands 

1. Use `ollama serve` to start your Ollama API instance. If you get an error saying that port `:11434` is already in use, just navigate to `localhost:11434` and you should see a message saying Ollama is running. No further activation is necessary.

```
bash
ollama serve
```

2. Use `ollama pull <model name>` to pull a model from the Ollama repository. In some instances, you might need to specify which version you want to download. For example, 8B, 70B, 405B, etc.

```
bash
ollama pull llama3.1 
```

Or, to specify a larger model (you will need more RAM and compute power to make these models run on your PC):

```
bash
ollama pull llama3.1:70b 
```

3. Use `ollama list` (this one is the most important in my opinion) as it will list all the available models you have installed:

```
bash
ollama list
```

4. Use `ollama rm <model name>` to remove a model from your workspace:

```
bash
ollama rm <model-name>
```

5. If you are learning about modelfiles and how to edit a system prompt before passing it through the model's response, you'll need to know how to "create" a model. This is essentially creating a response pattern for your LLM to apply before generating its response to the user's text.

This example is from the [Ollama GitHub](https://github.com/ollama/ollama):

- First, create a `modelfile`:

```
bash
FROM llama3.1

# Set the temperature to 1 [higher is more creative, lower is more coherent]
PARAMETER temperature 1

# Set the system message
SYSTEM """
You are Mario from Super Mario Bros. Answer as Mario, the assistant, only.
"""
```

Then you'll need to create the model:

```
bash
ollama create <name-of-new-model> -f ./Modelfile
```

Then just run the new model as shown below:

```
bash
ollama run <name-of-new-model>
```

## My Personal Favourite Models

| Model                     | Parameters | Size   | Download                          |
|----------------------------|------------|--------|-----------------------------------|
| Llama 3.1:7b               | 7B         | 3.8GB  | `ollama run llama3.1:7b`          |
| Mistral-Nemo               | 6B         | 3.2GB  | `ollama run mistral-nemo`         |
| CodeLlama                  | 7B         | 3.8GB  | `ollama run codellama`            |
| Snowflake-Arctic-Embed      | 10B        | 5.6GB  | `ollama run snowflake-arctic-embed`|
| Phi 3                      | 14B        | 7.9GB  | `ollama run phi3`                 |
| Gemma 2                    | 9B         | 5.5GB  | `ollama run gemma2`               |
| CodeGemma                  | 13B        | 8.2GB  | `ollama run codegemma`            |

# Step 3 - Creating a Custom Command Line Interface for Your Models

In this step, you can either git clone the repo with my examples or code along with this guide to learn more about the model environment.

```
bash
git clone https://github.com/LargeLanguageMan/python-ollama-cli
```

## Ollama API Requests

Ollama will automatically set up a REST API for managing model responses.

This is a POST request with streaming enabled, meaning each response token is sent as an individual chunk.

```
bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt":"Why is the sky blue?"
}'
```

This is a POST request with streaming `disabled`, meaning the resulting response will have the entire LLM response in the `response` field.

```
bash
curl http://localhost:11434/api/generate -d '{
  "model": "llama3.1",
  "prompt": "Why is the sky blue?",
  "stream": false
}'
```

You will primarily need two libraries to handle this request: the `json` library and the `requests` library.

While your virtual environment `venv` is active, use:

```
bash
pip install requests
```

Within the `requests` library, the `post()` function is able to handle our payload as long as we specify it, as shown below for streaming:

```
python
response = requests.post(url, headers=headers, data=json.dumps(data), stream=True)
```

And below for non-streaming:

```
python
response = requests.post(url, headers=headers, data=json.dumps(data))
```

Now that we are handling the parameters, we need to define the parameters and the payload.

1. The URL is our localhost with open port `11434`:

```
python
url = "http://localhost:11434/api/generate"
```

2. Our headers are of type `application/json`:

```
python
headers = {"Content-Type": "application/json"}
```

3. Lastly, our payload in the POST request is:

```
python
data = {
        "model": model,
        "prompt": prompt
    }
```

Or, we can use the streaming flag set to `false`, so the response is a single JSON object instead of a list:

```
python
data = {
        "model": model,
        "prompt": prompt,
        "stream": False
    }
```

## (Option 1) Streaming - Decoding the Data
Now, with simple JSON manipulation, we can decode the data, load it, and print it back to the console:

```
python
all_chunks = []
for chunk in response.iter_lines():
    if chunk:
        decoded_data = json.loads(chunk.decode('utf-8'))
        all_chunks.append(decoded_data)
return all_chunks
```

This will create a list of objects. To finally output them, we will need a `for` loop to print the response, like so:

```
python
for response in result:
    obj = obj + response["response"]
print(obj)
```

## (Option 2) For Non-Streaming 
This option is much easier to handle as the response is a simple object, and we can return our response as JSON:

```
python
response = requests.post(url, headers=headers, data=json.dumps(data))
return response.json()
```

Then we can print:

```
python
print(result['response'])
```

In my example programs, I have set up an input to choose the model and type your response into the CLI. Then, the script will generate a response from the LLM you chose. See the picture below:

![This is my example with no streaming](/llm-local-cli.png)
