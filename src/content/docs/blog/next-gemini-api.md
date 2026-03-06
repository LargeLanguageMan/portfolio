---
title: "Setting Up a Next.js App with the Gemini API"
description: "Integrate Google's Gemini model API into a Next.js application. Covers environment setup, API key configuration, and building a single-page app with dynamic AI-powered responses."
date: 2024-10-27
authors:
  - wes
---

In this guide, I'll walk you through setting up a Next.js application, creating a home page to interact with a custom persona, and integrating the Google Gemini API for dynamic responses.

You can view an example working demo on my website [aiprojectlabs](https://sadbob.aiprojectlabs.com/)

If you want to see how I set this up, use my [GitHub repository](https://github.com/LargeLanguageMan/gemini-app-ai) as a guide.

Before we get started, make sure you have:

1. A Next.js environment set up.
2. Access to the Google Generative AI Gemini API and an API key.

---

## Step 1: Set Up the App Environment

### Install Next.js

```bash
npx create-next-app@latest my-gemini-app
cd my-gemini-app
```

### Install Dependencies

```bash
npm install @google/generative-ai
```

### Install Component Library

```bash
npx shadcn@latest init
```

### Configure Environment Variables

1. Visit [Google AI Studio](https://ai.google.dev/aistudio)
2. Navigate to **API Keys** and click **Generate New Key**
3. Create a `.env.local` file and add your key:

```bash
touch .env.local
```

```plaintext
NEXT_PUBLIC_GEMINI_API_KEY=YOUR_GEMINI_API_KEY
```

### Start the Development Server

```bash
npm run dev
```

Navigate to `localhost:3000` to confirm everything is set up correctly.

---

## Step 2: Set Up the Home Page

Add the following code to `app/page.tsx` to create a simple interface for "Sad Bob":

```typescript
"use client";

import Image from "next/image";
import { useState } from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
            <Label htmlFor="theme">Ask Sad Bob how he feels...</Label>
            <Input type="text" id="input" name="input" placeholder="Enter something..." className="w-full" />
            <Button type="submit" className="w-full">Generate</Button>
          </form>
        </CardContent>
        <CardFooter>
          <pre>{response || "Sad Bob's response will appear here."}</pre>
        </CardFooter>
      </Card>
    </div>
  );
}
```

Install the required shadcn components:

```bash
npx shadcn@latest add card label avatar button
```

---

## Step 3: Integrate the Gemini API

Create `app/api/gemini/route.ts`:

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
                Sad Bob will always end with some variation of "Will you answer Freak Bob when he calls?"

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

---

## Step 4: Test the Setup

1. Run the development server (`npm run dev`)
2. Visit the home page, enter a prompt, and see Sad Bob's response

![sad bob](/sadbob.png)

Following these steps, you've successfully set up a Next.js app with Google's Gemini API to provide interactive responses using a custom persona.
