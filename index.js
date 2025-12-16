const { Client, GatewayIntentBits } = require('discord.js');

// إنشاء البوت
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// قاعدة الردود التلقائية
const autoReplies = {
  "سلام": "وعليكم السلام",
  "هلا": "هلا والله"
};

// مجموعة لتخزين الرسائل المعالجة لتجنب التكرار
const processedMessages = new Set();

// البوت جاهز
client.on('ready', () => {
  console.log(`البوت شغال ✅ اسم البوت: ${client.user.tag}`);
});

client.on('messageCreate', message => {
  if (message.author.bot) return; // تجاهل رسائل البوت نفسه
  if (processedMessages.has(message.id)) return; // منع التكرار

  processedMessages.add(message.id); // إضافة الرسالة إلى المعالجة

  const text = message.content.toLowerCase();

  // تحقق من الردود التلقائية
  if (autoReplies[text]) {
    message.reply(autoReplies[text]);
    return; // منع أي تكرار لاحق في نفس الحدث
  }

  // أمر تجربة !ping
  if (text === '!ping') {
    message.reply('Pong!');
  }
});

// تشغيل البوت
client.login(process.env.DISCORD_BOT_TOKEN);
