import React, { useState, useEffect, useRef } from 'react';

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wsRef = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const savedMessages = localStorage.getItem('chatMessages');
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages).map(msg => ({ ...msg, timestamp: new Date(msg.timestamp) })));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('chatMessages', JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    const connect = () => {
      const ws = new WebSocket('ws://localhost:8081');
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'response') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'ai' && !last.isComplete) {
              return [...prev.slice(0, -1), { ...last, text: last.text + data.content }];
            } else {
              return [...prev, { sender: 'ai', text: data.content, timestamp: new Date(), isComplete: false }];
            }
          });
          setIsTyping(false);
        } else if (data.type === 'end') {
          setMessages(prev => {
            const last = prev[prev.length - 1];
            if (last && last.sender === 'ai') {
              return [...prev.slice(0, -1), { ...last, isComplete: true }];
            }
            return prev;
          });
          setIsLoading(false);
        } else if (data.type === 'error') {
          setMessages(prev => [...prev, { sender: 'ai', text: `Error: ${data.message}`, timestamp: new Date(), isComplete: true }]);
          setIsLoading(false);
          setIsTyping(false);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        setTimeout(connect, 3000); // Reconnect after 3 seconds
      };

      ws.onerror = () => {
        setIsConnected(false);
      };
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  const sendMessage = () => {
    if (input.trim() && wsRef.current && isConnected) {
      const message = { sender: 'user', text: input, timestamp: new Date() };
      setMessages(prev => [...prev, message]);
      wsRef.current.send(JSON.stringify({ type: 'chat', message: input }));
      setInput('');
      setIsLoading(true);
      setIsTyping(true);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      <header className="bg-blue-500 text-white p-4 text-center">
        <h1 className="text-2xl font-bold">AI Chatbot</h1>
        <div className={`mt-2 ${isConnected ? 'text-green-300' : 'text-red-300'}`}>
          {isConnected ? 'Connected' : 'Disconnected'}
        </div>
        <button
          onClick={() => setMessages([])}
          className="mt-2 bg-red-500 text-white px-4 py-2 rounded"
        >
          Clear Chat
        </button>
      </header>
      <div className="flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => (
          <div key={index} className={`mb-4 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg ${msg.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-white text-black'}`}>
              {msg.text}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              {msg.timestamp.toLocaleTimeString()}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-white text-black">
              Typing...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      <div className="p-4 bg-white border-t">
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading || !isConnected}
            className="flex-1 p-2 border rounded-l-lg"
            placeholder="Type your message..."
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !isConnected || !input.trim()}
            className="bg-blue-500 text-white p-2 rounded-r-lg disabled:bg-gray-300"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
