import React, { useState, useEffect } from 'react';
import SearchBar from './SearchBar';
import './App.css';

function App() {
  const [resetTrigger, setResetTrigger] = useState(0);
  const [selectedSymbols, setSelectedSymbols] = useState([]);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  // Handle unsubscribe route
  const [unsubscribeStatus, setUnsubscribeStatus] = useState(null);

  useEffect(() => {
    if (window.location.pathname.includes('/unsubscribe')) {
      const params = new URLSearchParams(window.location.search);
      const emailParam = params.get('email');

      console.log("➡️ Detected /unsubscribe route");
      console.log("📧 Extracted email param:", emailParam);

      if (emailParam) {
        fetch(`https://<YOUR_API_ID>.execute-api.us-east-1.amazonaws.com/unsubscribe?email=${encodeURIComponent(emailParam)}`)
          .then(res => {
            console.log("📡 Fetch sent. Response status:", res.status);
            if (!res.ok) throw new Error('Failed to unsubscribe');
            return res.text();
          })
          .then(data => {
            console.log("✅ Unsubscribe success:", data);
            setUnsubscribeStatus('success');
          })
          .catch(err => {
            console.error("❌ Unsubscribe failed:", err);
            setUnsubscribeStatus('error');
          });
      } else {
        console.warn("⚠️ No email parameter found in URL");
        setUnsubscribeStatus('invalid');
      }
    }
  }, []);

  if (window.location.pathname.includes('/unsubscribe')) {
    return (
      <div className="unsubscribe-message">
        {unsubscribeStatus === null && <p>Processing your unsubscribe request...</p>}
        {unsubscribeStatus === 'success' && (
          <>
            <h2>You've been unsubscribed</h2>
            <p>You will no longer receive daily insights from StockPulse.</p>
          </>
        )}
        {unsubscribeStatus === 'error' && (
          <>
            <h2>Error</h2>
            <p>Something went wrong while unsubscribing. Please try again later.</p>
          </>
        )}
        {unsubscribeStatus === 'invalid' && (
          <>
            <h2>Invalid Request</h2>
            <p>Email parameter is missing.</p>
          </>
        )}
      </div>
    );
  }

  const handleSubmit = async () => {
    setMessage('');
    const payload = { email, symbols: selectedSymbols };

    try {
      const res = await fetch('https://<YOUR_API_ID>.execute-api.us-east-1.amazonaws.com/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Thank you for your subscription! You'll receive AI-powered stock insights daily at 8AM. Stay tuned!");
        setSelectedSymbols([]);
        setEmail('');
        setResetTrigger(prev => prev + 1);
      } else {
        setMessage(`❌ Error: ${data.error || 'Something went wrong.'}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error.message}`);
    }
  };

  return (
    <div className="App">
      <h1>📈 Watchlist AI Agent</h1>
      <p className="instructions">
        Use this simple tool to search for any company name or stock ticker (like "Tesla" or "TSLA").<br />
        Select up to 5 stocks or ETFs you're interested in tracking.
        Each morning, our AI agent analyzes live market data and news headlines for your selected stocks.
        Stay informed effortlessly, with no jargon, no dashboards, and no manual research.
        <br /><br />
        Don't worry, there will be an <span style={{ color: 'red' }}>unsubscribe</span> link in the email.
      </p>

      <div className="main-layout">
        <div className="left-panel">
          <SearchBar
            selectedSymbols={selectedSymbols}
            setSelectedSymbols={setSelectedSymbols}
            resetTrigger={resetTrigger}
          />
        </div>

        <div className="right-panel">
          <div className="subscribe-section">
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button onClick={handleSubmit}>Subscribe</button>
            {message && <div className="confirmation-message">{message}</div>}
          </div>

          <div className="selected-list">
            <h4>Selected Stocks ({selectedSymbols.length}/5)</h4>
            <ul>
              {selectedSymbols.map((symbol, idx) => (
                <li key={idx}>{symbol}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
