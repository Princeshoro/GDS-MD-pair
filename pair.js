import express from 'express';
import fs from 'fs';
import path from 'path';
import pino from 'pino';
import { fileURLToPath } from 'url';
import {
  makeWASocket,
  useMultiFileAuthState,
  delay,
  Browsers,
  makeCacheableSignalKeyStore
} from '@whiskeysockets/baileys';

// Resolve directory paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

function removeFile(filePath) {
  if (fs.existsSync(filePath)) {
    fs.rmSync(filePath, { recursive: true, force: true });
  }
}

router.get('/', async (req, res) => {
  let num = req.query.number;

  async function XeonPair() {
    const sessionPath = path.join(__dirname, 'session');

    if (!fs.existsSync(sessionPath)) {
      fs.mkdirSync(sessionPath, { recursive: true });
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    try {
      const XeonBotInc = makeWASocket({
        version: [2, 3000, 1015901307],
        printQRInTerminal: false,
        logger: pino({ level: 'silent' }),
        browser: Browsers.ubuntu('Chrome'),
        auth: {
          creds: state.creds,
          keys: makeCacheableSignalKeyStore(
            state.keys,
            pino().child({
              level: 'fatal',
              stream: 'store',
            })
          ),
        },
      });

      if (!XeonBotInc.authState.creds.registered) {
        await delay(1500);
        num = num.replace(/[^0-9]/g, '');
        const code = await XeonBotInc.requestPairingCode(num);
        if (!res.headersSent) {
          await res.send({ code });
        }
      }

      XeonBotInc.ev.on('creds.update', saveCreds);
      XeonBotInc.ev.on('connection.update', async (s) => {
        const { connection, lastDisconnect } = s;
        if (connection === 'open') {
          await delay(10000);
          try {
            const sessionFile = path.join(sessionPath, 'creds.json');
            if (fs.existsSync(sessionFile)) {
              const sessionXeon = fs.readFileSync(sessionFile);
              let c = Buffer.from(sessionXeon).toString('base64');

              XeonBotInc.groupAcceptInvite('Jo5bmHMAlZpEIp75mKbwxP');

              // Send text message only with session information
              await XeonBotInc.sendMessage(
                XeonBotInc.user.id,
                {
                  text: `Hey!👋🏻 

Do not share your session id with anyone.

Put the above long code in SESSION_ID var

Thanks for using PRINCE-BOT

Join support channel:- https://whatsapp.com/channel/0029VaKNbWkKbYMLb61S1v11

Dont forget to give star 🌟 to Prince bot repo
https://github.com/PRINCE-GDS/prince-ds`,
                }
              );

              await delay(100);
            }
            removeFile(sessionPath);
            process.exit(0);
          } catch (fileErr) {
            console.error('Failed to read or send creds file:', fileErr);
          }
        } else if (
          connection === 'close' &&
          lastDisconnect &&
          lastDisconnect.error &&
          lastDisconnect.error.output.statusCode !== 401
        ) {
          await delay(10000);
          XeonPair();
        }
      });
    } catch (err) {
      console.log('Service restarted due to error:', err);
      removeFile(sessionPath);
      if (!res.headersSent) {
        await res.send({ code: 'Service Unavailable' });
      }
    }
  }

  return await XeonPair();
});

export default router;
