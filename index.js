import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
import code from './pair.js';

// Get the current directory path
const __filename = fileURLToPath(import.meta.url);
const __path = path.dirname(__filename);

// Set the maximum number of listeners for the EventEmitter
import { EventEmitter } from 'events';
EventEmitter.defaultMaxListeners = 500;

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware for serving the code route
app.use('/code', code);

// Route for serving pair.html
app.use('/', async (req, res, next) => {
  res.sendFile(path.join(__path, 'pair.html'));
});

// Middleware for handling JSON and URL-encoded data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Start the server
app.listen(PORT, () => {
  console.log(`PRINCE GDS PAIR\n\nServer running on http://localhost:${PORT}`);
});

export default app;
