const express = require('express');
const http = require('http');
const https = require('https');
const nodemailer = require('nodemailer');
require('dotenv').config();
const app = express();

// Define the URLs of your websites to monitor
const websiteUrls = [
    process.env.PROD,
    process.env.foxusai
];

// Email transporter configuration
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Function to send email notifications
const sendEmailNotification = (websiteUrl, statusCode, errorMessage = null) => {
    const subject = `Website ${websiteUrl} is DOWN!`;
    const message = errorMessage
        ? `An error occurred while pinging ${websiteUrl}: ${errorMessage}`
        : `Website ${websiteUrl} is DOWN. Status code: ${statusCode}`;

    const mailOptions = {
        from: `"PingIt" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: subject,
        text: message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending email: ${error.message}`);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
};

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
        const randomInterval = Math.floor(Math.random() * (2 * 60000 - 1 * 60000 + 1)) + 1 * 60000;

        if (res.statusCode === 200) {
            const time = new Date();
            console.log(`${time.toLocaleString()}: Website ${websiteUrl} is UP, next check after ${randomInterval / 60000}m.`);
        } else {
            console.log(`[${getCurrentTime()}] Website ${websiteUrl} is DOWN. Status code: ${res.statusCode}, next check after ${randomInterval / 60000}m.`);
            sendEmailNotification(websiteUrl, res.statusCode);
        }
        console.log("\n--------------------------------\n");
        
        setTimeout(() => pingWebsite(websiteUrl), randomInterval);
    });

    req.on('error', (error) => {
        console.error(`Error pinging website ${websiteUrl}: ${error.message}`);
        sendEmailNotification(websiteUrl, null, error.message);
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
