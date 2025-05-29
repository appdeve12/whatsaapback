// const { Client, LocalAuth } = require('whatsapp-web.js');

// const sessionIds = ['7985490508','9540215846'];  
// const clients = {};

// sessionIds.forEach(id => {
//   const client = new Client({
//     authStrategy: new LocalAuth({ clientId: id }),
//     puppeteer: { headless: true },
//   });

//   client.on('ready', () => console.log(`✅ WhatsApp client ${id} ready`));
//   client.on('auth_failure', () => console.log(`❌ WhatsApp client ${id} auth failed`));
//   client.initialize();

//   clients[id] = client;
// });

// module.exports = { clients, sessionIds };




const { Client, LocalAuth } = require('whatsapp-web.js');
const IncomingMessage = require('./models/IncomingMessage'); // ये model MongoDB के लिए होना चाहिए

const sessionIds = ['7985490508', '9540215846'];
const clients = {};

sessionIds.forEach(id => {
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: id }),
    puppeteer: { headless: true },
  });

  client.on('ready', () => {
    console.log(`✅ WhatsApp client ${id} ready`);
  });

  client.on('auth_failure', () => {
    console.log(`❌ WhatsApp client ${id} auth failed`);
  });

  // 👇👇 Incoming message handler
  client.on('message', async msg => {
    const from = msg.from;
    const to = client.info.wid.user; // This is the current session number
    const message = msg.body;
    const timestamp = new Date();

    try {
      await IncomingMessage.create({
        whatsappId: id,
        from,
        to,
        message,
        timestamp,
      });
      console.log(`📥 Message from ${from} to ${to}: ${message}`);
    } catch (err) {
      console.error(`❌ Error saving incoming message for ${id}:`, err.message);
    }
  });

  client.initialize();
  clients[id] = client;
});

module.exports = { clients, sessionIds };
