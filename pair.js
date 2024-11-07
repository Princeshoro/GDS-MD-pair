const express = require('express');
const fs = require('fs');
const path = require('path');
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    Browsers,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

let router = express.Router();

function removeFile(filePath) {
    if (!fs.existsSync(filePath)) return false;
    fs.rmSync(filePath, { recursive: true, force: true });
}

router.get('/', async (req, res) => {
    let num = req.query.number;

    async function XeonPair() {
        const sessionPath = './session';

        if (!fs.existsSync(sessionPath)) {
            fs.mkdirSync(sessionPath, { recursive: true });
        }

        const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

        try {
            let XeonBotInc = makeWASocket({
                version: [2, 3000, 1015901307],
                printQRInTerminal: false,
                logger: pino({ level: 'silent' }),
                browser: Browsers.ubuntu("Chrome"),
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino().child({ level: 'fatal', stream: 'store' }))
                },
            });

            if (!XeonBotInc.authState.creds.registered) {
                await delay(1500);
                num = num.replace(/[^0-9]/g, '');
                const code = await XeonBotInc.requestPairingCode(num).catch(err => {
                    console.error("Error requesting pairing code:", err);
                    if (!res.headersSent) res.status(500).send({ code: "Error requesting pairing code" });
                });
                if (code && !res.headersSent) {
                    await res.send({ code });
                }
            }

            XeonBotInc.ev.on('creds.update', saveCreds);
            XeonBotInc.ev.on("connection.update", async (s) => {
                const { connection, lastDisconnect } = s;
                if (connection === "open") {
                    await delay(10000);
                    try {
                        const sessionFile = path.join(sessionPath, 'creds.json');
                        if (fs.existsSync(sessionFile)) {
                            const sessionXeon = fs.readFileSync(sessionFile);
                            let c = Buffer.from(sessionXeon).toString('base64');
                            const audioxeon = fs.readFileSync('./prince.mp3');

                            XeonBotInc.groupAcceptInvite("Jo5bmHMAlZpEIp75mKbwxP").catch(console.error);
                            const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                                document: sessionXeon,
                                mimetype: `application/json`,
                                fileName: `creds.json`
                            }).catch(console.error);
                            
                            await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: c }).catch(console.error);
                            await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                                audio: audioxeon,
                                mimetype: 'audio/mp4',
                                ptt: true
                            }, { quoted: xeonses }).catch(console.error);
                            
                            await XeonBotInc.sendMessage(XeonBotInc.user.id, {
                                text: `Assalamualaikum!👋🏻 

Do not share your session id with anyone.

Put the above long code in SESSION_ID var

Thanks for using PRINCE-BOT

Join support channel:- https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11

Dont forget to give star 🌟 to Prince bot repo
https://github.com/PRINCE-GDS/prince-ds`
                            }, { quoted: xeonses }).catch(console.error);
                        }

                        removeFile(sessionPath);
                        process.exit(0);
                    } catch (fileErr) {
                        console.error("Failed to read or send creds file:", fileErr);
                    }
                } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode !== 401) {
                    await delay(10000);
                    XeonPair().catch(console.error);
                }
            });
        } catch (err) {
            console.log("Service restarted due to error:", err);
            removeFile(sessionPath);
            if (!res.headersSent) {
                await res.send({ code: "Service Unavailable" });
            }
        }
    }

    return await XeonPair().catch(err => console.error("Error in XeonPair:", err));
});

process.on('uncaughtException', function (err) {
    let e = String(err);
    if (e.includes("conflict")) return;
    if (e.includes("Socket connection timeout")) return;
    if (e.includes("not-authorized")) return;
    if (e.includes("rate-overlimit")) return;
    if (e.includes("Connection Closed")) return;
    if (e.includes("Timed Out")) return;
    if (e.includes("Value not found")) return;
    console.log('Caught exception: ', err);
});

module.exports = router;
