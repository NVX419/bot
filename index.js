const { Client, GatewayIntentBits, REST, Routes, SlashCommandBuilder } = require('discord.js');
const express = require('express');
require('dotenv').config();

const app = express();
app.use(express.static('public'));

const PORT = process.env.PORT || 3000;

const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });

// ----- سلاش كوماند -----
const commands = [
  new SlashCommandBuilder()
    .setName('auto-reply')
    .setDescription('يضيف رد تلقائي')
    .addStringOption(option => option.setName('keyword').setDescription('الكلمة').setRequired(true))
    .addStringOption(option => option.setName('reply').setDescription('الرد').setRequired(true))
];

const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_BOT_TOKEN);

(async () => {
  try {
    console.log('تسجيل السلاش كوماند...');
    await rest.put(
      Routes.applicationGuildCommands(process.env.CLIENT_ID, process.env.GUILD_ID),
      { body: commands },
    );
    console.log('تم تسجيل السلاش كوماند!');
  } catch (error) {
    console.error(error);
  }
})();

// ----- قاعدة ردود تلقائية -----
let autoReplies = {};

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'auto-reply') {
    const keyword = interaction.options.getString('keyword');
    const reply = interaction.options.getString('reply');
    autoReplies[keyword.toLowerCase()] = reply;
    await interaction.reply(`تم إضافة الرد على: ${keyword}`);
  }
});

// ----- أمر عادي -----
client.on('messageCreate', message => {
  if (message.author.bot) return;

  // تحقق من الردود التلقائية
  const text = message.content.toLowerCase();
  if (autoReplies[text]) {
    message.reply(autoReplies[text]);
  }

  // أمر !ping
  if (message.content === '!ping') {
    message.reply('Pong!');
  }
});

// ----- تشغيل البوت -----
client.login(process.env.DISCORD_BOT_TOKEN);

// ----- سيرفر ويب بسيط -----
app.get('/status', (req, res) => {
  res.send(client.isReady() ? 'البوت متصل ✅' : 'البوت غير متصل ❌');
});

app.listen(PORT, () => console.log(`السيرفر شغال على المنفذ ${PORT}`));
