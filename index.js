const { Client, GatewayIntentBits } = require('discord.js');

// إنشاء البوت
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// البوت جاهز
client.on('ready', () => {
  console.log(`البوت شغال ✅ اسم البوت: ${client.user.tag}`);
});

// ----- قاعدة الردود التلقائية -----
let autoReplies = {
  "سلام": "وعليكم السلام",
  "هلا": "هلا والله"
};

client.on('messageCreate', message => {
  if (message.author.bot) return;

  const text = message.content.toLowerCase();

  // تحقق من الردود التلقائية
  if (autoReplies[text]) {
    message.reply(autoReplies[text]);
  }

  // أمر تجربة !ping
  if (text === '!ping') {
    message.reply('Pong!');
  }
});

// تشغيل البوت
client.login(process.env.DISCORD_BOT_TOKEN);
