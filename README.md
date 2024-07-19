<h2 align="center">
 <br>
 <img src="https://i.imgur.com/f1C7EdN.png" alt="AI StockBot Powered by Groq with Tool Use and Generative UI" width="250">
 <br>
 <br>
 StockBot on GroqLabs: Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More. 
 <br>
</h2>

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

- 🤖 **Real-time AI Chatbot**: Engage with AI powered by Llama3 70b to request stock news, information, and charts through natural language conversation
- 📊 **Interactive Stock Charts**: Receive near-instant, context-aware responses with interactive TradingView charts that host live data
- 🔄 **Adaptive Interface**: Dynamically render TradingView UI components for financial interfaces tailored to your specific query
- ⚡ **Groq-Powered Performance**: Leverage Groq's cutting-edge inference technology for near-instantaneous responses and seamless user experience
- 🌐 **Multi-Asset Market Coverage**: Access comprehensive data and analysis across stocks, forex, bonds, and cryptocurrencies

## Widgets

| Widget | Description |
|--------|-------------|
| ![Heatmap of Daily Market Performance](https://github.com/user-attachments/assets/2e3919a3-280b-4be4-adcd-a1ff636bff3e) | **Heatmap of Daily Market Performance**<br>Visualize market trends at a glance with our interactive heatmap. |
| ![Breakdown of Financial Data for Stocks](https://github.com/user-attachments/assets/c1c32dac-8295-4efb-ac1e-2eea8a89e7db) | **Breakdown of Financial Data for Stocks**<br>Get detailed financial metrics and key performance indicators for any stock. |
| ![Price History of Stock](https://github.com/user-attachments/assets/f588068e-4d95-4188-96fd-866d355c993e) | **Price History of Stock**<br>Track the historical price movement of stocks with customizable date ranges. |
| ![Candlestick Stock Charts for Specific Assets](https://github.com/user-attachments/assets/ce9ea4a8-a1fe-4ce7-be60-3f5d64d50ced) | **Candlestick Stock Charts for Specific Assets**<br>Analyze price patterns and trends with our detailed candlestick charts. |
| ![Top Stories for Specific Stock](https://github.com/user-attachments/assets/fa0693f4-8eca-4d5c-90e7-42afda0d8acc) | **Top Stories for Specific Stock**<br>Stay informed with the latest news and headlines affecting your chosen stocks. |
| ![Stock Screener to Find New Stocks and ETFs](https://github.com/user-attachments/assets/8ecadec9-69a1-4e18-a9fe-7b30df9f6ff5) | **Stock Screener to Find New Stocks and ETFs**<br>Discover new investment opportunities with our powerful stock screening tool. |



<img width="737" alt="Heatmap of Daily Market Performance" src="https://github.com/user-attachments/assets/2e3919a3-280b-4be4-adcd-a1ff636bff3e">
> Heatmap of Daily Market Performance

<img width="742" alt="Breakdown of Financial Data for Stocks" src="https://github.com/user-attachments/assets/c1c32dac-8295-4efb-ac1e-2eea8a89e7db">
> Breakdown of Financial Data for Stocks

<img width="743" alt="Price History of Stock" src="https://github.com/user-attachments/assets/f588068e-4d95-4188-96fd-866d355c993e">
> Price History of Stock

<img width="771" alt="Candlestick Stock Charts for Specific Assets" src="https://github.com/user-attachments/assets/ce9ea4a8-a1fe-4ce7-be60-3f5d64d50ced">
> Candlestick Stock Charts for Specific Assets

<img width="777" alt="Top Stories for Specific Stock" src="https://github.com/user-attachments/assets/fa0693f4-8eca-4d5c-90e7-42afda0d8acc">
> Top Stories for Specific Stock

<img width="772" alt="Stock Screener to Find New Stocks and ETFs" src="https://github.com/user-attachments/assets/8ecadec9-69a1-4e18-a9fe-7b30df9f6ff5">
> Stock Screener to Find New Stocks and ETFs


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
