import boto3
import json
import datetime
import urllib3

http = urllib3.PoolManager()

# Resources
dynamo = boto3.resource('dynamodb')
ses = boto3.client('ses')
bedrock = boto3.client('bedrock-runtime', region_name='us-east-1')

# Config
FMP_API_KEY = "<YOUR_FMP_API_KEY>"
NEWS_API_KEY = "<YOUR_NEWS_API_KEY>"
DDB_TABLE = "StockPulseSubscriptions"
MODEL_ID = "anthropic.claude-instant-v1"
FROM_EMAIL = "raviyeluru@compsciprep.com"

# APIs
FMP_URL = "https://financialmodelingprep.com/api/v3/quote-short/{}?apikey={}"
NEWS_URL = "https://newsapi.org/v2/everything?q={}&sortBy=publishedAt&pageSize=3&apiKey={}"

def lambda_handler(event, context):
    table = dynamo.Table(DDB_TABLE)
    response = table.scan()
    items = response.get("Items", [])

    for item in items:
        email = item.get("email")
        symbols = item.get("symbols", [])
        sections = []

        for symbol in symbols:
            try:
                price, volume = get_stock(symbol)
                headlines = get_news(symbol)
                summary = get_bedrock_summary(symbol, price, volume, headlines)
                html = format_section(symbol, price, volume, headlines, summary)
                sections.append(html)
            except Exception as e:
                print(f"[WARN] Skipping {symbol} due to error: {e}")

        if sections:
            try:
                send_email(email, "\n".join(sections))
                print(f"[INFO] Sent email to {email}")
            except Exception as email_error:
                print(f"[ERROR] Failed to send email to {email}: {email_error}")

    return {"statusCode": 200, "message": "Emails attempted for all users"}

def get_stock(symbol):
    res = http.request("GET", FMP_URL.format(symbol, FMP_API_KEY))
    data = json.loads(res.data.decode("utf-8"))
    print(f"[DEBUG] Stock data for {symbol}: {data}")
    if not data:
        raise Exception(f"No stock data found for {symbol}")
    return data[0]["price"], data[0]["volume"]

def get_news(symbol):
    res = http.request("GET", NEWS_URL.format(symbol, NEWS_API_KEY))
    data = json.loads(res.data.decode("utf-8"))
    headlines = [a["title"] for a in data.get("articles", []) if "title" in a]
    print(f"[DEBUG] News for {symbol}: {headlines}")
    return headlines

def get_bedrock_summary(symbol, price, volume, headlines):
    prompt = f"""
You are a financial reasoning agent.

Analyze the following stock and news:

SYMBOL: {symbol}
PRICE: ${price}
VOLUME: {volume}

NEWS:
{chr(10).join(f"- {h}" for h in headlines)}

Give a short summary and then a BUY / SELL / HOLD recommendation.
"""
    body = json.dumps({
        "prompt": f"\n\nHuman: {prompt}\n\nAssistant:",
        "max_tokens_to_sample": 300
    }).encode("utf-8")

    res = bedrock.invoke_model(
        modelId=MODEL_ID,
        accept="application/json",
        contentType="application/json",
        body=body
    )

    completion = json.loads(res['body'].read().decode())["completion"]
    return completion.strip()

def format_section(symbol, price, volume, headlines, summary):
    head = "<br>".join(headlines) or "No news found."
    return f"""
    <div style="border:1px solid #eee; padding:15px; margin-bottom:20px; border-radius:8px;">
      <h3>{symbol}</h3>
      <p><b>Price:</b> ${price} | <b>Volume:</b> {volume}</p>
      <p><b>Top News:</b><br>{head}</p>
      <p><b>AI Insight:</b> {summary}</p>
    </div>
    """

def send_email(to, body_html):
    unsubscribe_link = f"https://<YOUR_CLOUDFRONT_ID>.cloudfront.net/unsubscribe?email={to}"

    ses.send_email(
        Source=FROM_EMAIL,
        Destination={"ToAddresses": [to]},
        Message={
            "Subject": {"Data": "📊 Your StockPulse Daily Insights"},
            "Body": {
                "Html": {"Data": f"""
                <html>
                  <body style='font-family: Arial, sans-serif;'>
                    <h2>📈 StockPulse Agent Report</h2>
                    {body_html}
                    <p style='font-size:12px; color:#888;'>You received this because you subscribed to StockPulse.<br/>
                    <a href="{unsubscribe_link}" style="color:#d00;">Unsubscribe here.</a></p>
                  </body>
                </html>
                """}
            }
        }
    )


