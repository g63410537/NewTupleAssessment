const express = require('express');
const WebSocket = require('ws');
const { CohereClientV2 } = require('cohere-ai');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 3001;

// Middleware
app.use(express.json());
app.use(require('cors')());

// Cohere setup
if (!process.env.COHERE_API_KEY) {
  console.error('COHERE_API_KEY is required');
  process.exit(1);
}
const cohere = new CohereClientV2({
  token: process.env.COHERE_API_KEY,
});

// WebSocket server
const wss = new WebSocket.Server({ port: 8081 });

wss.on('connection', (ws) => {
  console.log('Client connected');

  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    if (data.type === 'chat') {
      console.log('Received message:', data.message);
      try {
        const stream = await cohere.chatStream({
          model: 'command-r-plus-08-2024',
          messages: [{ role: 'user', content: data.message }],
        });

        for await (const event of stream) {
          if (event.type === 'content-delta' && event.delta?.message?.content?.text) {
            const content = event.delta.message.content.text;
            console.log('Sending chunk:', content);
            ws.send(JSON.stringify({ type: 'response', content: content }));
          }
        }
        ws.send(JSON.stringify({ type: 'end' }));
        console.log('Stream ended');
      } catch (error) {
        console.error('Error:', error);
        ws.send(JSON.stringify({ type: 'error', message: error.message }));
      }
    }
  });

  ws.on('close', () => {
    console.log('Client disconnected');
  });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
  console.log('WebSocket server on port 8081');
});