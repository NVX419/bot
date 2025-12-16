const { SlashCommandBuilder } = require("discord.js");
const { Database } = require("st.db");
const shortcutDB = new Database("./Database/ShortcutConfig"); // Initialize the shortcut database

module.exports = {
    adminsOnly: true,
    data: new SlashCommandBuilder()
        .setName('cmd-shortcut')
        .setDescription('لاضافة اختصار لامر')
        .addStringOption(option => 
            option
                .setName('command')
                .setDescription('الأمر المطلوب')
                .setRequired(true)
                .addChoices(
                    { name: 'ban', value: 'ban' },
                    { name: 'unban', value: 'unban'},
                    { name: 'user', value: 'user'},
                    { name: 'clear', value: 'clear' },
                    { name: 'lock', value: 'lock' },
                    { name: 'unlock', value: 'unlock' },
                    { name: 'hide', value: 'hide' },
                    { name: 'unhide', value: 'unhide' },
                    { name: 'server', value: 'server' },
                    { name: 'come', value: 'come' },
                    { name: 'tax', value: 'tax' },
                    { name: 'say', value: 'say' },
                )
        )
        .addStringOption(option => 
            option
                .setName('shortcut')
                .setDescription('الاختصار')
                .setRequired(true)
        ),
    async execute(interaction) {
        try {
            const command = interaction.options.getString('command');
            const shortcut = interaction.options.getString('shortcut');

            await shortcutDB.set(`${command}_cmd_${interaction.guild.id}`, shortcut);

            return interaction.reply({ content: `**تم تحديد اختصار للأمر \`${command}\` بنجاح: \`${shortcut}\`**` });
        } catch (error) {
            console.error(error);
            return interaction.reply({ content: `حدث خطأ ما، حاول مرة أخرى.`, ephemeral: true });
        }
    }
};
