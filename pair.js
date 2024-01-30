const express = require('express');
const fs = require('fs');
let router = express.Router()
const pino = require("pino");
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    makeCacheableSignalKeyStore
} = require("@whiskeysockets/baileys");

function removeFile(FilePath){
    if(!fs.existsSync(FilePath)) return false;
    fs.rmSync(FilePath, { recursive: true, force: true })
 };
router.get('/', async (req, res) => {
    let num = req.query.number;
        async function XeonPair() {
        const {
            state,
            saveCreds
        } = await useMultiFileAuthState(`./session`)
     try {
            let XeonBotInc = makeWASocket({
                auth: {
                    creds: state.creds,
                    keys: makeCacheableSignalKeyStore(state.keys, pino({level: "fatal"}).child({level: "fatal"})),
                },
                printQRInTerminal: false,
                logger: pino({level: "fatal"}).child({level: "fatal"}),
                browser: [ "Ubuntu", "Chrome", "20.0.04" ],
             });
             if(!XeonBotInc.authState.creds.registered) {
                await delay(1500);
                        num = num.replace(/[^0-9]/g,'');
                            const code = await XeonBotInc.requestPairingCode(num)
                 if(!res.headersSent){
                 await res.send({code});
                     }
                 }
            XeonBotInc.ev.on('creds.update', saveCreds)
            XeonBotInc.ev.on("connection.update", async (s) => {
                const {
                    connection,
                    lastDisconnect
                } = s;
                if (connection == "open") {
                await delay(10000);
                    const sessionXeon = fs.readFileSync('./session/creds.json');
			let c = Buffer.from(sessionXeon).toString('base64');
                    const audioxeon = fs.readFileSync('./prince.mp3');
                    XeonBotInc.groupAcceptInvite("Jo5bmHMAlZpEIp75mKbwxP");
				const xeonses = await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: c});
				XeonBotInc.sendMessage(XeonBotInc.user.id, {
                    audio: audioxeon,
                    mimetype: 'audio/mp4',
                    ptt: true
                }, {
                    quoted: xeonses
                });
				await XeonBotInc.sendMessage(XeonBotInc.user.id, { text: `*💗ᴛʜᴇ ɢᴅs-ᴍᴅ ᴄᴏᴅᴇ ʜᴀs ʙᴇᴇɴ ᴘᴀɪʀᴇᴅ sᴜᴄᴄᴇssғᴜʟʟʏ✅*

*💌ɢɪᴠᴇ ᴀ sᴛᴀʀ ᴛᴏ ᴍʏ ʀᴇᴘᴏs ғᴏʀ ᴄᴏᴜʀᴀɢᴇ✨*

 𓆩 𓅓 𓆪 𝙂𝘿𝙎-𝙈𝘿 𓆩 𓅓 𓆪
 https://github.com/PRINCE-GDS/GDS-MD

 
 𓆩 𓅓 𓆪 *𝘗𝘙𝘐𝘕𝘊𝘌-𝘉𝘖𝘛-𝘔𝘋* 𓆩 𓅓 𓆪
https://github.com/PRINCE-GDS/THE-PRINCE-BOT


🪩ᴊᴏɪɴ sᴜᴘᴘᴏʀᴛ ɢʀᴏᴜᴘ ғᴏʀ ᴍᴏʀᴇ ϙᴜᴇʀʏ🪩
https://chat.whatsapp.com/Jo5bmHMAlZpEIp75mKbwxP


❇️Cʜᴀɴɴᴇʟ ʟɪɴᴋ❇️
https://whatsapp.com/channel/0029VaGR6Ab7IUYPsbvSEa33


🛡️𝙂𝘿𝙎-𝙈𝘿🛡️` }, {quoted: xeonses});
        await delay(100);
        return await removeFile('./session');
        process.exit(0)
            } else if (connection === "close" && lastDisconnect && lastDisconnect.error && lastDisconnect.error.output.statusCode != 401) {
                    await delay(10000);
                    XeonPair();
                }
            });
        } catch (err) {
            console.log("service restated");
            await removeFile('./session');
         if(!res.headersSent){
            await res.send({code:"Service Unavailable"});
         }
        }
    }
    return await XeonPair()
});

process.on('uncaughtException', function (err) {
let e = String(err)
if (e.includes("conflict")) return
if (e.includes("Socket connection timeout")) return
if (e.includes("not-authorized")) return
if (e.includes("rate-overlimit")) return
if (e.includes("Connection Closed")) return
if (e.includes("Timed Out")) return
if (e.includes("Value not found")) return
console.log('Caught exception: ', err)
})

module.exports = router
