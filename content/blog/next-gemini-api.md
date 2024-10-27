---

title: Setting up a Gemini-Powered Next.js App
description: A guide to integrating Google's Gemini model API into a Next.js application.
image: /gemini.png
---

# How to Set Up a Next.js App with Google’s Gemini API

In this guide, I’ll walk you through setting up a Next.js application, creating a home page to interact with a custom persona, and integrating the Google Gemini API for dynamic responses.

If you want to see how I set this up use my [GitHub repository](https://github.com/LargeLanguageMan/gemini-app-ai) as a guide. 


Before we get started, make sure you have the following:

1. A Next.js environment set up.
2. Access to the Google Generative AI Gemini API and an API key.

---

## Step 1: Set Up the App Environment

### Install Next.js

First, initialize a new Next.js app by running the following commands in your terminal:
```bash
npx create-next-app@latest my-gemini-app
cd my-gemini-app
```

### Install Dependencies

Since we’re using Google’s Generative AI library, install the `@google/generative-ai` package:
```bash
npm install @google/generative-ai
```
### Install Component library

As we're using shadcn for our typscript components we will need to install this library in our app project directory. 

```bash
npx shadcn@latest init
```

### Configure Environment Variables

To retrieve your Gemini API key from Google’s AI Studio:

1. Visit [Google AI Studio](https://ai.google.dev/aistudio).
2. Log in with your Google account, if prompted.
3. Navigate to **API Keys** within the AI Studio dashboard.
4. Click on **Generate New Key** to create a new Gemini API key.
5. Copy the generated key and add it to your `.env.local` file in the following format: (If you do not have a .env.local file please create one with)

```bash
touch .env.local
```
Navigate to you folder 
```plaintext
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `YOUR_GEMINI_API_KEY` with the key you copied from Google AI Studio. 

This key will allow your application to interact with the Gemini API securely.

To keep the API key secure, store it in a `.env.local` file at the root of your project:
```plaintext
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

Replace `YOUR_GEMINI_API_KEY` with your actual API key.

### Start the Development Server

Once everything is set up, run:
```bash
npm run dev
```
to preview that your app has been set up correctly navigate to **localhost:3000**

---

## Step 2: Set Up the Home Page

In this step, we’ll create a basic interface to interact with "Sad Bob," who responds to user inputs. Add the following code to `app/page.tsx` to create the homepage.

```typescript
"use client";

import Image from "next/image";
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { freakBob, testGemini } from "@/app/gemini-app";

declare global {
  interface Window {
    dataLayer: Record<string, any>[];
  }
}

declare const gtag: Function;

export default function Home() {
  const [response, setResponse] = useState<string>('');

  async function getBob(subject: FormData) {
    const input = subject.get('input')?.toString() ?? '';
    const response = await fetch('/api/gemini', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({input}),
    });

    const data = await response.json();
    gtag('event', 'user_ai_text', { 'input_text': input });
    return setResponse(data.text);
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 p-4 space-y-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Meet Sad Bob</CardTitle>
          <Avatar className="w-24 h-24">
            <AvatarImage src="/images/sad-bob.webp" alt="Freakbob" />
            <AvatarFallback>FB</AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardContent>
          <form onSubmit={getBob} className="space-y-4">
            <Label htmlFor="theme">Ask Sad Bob how he feels... 😊</Label>
            <Input type="text" id="input" name="input" placeholder="Enter something..." className="w-full" />
            <Button type="submit" className="w-full">Generate</Button>
          </form>
        </CardContent>
        <CardFooter>
          <pre>{response || "SadBob's response will appear here."}</pre>
        </CardFooter>
      </Card>
    </div>
  );
}
```


In this step, it’s important to note that this is a single-page application, using components like Card, Button, Avatar, and Label from the shadcn library. This means we need to install these components specifically in our application’s component directory.


To install these specific components use: 

```bash
npx shadcn@latest add card label avatar button
```


---

## Step 3: Integrate the Gemini API

Now, let’s set up the Gemini API endpoint in `app/api/gemini/route.ts` to process requests and generate Sad Bob’s responses.

### Create the API Route

In the `app/api` directory, create a `gemini` folder and a file named `route.ts`. Add the following code:

You can also change the system response to be something else to emulate a different character

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

export async function POST(req: NextRequest) {
  try {
    const { input } = await req.json();
    const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY || 'failed');
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent({
      contents: [
        {
          role: 'user',
          parts: [
            {
              text: `
                Your answer to the question or statement below should be in the same manner SpongeBob talks.
                sad Bob will always end with some variation of "Will you answer Freak Bob when he calls?"
                
                Please answer this:
                ${input}.
              `,
            },
          ],
        },
      ],
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 1,
      },
    });

    const text = await result.response.text();
    return NextResponse.json({ text });
  } catch (error) {
    console.error('Error generating content:', error);
    return NextResponse.json({ error: 'Error generating content' }, { status: 500 });
  }
}
```

### Explanation

1. **Request Parsing:** This code retrieves the user’s input from the request body.
2. **Gemini Model Initialisation:** The `GoogleGenerativeAI` class is initialized with the Gemini model and API key.
3. **Custom Persona Prompting:** A detailed prompt structure ensures Sad Bob responds as instructed.
4. **Error Handling:** Any API errors will return a 500 status and an error message.

---

## Step 4: Test the Setup

With everything in place:

1. Run the development server (`npm run dev`).
2. Visit the home page, enter a prompt, and see Sad Bob's response.

![sad bob](/sadbob.png)

---

Following these steps, you’ve successfully set up a Next.js app with Google’s Gemini API to provide interactive responses using a custom persona. Let me know if you run into any issues or need further customisation!
