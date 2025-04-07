import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SearchBar.css';

const API_KEY = '<FMP_API_KEY>';
const MAX_SELECTION = 5;

function SearchBar({ selectedSymbols, setSelectedSymbols, resetTrigger }) {
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

        const timer = setTimeout(fetchResults, 300); // debounce
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

    useEffect(() => {
        setQuery('');
        setResults([]);
    }, [resetTrigger]);

    return (
        <div className="search-bar">
            <input
                type="text"
                placeholder="Search company name or stock symbol, choose only US stocks for now"
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
