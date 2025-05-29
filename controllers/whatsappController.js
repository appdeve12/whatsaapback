// const User = require('../models/User');

// const { clients, sessionIds } = require('../whatsappClient');

// exports.sendMessage = async (req, res) => {
//   const { mobile, msg } = req.body;
//   if (!mobile || !msg) return res.status(400).json({ error: 'mobile and msg required' });

//   try {
//     const userId = req.user.id;
//     const user = await User.findById(userId);
//     if (!user) return res.status(401).json({ error: 'User not found' });

//     const whatsappId = user.whatsappId;
//     if (!whatsappId) return res.status(400).json({ error: 'WhatsApp ID not set for user' });

//     const client = clients[whatsappId];
//     if (!client || !client.info) {
//       return res.status(500).json({ error: 'WhatsApp client not ready for this user' });
//     }
 
//     const formatted = `${mobile}@c.us`;
//     await client.sendMessage(formatted, msg);

//     res.json({ status: 'sent', from: whatsappId });

//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ status: 'failed', error: err.message });
//   }
// };
const Whatsapp = require('../models/Whatsapp');
const User = require('../models/User');
const { clients } = require('../whatsappClient');

exports.sendMessage = async (req, res) => {
  const {
    from,
    to,
    message,
    profilePhoto,
    pdf,
    docx,
    photo,
    video,
  } = req.body;

  if (!from || !to || (!message && !photo && !pdf && !docx && !video)) {
    return res.status(400).json({ error: 'Required fields missing: from, to, and one message type (text/media)' });
  }

  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(401).json({ error: 'User not found' });

    const whatsappId = Whatsapp.whatsappId || '7985490508';
    const client = clients[whatsappId];

    if (!client || !client.info) {
      return res.status(500).json({ error: 'WhatsApp client not ready' });
    }

    const results = [];

    for (let recipient of to) {
      const chatId = recipient.endsWith('@c.us') ? recipient : `${recipient}@c.us`;

      // Text message
      if (message) {
        await client.sendMessage(chatId, message);
        results.push({ to: recipient, type: 'text', status: 'sent' });
      }

    if (photo) {
  const { MessageMedia } = require('whatsapp-web.js');
  const media = await MessageMedia.fromUrl(photo, { unsafeMime: true });
  await client.sendMessage(chatId, media);
  results.push({ to: recipient, type: 'photo', status: 'sent' });
}


      // PDF
      if (pdf) {
        const { MessageMedia } = require('whatsapp-web.js');
        const media = await MessageMedia.fromUrl(pdf);
        await client.sendMessage(chatId, media);
        results.push({ to: recipient, type: 'pdf', status: 'sent' });
      }

      // DOCX
      if (docx) {
        const { MessageMedia } = require('whatsapp-web.js');
        const media = await MessageMedia.fromUrl(docx);
        await client.sendMessage(chatId, media);
        results.push({ to: recipient, type: 'docx', status: 'sent' });
      }
      if (profilePhoto) {
  const { MessageMedia } = require('whatsapp-web.js'); 
  const media = await MessageMedia.fromUrl(profilePhoto, { unsafeMime: true });
  await client.sendMessage(chatId, media);
  results.push({ to: recipient, type: 'profilePhoto', status: 'sent' });
}

      // Video
      if (video) {
        const { MessageMedia } = require('whatsapp-web.js');
        const media = await MessageMedia.fromUrl(video);
        await client.sendMessage(chatId, media);
        results.push({ to: recipient, type: 'video', status: 'sent' });
      }
    }

    // Save in DB
    await Whatsapp.create({
      user: userId,
      from,
      to,
      message,
      whatsappId,
      profilePhoto,
      pdf,
      docx,
      photo,
      video,
    });

    res.json({ status: 'sent', results });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};
