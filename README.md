<h2 align="center">
 <br>
 <img src="https://i.imgur.com/f1C7EdN.png" alt="AI StockBot Powered by Groq with Tool Use and Generative UI" width="150">
 <br>
 <br>
 StockBot on GroqLabs: Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More. 
 <br>
</h2>

<p align="center">
 <a href="https://github.com/bklieger-groq/stockbot-on-groq/stargazers"><img src="https://img.shields.io/github/stars/bklieger-groq/stockbot-on-groq"></a>
 <a href="https://github.com/bklieger-groq/stockbot-on-groq/blob/main/LICENSE.md">
 <img src="https://img.shields.io/badge/License-MIT-green.svg">
 </a>
</p>

<p align="center">
 <a href="#Overview">Overview</a> •
 <a href="#Features">Features</a> •
 <a href="#Quickstart">Quickstart</a> •
 <a href="#Contributing">Contributing</a>
</p>

<br>

[Demo of StockBot](https://github.com/user-attachments/assets/a0d16c82-6a64-42c7-92c6-50194d41f0f6)
> Demo of StockBot providing relevant, live, and interactive stock charts and interfaces


StockBot Powered by Groq: Lightning Fast AI Chatbot with Live, Interactive Market Data
 StockBot Powered by Groq: Lightning Fast AI Chatbot that Responds With Interactive Stock Charts, Financials, News, and Screeners. 


> [!IMPORTANT]
>  Note: StockBot may provide inaccurate information and does not provide investment advice.

## Overview

GroqNotes is a streamlit app that scaffolds the creation of structured lecture notes by iteratively structuring and generating notes from transcribed audio lectures using Groq's Whisper API. The app mixes Llama3-8b and Llama3-70b, utilizing the larger model for generating the notes structure and the faster of the two for creating the content.


### Features

- 🎧 Generate structured notes using transcribed audio by Whisper-large and text by Llama3
- ⚡ Lightning fast speed transcribing audio and generating text using Groq
- 📖 Scaffolded prompting strategically switches between Llama3-70b and Llama3-8b to balance speed and quality
- 🖊️ Markdown styling creates aesthetic notes on the streamlit app that can include tables and code 
- 📂 Allows user to download a text or PDF file with the entire notes contents


### Widgets




## Quickstart

> [!IMPORTANT]
> To use GroqNotes, you can use a hosted version at [groqnotes.streamlit.app](https://groqnotes.streamlit.app) or [groqnotes.replit.app](https://groqnotes.streamlit.app).
> Alternatively, you can run GroqNotes locally with Streamlit using the quickstart instructions.




You will need to use the environment variables [defined in `.env.example`](.env.example) to run Next.js AI Chatbot. It's recommended you use [Vercel Environment Variables](https://vercel.com/docs/projects/environment-variables) for this, but a `.env` file is all that is necessary.

> Note: You should not commit your `.env` file or it will expose secrets that will allow others to control access to your various OpenAI and authentication provider accounts.

1. Install Vercel CLI: `npm i -g vercel`
2. Link local instance with Vercel and GitHub accounts (creates `.vercel` directory): `vercel link`
3. Download your environment variables: `vercel env pull`

```bash
pnpm install
pnpm dev
```

Your app template should now be running on [localhost:3000](http://localhost:3000/).

## Authors

This library is created by [Vercel](https://vercel.com) and [Next.js](https://nextjs.org) team members, with contributions from:

- Jared Palmer ([@jaredpalmer](https://twitter.com/jaredpalmer)) - [Vercel](https://vercel.com)
- Shu Ding ([@shuding\_](https://twitter.com/shuding_)) - [Vercel](https://vercel.com)
- shadcn ([@shadcn](https://twitter.com/shadcn)) - [Vercel](https://vercel.com)
