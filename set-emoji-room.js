const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const EmojiChannel = require('../../Schemas/EmojiChannelSchema.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('emoji-channel')
        .setDescription('إدارة الإيموجي')
        .addSubcommand(subcommand =>
            subcommand
                .setName('set')
                .setDescription('تعيين روم لإضافة الإيموجي تلقائياً')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('الروم')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة روم الإيموجي')
        ),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageGuild)) {
            return interaction.reply({ content: '❌ تحتاج إلى صلاحية "إدارة السيرفر" لاستخدام هذا الأمر', ephemeral: true });
        }

        if (subcommand === 'set') {
            const channel = interaction.options.getChannel('channel');

        
            await EmojiChannel.findOneAndUpdate(
                { Guild: interaction.guild.id },
                { Guild: interaction.guild.id, Channel: channel.id },
                { upsert: true }
            );

            return interaction.reply(` تم تعيين قناة الإيموجي إلى ${channel}`);
        } else if (subcommand === 'remove') {
            
            const result = await EmojiChannel.findOneAndDelete({ Guild: interaction.guild.id });

            if (!result) {
                return interaction.reply({ content: '❌ لم يتم تعيين قناة إيموجي حالياً', ephemeral: true });
            }

            return interaction.reply('تم إزالة قناة الإيموجي');
        }
    },
};