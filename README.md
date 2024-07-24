<h2 align="center">
 <br>
 <img src="https://i.imgur.com/f1C7EdN.png" alt="AI StockBot Powered by Groq with Tool Use and Generative UI" width="250">
 <br>
 <br>
 StockBot Powered by Groq: Lightning Fast AI Chatbot that Responds With Live Interactive Stock Charts, Financials, News, Screeners, and More 
 <br>
</h2>

<p align="center">
 <a href="#Overview">Overview</a> •
 <a href="#Features">Features</a> •
  <a href="#Interfaces">Interfaces</a> •
 <a href="#Quickstart">Quickstart</a> •
 <a href="#Credits">Credits</a>
</p>

<br>

[Demo of StockBot](https://github.com/user-attachments/assets/5bcb0f0d-1255-4ccd-b1c2-82cc841abb53)
> Demo of StockBot providing relevant, live, and interactive stock charts and interfaces

## Overview

StockBot is an AI-powered chatbot that leverages Llama3 70b on Groq, Vercel’s AI SDK, and TradingView’s live widgets to respond in conversation with live, interactive charts and interfaces specifically tailored to your requests. Groq's speed makes tool calling and providing a response near instantaneous, allowing for a sequence of two API calls with separate specialized prompts to return a response.

> [!IMPORTANT]
>  Note: StockBot may provide inaccurate information and does not provide investment advice. It is for entertainment and instructional use only.

## Features

- 🤖 **Real-time AI Chatbot**: Engage with AI powered by Llama3 70b to request stock news, information, and charts through natural language conversation
- 📊 **Interactive Stock Charts**: Receive near-instant, context-aware responses with interactive TradingView charts that host live data
- 🔄 **Adaptive Interface**: Dynamically render TradingView UI components for financial interfaces tailored to your specific query
- ⚡ **Groq-Powered Performance**: Leverage Groq's cutting-edge inference technology for near-instantaneous responses and seamless user experience
- 🌐 **Multi-Asset Market Coverage**: Access comprehensive data and analysis across stocks, forex, bonds, and cryptocurrencies

## Interfaces
| Description | Widget |
|-------------|--------|
| **Heatmap of Daily Market Performance**<br>Visualize Stock and ETF market trends at a glance with an interactive heatmap. | ![Heatmap of Daily Stock Market Performance](https://github.com/user-attachments/assets/2e3919a3-280b-4be4-adcd-a1ff636bff3e)  ![Heatmap of Daily ETF Market Performance](https://github.com/user-attachments/assets/be6bc53f-469c-45f0-b5c4-b257f0fcc56b)|
| **Top Gainers, Losers and Most active stocks**<br>Get detailed financial metrics and key performance indicators for any stock. | ![Breakdown of Financial Data for Stocks](https://github.com/user-attachments/assets/836df056-d8b2-4486-9409-a58b08457454) |
| **Breakdown of Financial Data for Stocks**<br>Get detailed financial metrics and key performance indicators for any stock. | ![Breakdown of Financial Data for Stocks](https://github.com/user-attachments/assets/c1c32dac-8295-4efb-ac1e-2eea8a89e7db) |
| **Price History of Stock**<br>Track the historical price movement of stocks with customizable date ranges. | ![Price History of Stock](https://github.com/user-attachments/assets/f588068e-4d95-4188-96fd-866d355c993e) |
| **Candlestick Stock Charts for Specific Assets**<br>Analyze price patterns and trends with detailed candlestick charts. | ![Candlestick Stock Charts for Specific Assets](https://github.com/user-attachments/assets/ce9ea4a8-a1fe-4ce7-be60-3f5d64d50ced) |
| **Top Stories for Specific Stock**<br>Stay informed with the latest news and headlines affecting specific companies. | ![Top Stories for Specific Stock](https://github.com/user-attachments/assets/fa0693f4-8eca-4d5c-90e7-42afda0d8acc) |
| **Stock Screener to Find New Stocks and ETFs**<br>Discover new companies with a stock screening tool. | ![Stock Screener to Find New Stocks and ETFs](https://github.com/user-attachments/assets/8ecadec9-69a1-4e18-a9fe-7b30df9f6ff5) |

## Quickstart

> [!IMPORTANT]
> To use StockBot, you can use a hosted version at [groq-stockbot.vercel.app](https://groq-stockbot.vercel.app/).
> Alternatively, you can run StockBot locally with Streamlit using the quickstart instructions.


You will need a Groq API Key to run the application. You can obtain one [here on the Groq console](https://console.groq.com/keys).

To get started locally, you can run the following:

```bash
pnpm install
pnpm dev
```

Your app should now be running on [localhost:3000](http://localhost:3000/).

## Credits

This app was developed by [Benjamin Klieger](https://x.com/benjaminklieger) at [Groq](https://groq.com) and uses the AI Chatbot template created by Vercel: [Github Repository](https://github.com/vercel/ai-chatbot).
