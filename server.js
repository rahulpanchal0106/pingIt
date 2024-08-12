const express = require('express');
const http = require('http');
const https = require('https');
require('dotenv').config();
const app = express();

// Define the URLs of your websites to monitor
const websiteUrls = [
    process.env.PROD,
    'https://foxus-ai-backend.onrender.com',
    'https://socio-server-01re.onrender.com'
    
];

// Function to ping a website with a random interval
const pingWebsite = (websiteUrl) => {
    const protocol = websiteUrl.startsWith('https') ? https : http;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    const req = protocol.request(websiteUrl, options, (res) => {
        var randomInterval;

        // Generate a random time interval between 1 to 3 minutes (60000 milliseconds = 1 minute)
        randomInterval = Math.floor(Math.random() * (2 * 60000 - 1 * 60000 + 1)) + 1 * 60000;
        setTimeout(() => pingWebsite(websiteUrl), randomInterval);

        if (res.statusCode === 200) {
            const time = new Date();
            console.log(`${time.toLocaleString()}: Website ${websiteUrl} is UP, next check after ${randomInterval/60000}m.`);
        } else {
            console.log(`[${getCurrentTime()}] Website ${websiteUrl} is DOWN. Status code: ${res.statusCode}, next check after ${randomInterval/60000}m.`);
        }
        console.log("\n--------------------------------\n")
    });

    req.on('error', (error) => {
        console.error(`Error pinging website ${websiteUrl}: ${error.message}`);
        setTimeout(() => pingWebsite(websiteUrl), 1 * 60000);
    });

    req.end();
};

const pingAllWebsites = () => {
    websiteUrls.forEach((url) => {
        pingWebsite(url);
    });
};

const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleString();
};

app.get('/', (req, res) => {
    res.send('Website monitor is running!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

pingAllWebsites();
