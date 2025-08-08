"use client";
import Image from "next/image";
import styles from "./page.module.css";
import React, { useState, useRef } from "react";
import Link from "next/link";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

type Provider = 'openai' | 'openrouter';

function AnimeLoading() {
  // Anime-style animated terminal cursor
  return (
    <span style={{
      display: 'inline-block',
      color: '#00ffe7',
      fontWeight: 'bold',
      fontSize: '1.5em',
      marginLeft: 8,
      textShadow: '0 0 8px #00ffe7, 0 0 2px #fff',
      animation: 'blink 1s steps(2, start) infinite',
    }}>
      |
      <style>{`
        @keyframes blink {
          to { opacity: 0; }
        }
      `}</style>
    </span>
  );
}

export default function Home() {
  const [provider, setProvider] = useState<Provider>('openai');
  const [userMessage, setUserMessage] = useState("");
  const [developerMessage, setDeveloperMessage] = useState("You are an anime terminal assistant.");
  const [apiKey, setApiKey] = useState("");
  const [openrouterApiKey, setOpenrouterApiKey] = useState("");
  const [model, setModel] = useState("gpt-4.1-mini");
  const [openrouterModel, setOpenrouterModel] = useState("openai/gpt-3.5-turbo");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const responseRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setResponse("");
    setError("");
    setLoading(true);
    try {
      const body: Record<string, string> = {
        developer_message: developerMessage,
        user_message: userMessage,
        provider,
      };
      if (provider === 'openai') {
        body.api_key = apiKey;
        body.model = model;
      } else {
        body.openrouter_api_key = openrouterApiKey;
        body.openrouter_model = openrouterModel;
      }
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      let result = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        result += new TextDecoder().decode(value);
        setResponse(result);
        if (responseRef.current) {
          responseRef.current.scrollTop = responseRef.current.scrollHeight;
        }
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Unknown error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          marginBottom: 24,
          borderBottom: '2px solid #00ffe7',
          paddingBottom: 12,
          boxShadow: '0 2px 16px #00ffe7a0',
          fontSize: '1.5rem',
          fontWeight: 'bold',
          letterSpacing: '0.1em',
          textShadow: '0 0 8px #00ffe7, 0 0 2px #fff',
        }}>
          <span style={{ color: '#ff00cc', marginRight: 12 }}>&gt;_</span>
          <span>AI Engineer Challenge Terminal</span>
        </div>
        <ol>
          <li>Welcome to the <code>AI Engineer Challenge</code> terminal.</li>
          <li>Interact with the FastAPI backend in real time below.</li>
        </ol>
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: 32, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 16 }}>
          <label htmlFor="provider" style={{ color: '#00ffe7', fontWeight: 'bold', marginBottom: 4 }}>Provider</label>
          <select
            id="provider"
            value={provider}
            onChange={e => setProvider(e.target.value as Provider)}
            style={{
              width: '100%',
              background: '#0f2027',
              color: '#00ffe7',
              border: '2px solid #00ffe7',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: '1.1rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: '0 0 12px #00ffe7a0',
              marginBottom: 8,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          >
            <option value="openai">OpenAI</option>
            <option value="openrouter">OpenRouter</option>
          </select>
          {provider === 'openai' && (
            <>
              <label htmlFor="api-key" style={{ color: '#ff00cc', fontWeight: 'bold', marginBottom: 4 }}>OpenAI API Key</label>
              <input
                id="api-key"
                type="password"
                required
                value={apiKey}
                onChange={e => setApiKey(e.target.value)}
                placeholder="Enter your OpenAI API key"
                style={{
                  width: '100%',
                  background: '#0f2027',
                  color: '#00ffe7',
                  border: '2px solid #ff00cc',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 0 12px #ff00cc80',
                  marginBottom: 8,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
              />
              <label htmlFor="model" style={{ color: '#00ffe7', fontWeight: 'bold', marginBottom: 4 }}>OpenAI Model</label>
              <input
                id="model"
                type="text"
                value={model}
                onChange={e => setModel(e.target.value)}
                placeholder="gpt-4.1-mini"
                style={{
                  width: '100%',
                  background: '#0f2027',
                  color: '#00ffe7',
                  border: '2px solid #00ffe7',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 0 12px #00ffe7a0',
                  marginBottom: 8,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
              />
            </>
          )}
          {provider === 'openrouter' && (
            <>
              <label htmlFor="openrouter-api-key" style={{ color: '#ff00cc', fontWeight: 'bold', marginBottom: 4 }}>OpenRouter API Key</label>
              <input
                id="openrouter-api-key"
                type="password"
                required
                value={openrouterApiKey}
                onChange={e => setOpenrouterApiKey(e.target.value)}
                placeholder="Enter your OpenRouter API key"
                style={{
                  width: '100%',
                  background: '#0f2027',
                  color: '#00ffe7',
                  border: '2px solid #ff00cc',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 0 12px #ff00cc80',
                  marginBottom: 8,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
              />
              <label htmlFor="openrouter-model" style={{ color: '#00ffe7', fontWeight: 'bold', marginBottom: 4 }}>OpenRouter Model</label>
              <input
                id="openrouter-model"
                type="text"
                value={openrouterModel}
                onChange={e => setOpenrouterModel(e.target.value)}
                placeholder="openai/gpt-3.5-turbo"
                style={{
                  width: '100%',
                  background: '#0f2027',
                  color: '#00ffe7',
                  border: '2px solid #00ffe7',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontSize: '1.1rem',
                  fontFamily: 'inherit',
                  outline: 'none',
                  boxShadow: '0 0 12px #00ffe7a0',
                  marginBottom: 8,
                  transition: 'border 0.2s, box-shadow 0.2s',
                }}
              />
            </>
          )}
          <label htmlFor="user-message" style={{ color: '#00ffe7', fontWeight: 'bold', marginBottom: 4 }}>User Message</label>
          <input
            id="user-message"
            type="text"
            required
            value={userMessage}
            onChange={e => setUserMessage(e.target.value)}
            placeholder="Type a command..."
            style={{
              width: '100%',
              background: '#0f2027',
              color: '#00ffe7',
              border: '2px solid #00ffe7',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: '1.1rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: '0 0 12px #00ffe7a0',
              marginBottom: 8,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          />
          <label htmlFor="developer-message" style={{ color: '#00ffe7', fontWeight: 'bold', marginBottom: 4 }}>System Prompt</label>
          <input
            id="developer-message"
            type="text"
            value={developerMessage}
            onChange={e => setDeveloperMessage(e.target.value)}
            placeholder="System prompt (optional)"
            style={{
              width: '100%',
              background: '#0f2027',
              color: '#00ffe7',
              border: '2px solid #00ffe7',
              borderRadius: 8,
              padding: '12px 16px',
              fontSize: '1.1rem',
              fontFamily: 'inherit',
              outline: 'none',
              boxShadow: '0 0 12px #00ffe7a0',
              marginBottom: 8,
              transition: 'border 0.2s, box-shadow 0.2s',
            }}
          />
          <button
            type="submit"
            disabled={loading}
            style={{
              background: loading ? '#222' : '#ff00cc',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              padding: '12px 28px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              boxShadow: '0 0 16px #ff00cc80',
              cursor: loading ? 'not-allowed' : 'pointer',
              marginTop: 8,
              transition: 'background 0.2s',
            }}
          >
            {loading ? <><span>Loading</span><AnimeLoading /></> : 'Send'}
          </button>
        </form>
        <div
          ref={responseRef}
          style={{
            width: '100%',
            minHeight: 80,
            maxHeight: 240,
            background: '#0f2027',
            color: '#00ffe7',
            border: '2px solid #00ffe7',
            borderRadius: 8,
            marginTop: 24,
            padding: 16,
            fontFamily: 'Fira Mono, Consolas, Menlo, monospace',
            fontSize: '1.1rem',
            overflowY: 'auto',
            boxShadow: '0 0 12px #00ffe7a0',
            whiteSpace: 'pre-wrap',
          }}
        >
          {error ? <span style={{ color: '#ff0033' }}>{error}</span> : response}
        </div>
        <div style={{marginTop: 32, color: '#888', fontSize: '0.95em', width: '100%', textAlign: 'center'}}>
          <span>Powered by FastAPI backend • Built for the AI Engineer Challenge</span>
        </div>
      </main>
      <footer className={styles.footer}>
        <a
          href="https://github.com/"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/file.svg"
            alt="File icon"
            width={16}
            height={16}
          />
          Source Code
        </a>
        <Link href="/">
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <Image
              aria-hidden
              src="/window.svg"
              alt="Window icon"
              width={16}
              height={16}
            />
            Home
          </div>
        </Link>
        <a
          href="/api/health"
          rel="noopener noreferrer"
        >
          <Image
            aria-hidden
            src="/globe.svg"
            alt="Globe icon"
            width={16}
            height={16}
          />
          API Health
        </a>
      </footer>
    </div>
  );
}
