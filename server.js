const express = require('express');
const http = require('http');
const https = require('https');
const nodemailer = require('nodemailer');
const path = require('path');
const html = require('./script');
require('dotenv').config();
const app = express();

// Define the URLs of your websites to monitor
const websiteUrls = [
    {
        url:process.env.PROD,
        about:[]
    },
    {
        url:process.env.foxusai,
        about:[]
    }
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
    const subject = `Server Went Down`;
    const message = errorMessage
        ? `An error occurred while pinging ${websiteUrl}: ${errorMessage}`
        : `Web Service ${websiteUrl} is DOWN. 
        Status code: ${statusCode}`;

    const mailOptions = {
        from: `"PingIt" <${process.env.EMAIL_USER}>`,
        to: process.env.EMAIL_TO,
        subject: subject,
        // text: message,
        html: 
        `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="font-family: Arial, sans-serif; margin: 0; padding: 0; background-color: #f4f4f4;">
            <div style="width: 90%; max-width: 600px; margin: auto; background: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">
                <h1 style="color: #333;">Your server is in trouble</h1>
                <p style="color: #666;">An error occurred while pinging, <strong>${websiteUrl}</strong></p>
                <p style="color: #666;">Web Service <strong>${websiteUrl}</strong> is <strong>Not Responding</strong> 🔴.</p><p> Status code: <strong>${statusCode}</strong></p>
                <div style="margin-top: 20px; font-size: 0.8em; color: #999; text-align: right;">
                    <p>Go fix it! ASAP!</p>
                    <p>Good Luck,</p>
                    <p><a href="https://pingit-foxus-ai.onrender.com" style="color: #007bff; text-decoration: none;">PingIt</a></p>
                </div>
            </div>
        </body>
        </html>`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.error(`Error sending email: ${error.message}`);
        } else {
            console.log(`Email sent: ${info.response}`);
        }
    });
};

const data_arr = []

// Function to ping a website with a random interval
const pingWebsite = (websiteUrl,index) => {
    const protocol = websiteUrl.startsWith('https') ? https : http;
    const options = {
        method: 'GET',
        headers: {
            'User-Agent': 'Mozilla/5.0'
        }
    };

    const req = protocol.request(websiteUrl, options, (res) => {
        const randomInterval = Math.floor(Math.random() * (2 * 60000 - 1 * 60000 + 1)) + 1 * 60000;
        // const randomInterval = Math.floor(Math.random() * (2 * 1000 - 1 * 1000 + 1)) + 1 * 1000;
        var isUp=false;
        if (res.statusCode === 200) {
            const time = new Date();
            isUp=true;
            console.log(`${time.toLocaleString()}: Website ${websiteUrl} is UP, next check after ${randomInterval / 60000}m.`);
        } else {
            isUp=false;
            console.log(`[${getCurrentTime()}] Website ${websiteUrl} is DOWN. Status code: ${res.statusCode}, next check after ${randomInterval / 60000}m.`);
            sendEmailNotification(websiteUrl, res.statusCode);
        }
        console.log("\n--------------------------------\n");
        websiteUrls[index].about.push(
            {
                time: new Date().toLocaleString(),
                upnext:randomInterval/60000,
                status:isUp
            }
        )
        
        setTimeout(() => pingWebsite(websiteUrl,index), randomInterval);
        return 
    });

    req.on('error', (error) => {
        console.error(`Error pinging ${websiteUrl}: ${error.message}`);
        sendEmailNotification(websiteUrl, null, error.message);
        setTimeout(() => pingWebsite(websiteUrl,index), 1 * 60000);
    });

    req.end();
};

const pingAllWebsites = () => {
    
    websiteUrls.forEach((url,index) => {
        data=pingWebsite(url.url,index); 
        
    });
};

const getCurrentTime = () => {
    const currentTime = new Date();
    return currentTime.toLocaleString();
};

app.get('/', (req, res) => {
    // res.sendFile(path.join(__dirname,'index.html'));
    res.send(`
        <style>
            html{
                margin:0px;
                padding:0px;
            }
            *{
                font-family:system-ui;
            }
            body{
                margin:0px;
                padding:0px;
            }
            #card{
                width: 50%;
                height: 20vh;
                padding:30px 20px;
                border-radius: 50px;
                background: #e0e0e0;
                box-shadow: 20px 20px 60px #bebebe,-20px -20px 60px #ffffff;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
            }
            #card-in{
                width: 50%;
                
                padding:30px 20px;
                border-radius: 10px;
                background: #e0e0e0;
                box-shadow: 20px 20px 60px #bebebe,-20px -20px 60px #ffffff;
                display:flex;
                flex-direction:column;
                justify-content:center;
                align-items:center;
            }
                /* HTML: <div class="loader"></div> */
            .loader-fine {
            width: 20px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: #5ed75e;
            box-shadow: 0 0 0 0 #5ed75e;
            animation: l2 1.5s infinite linear;
            position: relative;
            top: -33%;
            left: 50%;
            }
            .loader-err {
            width: 20px;
            aspect-ratio: 1;
            border-radius: 50%;
            background: tomato;
            box-shadow: 0 0 0 0 tomato;
            animation: l2 1.5s infinite linear;
            position: relative;
            top: -30%;
            left: 50%;
            }
            .loader-fine:before,
            .loader-fine:after {
            content: "";
            position: absolute;
            inset: 0;
            border-radius: inherit;
            box-shadow: 0 0 0 0 #5ed75e;
            animation: inherit;
            animation-delay: -0.5s;
            }
            .loader-fine:after {
            animation-delay: -1s;
            }
            @keyframes l2 {
                100% {box-shadow: 0 0 0 40px #0000}
            }

            #info{
                background-color: #c8c8c8;
                padding: 10px 15px;
                border-radius: 7px;
                margin-bottom:10px;
                width:70%;
            }
            #info-p{
                color: #6c6b6b;
                font-size: 0.6rem;
                margin: 0px;
            }   
        </style>
        <body>
            <div id="container" style=" padding:0px;margin:0px;width:100vw; height:100vh; display:flex;justify-content:space-evenly; align-items:center; flex-direction:column; background-color:#f6f6f6">
                <p>PingIt service is live! </p>
                ${
                    websiteUrls.map((server)=>{
                        
                        return `
                            <div id="card">
                                <h3 style="margin:0px">
                                    ${server.url}  
                                </h3>
                                ${
                          server && server.about && server.about.length > 0
                            ? server.about[server.about.length - 1].status
                              ? `
                                <div class="loader-fine"></div>
                                
                                <div id="info">
                                    <p id="info-p" >Last checked at</p>
                                    ${
                                        server.about[server.about.length - 1].time
                                    }
                                </div>
                                <div id="info">
                                    <p id="info-p">Next check after</p>
                                    ${
                                        server.about[server.about.length - 1].upnext
                                    } m
                                </div>
                                
                              `
                              : `
                                <div class="loader-err"></div>
                                <div id="info">
                                    <p id="info-p" >Last ping at</p>
                                    ${
                                        server.about[server.about.length - 1].time
                                    }
                                </div>
                                <div id="info">
                                    <p id="info-p">Next ping after</p>
                                    ${
                                        server.about[server.about.length - 1].upnext
                                    } m
                                </div>
                              `
                            : "No data available"
                        } 

                            </div>    
                        `;
                    })
                }
            </div>
        </body>
        `)
    // res.send(html())
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

pingAllWebsites();

