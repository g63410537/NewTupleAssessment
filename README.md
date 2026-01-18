# Real-Time AI Chatbot

A real-time AI chatbot with streaming responses built using React and WebSockets.

## Features

- [x] Chat Interface with message display and auto-scroll
- [x] WebSocket connection for real-time communication
- [x] Streaming AI responses using OpenAI API
- [x] Connection status indicator
- [x] Typing indicator
- [x] Responsive design with Tailwind CSS
- [x] Message timestamps
- [x] Message persistence with localStorage
- [x] Clear chat functionality

## Tech Stack

- Frontend: React 19, JavaScript, Tailwind CSS
- Backend: Node.js, Express, WebSocket (ws), OpenAI API
- Real-Time: WebSocket

## Setup Instructions

1. Clone the repository
2. Install dependencies for client and server

### Client
```bash
cd client
npm install
```

### Server
```bash
cd server
npm install
```

3. Create `.env` file in server directory with your OpenAI API key
```
OPENAI_API_KEY=your_openai_api_key_here
PORT=3001
```

4. Start the server
```bash
cd server
npm start
```

5. Start the client (in a new terminal)
```bash
cd client
npm start
```

## Environment Variables

- `OPENAI_API_KEY`: Your OpenAI API key (required) (required)
- `PORT`: Server port (optional, default 3001)

## Commands

- Client: `npm start` (runs on port 3000)
- Server: `npm start` (runs on port 3001, WebSocket on 8081)

## Troubleshooting

- If you get "OPENAI_API_KEY is required", make sure to create the .env file in the server directory.
- If WebSocket connection fails, check that the server is running on port 8081.
- The client will attempt to reconnect automatically if the connection is lost.

## Demo Video

[Link to demo video](https://drive.google.com/file/d/1ieyE6Xvq12NLu-jV-UaGHtlOBpawZL2I/view?usp=sharing)

## Time Spent

Approximately 4 hours

## Challenges

- Integrating streaming responses via WebSocket

- Handling connection states and errors
