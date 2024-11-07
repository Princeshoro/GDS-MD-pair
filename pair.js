const express = require('express');
const fs = require('fs');
let router = express.Router();
const pino = require("pino");
const { default: makeWASocket, useMultiFileAuthState, delay, makeCacheableSignalKeyStore, Browsers } = require("@whiskeysockets/baileys");

function removeFile(FilePath) {
    if (!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;
    
    async function XeonPair() {
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
                    const sessionXeon = fs.readFileSync('./session/creds.json');
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
                    
                    await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `Hello there!👋🏻 [...]` }, { quoted: xeonses });
                    await delay(100);
                    removeFile('./session');
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    XeonPair();
                }
            });
        } catch (err) {
            console.error("Service restated due to error:", err);
            removeFile('./session');
            if (!res.headersSent) {
                res.send({ code: "Service Unavailable" });
            }
        }
    }
    XeonPair();
});

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (!e.includes("conflict") && !e.includes("Socket connection timeout") &&
        !e.includes("not-authorized") && !e.includes("rate-overlimit") &&
        !e.includes("Connection Closed") && !e.includes("Timed Out") &&
        !e.includes("Value not found")) {
        console.log('Caught exception: ', err);
    }
});

module.exports = router;
