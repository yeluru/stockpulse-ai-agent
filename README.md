# 📈 StockPulse AI Agent (MVP)

**StockPulse** is a fully serverless, AI-powered agent built using **Amazon Bedrock**, **React**, **DynamoDB**, **Lambda**, and **SES**. It allows users to select up to 10 favorite stocks or ETFs and receive daily AI-generated summaries in their email inbox.

This README provides **end-to-end setup instructions**, architectural context, and coding decisions — so developers can understand **what, why, and how** to build similar AI agents.

---

## 🧠 What You’ll Build

- A modern React-based frontend for searching and selecting stocks
- An API to collect user emails + stock preferences
- A scheduled backend job (via Lambda + EventBridge)
- Dynamic email generation using **Claude via Amazon Bedrock**
- A clean **unsubscribe mechanism** with link handling via CloudFront
- Fully deployed using **AWS services**, no backend servers required

---

## 📌 Why Amazon Bedrock?

Amazon Bedrock lets us call foundation models like **Claude** securely, without provisioning infrastructure or GPUs. It enables our stock agent to **reason over real-time data** — combining prices, volume, and recent headlines — to generate smart BUY / SELL / HOLD recommendations for each stock.

This makes the project a great real-world **AI Agent** use case.

---

## 🔧 Tech Stack Overview

| Component     | Technology                     |
|--------------|---------------------------------|
| Frontend      | React (S3 + CloudFront)         |
| Backend       | AWS Lambda (Python)             |
| Storage       | DynamoDB                        |
| LLM           | Claude via Amazon Bedrock       |
| External APIs | FinancialModelingPrep, NewsAPI  |
| Email Service | Amazon SES                      |
| Auth/Trigger  | API Gateway, EventBridge        |

---

## 🖼️ Architecture Diagram

```mermaid
graph TD
  User[User selects stocks + email]
  Frontend[React Frontend]
  APIGW[API Gateway /subscribe]
  LambdaStore[Lambda: storeSubscription]
  DynamoDB[(DynamoDB)]
  EventBridge[EventBridge Trigger (Daily)]
  LambdaDaily[Lambda: stockPulseRunner]
  FMPAPI[FMP API]
  NewsAPI[News API]
  Bedrock[Claude Model (Bedrock)]
  SES[Amazon SES]
  Email[Personalized Email]

  User --> Frontend
  Frontend --> APIGW
  APIGW --> LambdaStore
  LambdaStore --> DynamoDB

  EventBridge --> LambdaDaily
  LambdaDaily --> DynamoDB
  LambdaDaily --> FMPAPI
  LambdaDaily --> NewsAPI
  LambdaDaily --> Bedrock
  LambdaDaily --> SES
  SES --> Email
```

---

## 🚀 How It Works (End-to-End Flow)

1. **User Search & Selects Stocks**  
   Using the [FMP API](https://financialmodelingprep.com/developer/docs/), users can search by company name or ticker.

2. **Enter Email**  
   Once 1 or more stocks are selected, the user provides an email to receive insights.

3. **Store Subscription**  
   Data is sent via API Gateway to a Lambda (`storeSubscription`), which stores the info in DynamoDB.

4. **Daily Scheduled Agent**  
   Another Lambda (`stockPulseRunner`) runs daily via EventBridge:
   - Fetches user subscriptions
   - Gets live stock price, volume, and news
   - Prompts Claude for reasoning
   - Sends via SES

5. **Unsubscribe Support**  
   Every email has an unsubscribe link. Clicking it calls a Lambda that deletes the email from DynamoDB and shows a confirmation message.

---

## 💻 Code Structure

```bash
stockpulse-ai-agent/
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   ├── SearchBar.js
│   │   ├── SearchBar.css
│   │   └── ...
│   └── package.json
├── lambdas/
│   ├── storeSubscription.py
│   ├── stockPulseRunner.py
│   └── unsubscribeUser.py
└── README.md
```

---

## 🛠️ Frontend Setup (React)

> Full source: `frontend/src/App.js`, `SearchBar.js`, and `App.css`

1. Clone repo:
   ```bash
   git clone https://github.com/yeluru/stockpulse-ai-agent.git
   cd stockpulse-ai-agent/frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Run locally:
   ```bash
   npm start
   ```

4. Configure:
   - In `SearchBar.js`, replace `API_KEY` with your FMP key
   - Update unsubscribe CloudFront URL in `App.js` if changed

---

## 🔄 Backend Setup

### A. DynamoDB Table

1. Go to [AWS DynamoDB Console](https://console.aws.amazon.com/dynamodb/)
2. Create table:
   - Name: `StockPulseSubscriptions`
   - Partition key: `email` (type: String)
   - Capacity: On-Demand

### B. Lambda: `storeSubscription.py`

> Source: `lambdas/storeSubscription.py`

- Stores `{ email, symbols[] }` to DynamoDB
- Integrated via API Gateway POST `/subscribe`

### C. Lambda: `stockPulseRunner.py`

> Source: `lambdas/stockPulseRunner.py`

- Scheduled daily via EventBridge
- Reads from DynamoDB
- Fetches stock data via:
  - FMP quote-short endpoint
  - NewsAPI headlines
- Constructs prompt per stock:
  > "Given TSLA dropped 7.8% and the headline 'Tesla delivery misses estimates', what should I do?"
- Uses Claude (via Bedrock) for reasoning
- Sends personalized emails via SES

### D. Lambda: `unsubscribeUser.py`

> Source: `lambdas/unsubscribeUser.py`

- Triggered via GET `/unsubscribe?email=...`
- Deletes user from DynamoDB
- Returns HTML confirmation

---

## 📤 Email Format

Each daily email includes:

- Stock symbol, price, volume
- Top news headlines
- Claude-generated AI insight
- Unsubscribe link (e.g. `https://your-cloudfront/unsubscribe?email=...`)

📂 Sample email format included in `stockPulseRunner.py`.

---

## 🔐 Security & Permissions

### IAM Roles
- `storeSubscription` → `dynamodb:PutItem`
- `stockPulseRunner` → `dynamodb:Scan`, `bedrock:InvokeModel`, `ses:SendEmail`
- `unsubscribeUser` → `dynamodb:DeleteItem`

### CORS
- Configured on API Gateway `/subscribe` endpoint
- Headers:
  ```http
  Access-Control-Allow-Origin: *
  Access-Control-Allow-Methods: POST, OPTIONS
  Access-Control-Allow-Headers: Content-Type
  ```

---

## 🧪 Dev Tips

- 🧪 Test unsubscribe via:
  ```bash
  curl "https://your-api/unsubscribe?email=test@example.com"
  ```
- 🧪 Email sandbox users must be verified unless SES is out of sandbox
- 🧪 Test daily Lambda with dummy email (log output to CloudWatch)

---

## ✅ Deployment Steps (Frontend)

1. Build static site:
   ```bash
   npm run build
   ```

2. Upload `build/` folder to an S3 bucket

3. Use CloudFront to serve public-facing domain

4. Ensure URL used in unsubscribe link matches CloudFront domain

---

## 💡 Lessons Learned

- React hooks **must** follow consistent render order (no conditionals)
- SES **sandbox limits** only allow verified emails initially
- Bedrock has **rate limits** — avoid excessive parallel calls
- Ensure proper IAM permissions for each Lambda

---

## 🔭 What’s Next

- [ ] Track past email insights per user
- [ ] Let user configure delivery time
- [ ] Extend to SMS / WhatsApp using SNS
- [ ] Use Bedrock Agents when GA
- [ ] Host full-stack version on Amplify or SST

---

## 📌 GitHub Repo

📂 Browse full source here:  
➡️ https://github.com/yeluru/stockpulse-ai-agent