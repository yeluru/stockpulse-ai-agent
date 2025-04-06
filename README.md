# 📈 StockPulse AI Agent (MVP)

StockPulse is a cloud-native AI agent that allows users to search and select up to 10 stock tickers, subscribe with their email, and receive daily insights powered by Amazon Bedrock.

This project demonstrates an autonomous frontend UI, with full backend integration coming soon.

---

🧠 StockPulse Agent MVP
“Your autonomous AI stock analyst — tracks what you care about, filters noise, and emails what matters, every morning.”

✅ User-Facing Features
1. 🔍 Search + Add to Watchlist
Users can search by company name or ticker symbol

Autocomplete results (powered by FMP search endpoint)

Each result comes with a ✅ checkbox: “Add to My Watchlist”

Max 10 stocks enforced

2. 📧 Email Collection
When user hits 10 symbols, prompt for email

Simple form: Enter your email to receive daily stock insights

Submits { email, [symbols] } to backend

🤖 Agentic Behavior (Daily Autonomy)
Every Morning via Scheduled Lambda:
Loop over all users

For each user:

Fetch stock data + news (for their symbols)

Detect significant events:

Price drop or rise > 4%

Unusual volume spike

Big headline mentions (e.g., “earnings”, “miss”, “CEO”, “lawsuit”)

Create structured prompt for Claude:

matlab
Copy
Edit
Given TSLA dropped 7.8% yesterday with above-average volume and the headline “Tesla Q1 delivery falls short,” should I buy, sell or hold?
Use Claude via Bedrock to reason intelligently

Format a daily briefing:

yaml
Copy
Edit
🟡 TSLA: Dropped 7.8%, above avg volume
📢 News: Q1 deliveries missed
🤖 Claude: HOLD — Weakness expected short term, long-term outlook unchanged
Send email to the user using AWS SES

🗂️ Backend Components
Component	Service Used	Purpose
API Gateway	HTTP API	Accepts {email, symbols} POST
Lambda 1	Ingest User Watchlist	Validates, stores in DynamoDB
DynamoDB Table	Subscriptions	{ email, stocks[] }
Lambda 2 (daily)	stockPulseRunner	Fetch → Analyze → Send Email
EventBridge	Scheduled trigger	Runs stockPulseRunner daily
Bedrock	Claude model	Natural language stock reasoning
SES	Email Service	Sends email reports to users
🧑‍🎨 Frontend UI Components
1. Search + Results
Input field + real-time FMP search

Show symbol + company name + checkbox

Track up to 10 symbols

2. Email Prompt
If 10 selected, show simple Enter your email field

POST to backend

3. Feedback UI (Optional Phase 2)
Let user mark Claude’s advice as 👍/👎 in email

Builds groundwork for adaptive agents

📦 MVP Deliverables
We’ll build:

 React UI with search + checkboxes + email field

 Lambda for storing subscriptions

 DynamoDB table setup

 Lambda (daily job) to:

Fetch stock data + news

Use Bedrock Claude

Format + send email via SES

 Scheduled EventBridge job

🧪 Bonus: Agent-Only Behaviors
Agentic Trait	How We Implement It
🧠 Reasoning	Claude analysis of news + price
🕓 Autonomy	Runs daily via EventBridge
📈 Context Awareness	Only includes notable changes
🧑‍💻 Personalization	Sends only the user’s selected stocks
🎯 Goal-Oriented	Helps users decide: Buy / Sell / Hold
✅ Summary
You’re not just building a tool. You’re building a useful, autonomous assistant that:

Thinks like a financial intern,

Works without being asked,

And delivers what matters — every day.

Would you like me to begin with Step 1: Frontend update with stock search + checkbox + email input?

Or shall we start from the backend first (DynamoDB + ingestion Lambda)?

We'll implement:

🔎 A search box with live autocomplete (after 3 characters)
🏷️ Display Company Name (Ticker) results
✅ Checkbox to add each symbol to your watchlist
🚫 Disable adding beyond 10 symbols
📧 Email prompt once the list reaches 10
📤 Submit { email, symbols[] } to your backend

✅ Step 1: Implement Stock Autocomplete UI in React
We’ll use the FinancialModelingPrep Search API:


GET https://financialmodelingprep.com/api/v3/search?query=TES&limit=10&apikey=YOUR_API_KEY
This returns a list of companies that match TES, like:


[
  { "symbol": "TSLA", "name": "Tesla Inc" },
  { "symbol": "TESI", "name": "Tesi Spa" },
  ...
]


## 🌐 Live Features

- 🔍 Autocomplete company/ticker search
- ✅ Select up to 10 stocks
- 📧 Email subscription box (always visible)
- 📋 Selected stock list on the right panel
- 🎨 Elegant, modern, responsive design

---

## 🛠️ Tech Stack

| Component       | Tech                      |
|----------------|---------------------------|
| Frontend       | React (CRA)               |
| Styling        | CSS                       |
| API            | FinancialModelingPrep     |
| Upcoming       | AWS Lambda, DynamoDB, SES |

---

## 📦 Project Structure

stockpulse-ui/ 
    ├── src/ 
        │ ├── App.js 
        │ ├── App.css 
        │ ├── SearchBar.js 
        │ ├── SearchBar.css 
    └── README.md

---

## 🚀 Setup Instructions

### 1. Install & Run

🧱 Step 1: Create the React Project
Open your terminal and run:

npx create-react-app stockpulse-ui
cd stockpulse-ui
npm install axios

This will:
Scaffold a fresh React app
Install axios for API calls

npm install
npm start

Runs on: http://localhost:3000

🧩 Source Code

📁 App.js

import React, { useState } from 'react';
import SearchBar from './SearchBar';
import './App.css';

function App() {
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [email, setEmail] = useState('');

  const handleSubmit = async () => {
    const payload = { email, symbols: selectedSymbols };
    console.log('Submitting to backend:', payload);
    // Later: send to Lambda via API Gateway
  };

  return (
    <div className="App">
      <h1>📈 Stock Watchlist AI Agent</h1>
      <p className="instructions">
        Search for a company or ticker, select up to 10 stocks, and receive daily AI-powered insights in your email inbox.
      </p>

      <div className="main-layout">
        <div className="left-panel">
          <SearchBar
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
          />
        </div>

        <div className="right-panel">
          <div className="subscribe-section">
            <input
              type="email"
              placeholder="Enter your email to receive daily insights"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSubmit}>Subscribe</button>
          </div>

          {selectedSymbols.length > 0 && (
            <div className="selected-list">
              <h4>Selected Stocks ({selectedSymbols.length}/10)</h4>
              <ul>
                {selectedSymbols.map((symbol) => (
                  <li key={symbol}>{symbol}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;

🎨 App.css

body {
  font-family: 'Segoe UI', Tahoma, sans-serif;
  background: #f1f3f6;
  margin: 0;
  padding: 0;
}

.App {
  max-width: 960px;
  margin: 3rem auto;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
}

h1 {
  font-size: 28px;
  color: #1e293b;
  margin-bottom: 1.5rem;
  text-align: center;
}

.instructions {
  font-size: 15px;
  color: #555;
  margin-bottom: 2rem;
  line-height: 1.6;
  text-align: center;
}

.main-layout {
  display: flex;
  gap: 2rem;
  align-items: flex-start;
  justify-content: space-between;
  flex-wrap: nowrap;
}

.left-panel {
  flex: 1;
  min-width: 0;
  background: #f8fafc;
  padding: 1rem;
  border-radius: 12px;
}

.right-panel {
  flex-shrink: 0;
  width: 320px;
  background: #f8fafc;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 0 12px rgba(0, 0, 0, 0.05);
}

.subscribe-section input {
  padding: 0.75rem;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 1rem;
  box-sizing: border-box;
}

.subscribe-section button {
  width: 100%;
  padding: 0.75rem;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.3s;
}

.subscribe-section button:hover {
  background-color: #1e40af;
}

.selected-list {
  margin-top: 1rem;
  text-align: left;
  background: #f1f5ff;
  padding: 1rem;
  border-radius: 12px;
}

.selected-list h4 {
  margin-top: 0;
  font-size: 16px;
  color: #333;
}

.selected-list ul {
  list-style: none;
  padding-left: 0;
  margin: 0;
}

.selected-list li {
  padding: 4px 0;
  font-weight: 500;
  color: #1e3a8a;
}

@media (max-width: 768px) {
  .main-layout {
    flex-direction: column;
  }

  .right-panel {
    width: 100%;
    margin-top: 2rem;
  }
}
🔎 SearchBar.js

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchBar.css';

const API_KEY = 'YOUR_FMP_API_KEY'; // Replace with your real key
const MAX_SELECTION = 10;

function SearchBar({ selectedSymbols, setSelectedSymbols }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);

  useEffect(() => {
    const fetchResults = async () => {
      if (query.length < 3) {
        setResults([]);
        return;
      }

      try {
        const response = await axios.get(
          `https://financialmodelingprep.com/api/v3/search?query=${query}&limit=10&apikey=${API_KEY}`
        );
        setResults(response.data);
      } catch (error) {
        console.error('Error fetching autocomplete results:', error);
      }
    };

    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const toggleSymbol = (symbol) => {
    const exists = selectedSymbols.includes(symbol);
    if (exists) {
      setSelectedSymbols(selectedSymbols.filter((s) => s !== symbol));
    } else {
      if (selectedSymbols.length >= MAX_SELECTION) return;
      setSelectedSymbols([...selectedSymbols, symbol]);
    }
  };

  return (
    <div className="search-bar">
      <input
        placeholder="Search company name or symbol"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />
      <ul className="results">
        {results.map(({ symbol, name }) => (
          <li key={symbol}>
            <label>
              <input
                type="checkbox"
                checked={selectedSymbols.includes(symbol)}
                onChange={() => toggleSymbol(symbol)}
              />
              {name} ({symbol})
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default SearchBar;
🎨 SearchBar.css

.search-bar input {
  width: 100%;
  padding: 0.75rem;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 8px;
  margin-bottom: 1rem;
  box-sizing: border-box;
}

.results {
  list-style: none;
  padding: 0;
  margin: 0;
}

.results li {
  margin-bottom: 0.5rem;
  text-align: left;
}

.results input[type='checkbox'] {
  margin-right: 0.5rem;
}
🔑 API Key
Edit SearchBar.js:


const API_KEY = 'YOUR_FMP_API_KEY'; // Replace with your actual key
Get one at: https://site.financialmodelingprep.com/developer/docs/

✅ Remaining Functionality for StockPulse MVP
1. Backend Data Capture (Lambda + API Gateway + DynamoDB)
We need to store the user’s email and selected stock symbols for daily processing.

Create an AWS Lambda function (storePreferences)

API Gateway (POST endpoint) to receive { email, symbols: [...] }

Validate inputs and write to a DynamoDB table StockPulseSubscriptions

2. Daily Scheduled Trigger (EventBridge or CloudWatch Events)
This will automatically run once per day (e.g., 8 AM ET) to process subscriptions.

Scheduled Lambda trigger (cron-based)

Query all saved subscriptions from DynamoDB

3. Stock Data + News Fetcher
For each stock symbol in each user’s subscription:

Fetch current price & volume from FinancialModelingPrep

Fetch recent news headlines from NewsAPI

4. AI Reasoning with Amazon Bedrock
For each set of symbols:

Construct a prompt for each stock with its data and news

Call Bedrock Claude (via bedrock-runtime) to get smart recommendation

Aggregate the output for the email body

5. Email Delivery via Amazon SES
Send daily personalized insights to each user.

Use AWS SES to send rich-text or plain emails

Optionally add unsubscribe link (for a real system)

6. Security & Config
CORS already configured ✅

IAM roles for Lambda access to Bedrock, DynamoDB, SES

API Keys stored securely (we can add AWS Secrets Manager later)

7. Bonus Features (Optional for Future)
User unsubscribe endpoint (via frontend or email link)

Store timestamp of last sent insight

Limit email frequency (e.g., max once per day)

Advanced UI: AI confidence score or signal strength

📝 Instructions:
Go to DynamoDB Console: https://console.aws.amazon.com/dynamodb/

Click “Create table”

Set the following fields:

Table name: StockPulseSubscriptions

Partition key:

Name: email

Type: String

Leave sort key empty.

Uncheck “Use default settings” and modify:

Capacity mode: On-Demand (pay-per-request — easier for MVP)

Leave Auto Scaling, TTL, Point-in-Time Recovery, etc. disabled.

Click Create table

📦 Result:
You’ll have a table with the following structure:

email	symbols
user@example.com	["AAPL", "TSLA"]
Let me know when the table is successfully created ✅

📝 Instructions:
Go to AWS Lambda Console:
https://console.aws.amazon.com/lambda/

Click “Create function”

Function name: storeStockSubscription

Runtime: Python 3.11

Architecture: x86_64

Permissions:

Choose “Create a new role with basic Lambda permissions”

Click Create function

✅ After it's created:
In the Code Source section, replace the default code with the following:

python
Copy
Edit
import json
import boto3
import datetime

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('StockPulseSubscriptions')

def lambda_handler(event, context):
    try:
        body = json.loads(event.get('body', '{}'))
        email = body.get('email')
        symbols = body.get('symbols', [])

        if not email or not isinstance(symbols, list) or not symbols:
            return {
                'statusCode': 400,
                'headers': cors_headers(),
                'body': json.dumps({'error': 'Missing email or symbols list'})
            }

        response = table.put_item(
            Item={
                'email': email,
                'symbols': symbols,
                'timestamp': datetime.datetime.utcnow().isoformat()
            }
        )

        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': json.dumps({'message': 'Subscription saved successfully'})
        }

    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': json.dumps({'error': str(e)})
        }

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }
Click Deploy

✅ Step 3: Create API Gateway for storeStockSubscription Lambda
🎯 Goal:
Create a REST API endpoint that accepts POST requests with { email, symbols } from your frontend.

📝 Instructions (AWS Console):
Go to the API Gateway Console
https://console.aws.amazon.com/apigateway/

Click “Create API”

Choose HTTP API (not REST)

Click “Build”

Configure:

API name: stockpulse-api

Integration type: Lambda function

Lambda: storeStockSubscription

Configure routes:

Method: POST

Resource path: /subscribe

Click Next, leave defaults, and Create

✅ Step 4: Enable CORS
In the left sidebar of your new API → Click Routes

Click on /subscribe – POST

Click “Attach CORS” (top right)

Use the following values:

Access-Control-Allow-Headers: Content-Type

Access-Control-Allow-Methods: POST,OPTIONS

Access-Control-Allow-Origin: *

Click Attach CORS

Go to Deployments tab → Click Deploy

Copy the Invoke URL
Example:

bash
Copy
Edit
https://r8pqr1234x.execute-api.us-east-1.amazonaws.com/subscribe