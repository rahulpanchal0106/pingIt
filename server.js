const express = require('express');
const http = require('http');
const https = require('https');

const app = express();

// Define the URL of your website to monitor
const websiteUrl = 'https://chatbison.onrender.com/';

// Function to ping the website with a random interval
const pingWebsite = () => {
    const protocol = websiteUrl.startsWith('https') ? https : http;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    const req = protocol.request(websiteUrl, options, (res) => {
        var randomInterval;
        

        // Generate a random time interval between 1 to 5 minutes (60000 milliseconds = 1 minute)
        randomInterval = Math.floor(Math.random() * (2 * 60000 - 1 * 60000 + 1)) + 1 * 60000;
        setTimeout(pingWebsite, randomInterval);

        if (res.statusCode === 200) {
            const time=new Date();
            console.log(`${time.toLocaleString()}: Website ${websiteUrl} is UP, next check after ${randomInterval/60000}m.`);
        } else {
            console.log(`Website ${websiteUrl} is DOWN. Status code: ${res.statusCode}`);
        }
    });

    req.on('error', (error) => {
        console.error(`Error pinging website ${websiteUrl}: ${error.message}`);

        // If an error occurs, retry after a fixed interval (e.g., 1 minute)
        setTimeout(pingWebsite, 1 * 60000);
    });

    req.end();
};

// Endpoint to check the status of the monitor
app.get('/', (req, res) => {
    res.send('Website monitor is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Initial ping on startup
pingWebsite();
