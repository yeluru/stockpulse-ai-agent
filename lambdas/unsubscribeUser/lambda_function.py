import json
import boto3
import urllib.parse

dynamo = boto3.resource('dynamodb')
table = dynamo.Table('StockPulseSubscriptions')

def lambda_handler(event, context):
    method = event.get('requestContext', {}).get('http', {}).get('method', '')

    # Handle preflight
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': ''
        }

    params = event.get('queryStringParameters') or {}
    email = urllib.parse.unquote_plus(params.get('email', ''))

    if not email:
        return {
            'statusCode': 400,
            'headers': cors_headers(),
            'body': html_response("Missing email parameter.")
        }

    try:
        table.delete_item(Key={'email': email})
        return {
            'statusCode': 200,
            'headers': cors_headers(),
            'body': html_response("✅ You have been successfully unsubscribed from StockPulse alerts.")
        }
    except Exception as e:
        return {
            'statusCode': 500,
            'headers': cors_headers(),
            'body': html_response(f"⚠️ An error occurred: {str(e)}")
        }

def cors_headers():
    return {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type'
    }

def html_response(message):
    return f"""
    <html>
      <head>
        <title>Unsubscribe | StockPulse</title>
        <style>
          body {{
            font-family: Arial, sans-serif;
            background: #f1f5f9;
            padding: 2rem;
            text-align: center;
          }}
          .box {{
            background: white;
            display: inline-block;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 4px 16px rgba(0,0,0,0.05);
          }}
          h1 {{
            color: #1e3a8a;
          }}
        </style>
      </head>
      <body>
        <div class="box">
          <h1>{message}</h1>
        </div>
      </body>
    </html>
    """

