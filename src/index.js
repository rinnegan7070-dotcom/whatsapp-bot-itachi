// src/index.js

const express = require('express');
const app = express();

// Middleware for parsing JSON requests
app.use(express.json());

// Command routing setup
app.post('/command', async (req, res) => {
    try {
        const command = req.body.command;

        if (!command) {
            return res.status(400).json({ error: 'Command is required.' });
        }

        switch (command) {
            case 'start':
                // Handle start command
                res.json({ message: 'Starting...' });
                break;
            case 'stop':
                // Handle stop command
                res.json({ message: 'Stopping...' });
                break;
            default:
                res.status(404).json({ error: 'Command not found.' });
        }
    } catch (error) {
        console.error('Error handling command:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

// Starting the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
