const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");

function ensureSessionDirectory() {
    const sessionDir = './session';
    if (!fs.existsSync(sessionDir)) {
        fs.mkdirSync(sessionDir, { recursive: true });
    }
}

async function XeonPair(res, num) {
    ensureSessionDirectory();
    
    // Using multi-file auth state to manage creds.json
    const { state, saveCreds } = await useMultiFileAuthState(`./session`);
    
    try {
        let XeonBotInc = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, pino({ level: "fatal" }).child({ level: "fatal" })),
            },
            printQRInTerminal: false,
            logger: pino({ level: "fatal" }).child({ level: "fatal" }),
            browser: Browsers.ubuntu("Chrome"),
        });

        if (!XeonBotInc.authState.creds.registered) {
            await delay(1500);
            num = num.replace(/[^0-9]/g, '');
            const code = await XeonBotInc.requestPairingCode(num);
            if (!res.headersSent) {
                res.send({ code });
            }
        }

        XeonBotInc.ev.on('creds.update', saveCreds);
        
        XeonBotInc.ev.on("connection.update", async (s) => {
            const { connection, lastDisconnect } = s;
            if (connection === "open") {
                await delay(10000);

                // Check and read credentials only if they exist
                const credsPath = './session/creds.json';
                if (fs.existsSync(credsPath)) {
                    const sessionXeon = fs.readFileSync(credsPath);
                    let c = Buffer.from(sessionXeon).toString('base64');
                    const audioxeon = fs.readFileSync('./prince.mp3');
                    
                    XeonBotInc.groupAcceptInvite("Jo5bmHMAlZpEIp75mKbwxP");
                    const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: c });
                    XeonBotInc.sendMessage(XeonBotInc.user.id, {
                        audio: audioxeon,
                        mimetype: 'audio/mp4',
                        ptt: true
                    }, {
                        quoted: xeonses
                    });
                    
                    await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `Assalamualaikum!👋🏻 

Do not share your session id with anyone.

Put the above long code in SESSION_ID var

Thanks for using PRINCE-BOT

Join support channel:- https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11

Dont forget to give star 🌟 to Prince bot repo
https://github.com/PRINCE-GDS/prince-ds` }, { quoted: xeonses });
                    
                    await delay(100);
                    removeFile('./session');
                } else {
                    console.log('Credentials file missing, cannot proceed.');
                }
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                await delay(10000);
                XeonPair(res, num);  // Retry pairing on connection close
            }
        });
    } catch (err) {
        console.error("Service restarted due to error:", err);
        removeFile('./session');
        if (!res.headersSent) {
            res.send({ code: "Service Unavailable" });
        }
    }
}

router.get('/', async (req, res) => {
    const num = req.query.number;
    XeonPair(res, num);
});

process.on('uncaughtException', function (err) {
    console.error("Caught exception:", err);
    // Handle the exception gracefully
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('Unhandled Rejection at:', promise, 'reason:', reason);
    // Handle unhandled promise rejection gracefully
});

module.exports = router;
