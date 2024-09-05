// import WebSocket from 'ws';

// const socket = new WebSocket('wss://testnet.xian.org/websocket');

// socket.on('open', () => {
//     console.log('Connected to WebSocket');
    
//     const subscriptionRequest = {
//         jsonrpc: "2.0",
//         method: "subscribe",
//         id: 0,
//         params: {
//             query: "tm.event='NewBlock'"
//         }
//     };
    
//     socket.send(JSON.stringify(subscriptionRequest));
// });

// socket.on('message', (data) => {
//     // const parsedData = JSON.parse(data);
//     // console.log('Received:', parsedData);
//     console.log(data.toString('utf8'));
// });

// socket.on('close', () => {
//     console.log('Disconnected from WebSocket');
// });

// socket.on('error', (error) => {
//     console.error('WebSocket error:', error);
// });

import { processContractStates } from './db_statesLoader.mjs';

const pollContractStates = async (pollInterval = 30000) => {
  const poll = async () => {
    console.log('Polling contract states');
    
    // Process info contract states
    await processContractStates("info", 0);

    // Process auction contract states
    // await processContractStates("auction", 0);

    // Schedule the next poll
    setTimeout(poll, pollInterval);
  };

  // Start polling
  poll();
};

const [pollIntervalArg] = process.argv.slice(2);
const pollInterval = parseInt(pollIntervalArg) || 30000; // Default to 30 seconds if not provided

pollContractStates(pollInterval);