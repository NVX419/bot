const { SlashCommandBuilder, PermissionFlagsBits, ChannelType } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('create-room')
        .setDescription('إنشاء روم جديد في السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
        .addStringOption(option =>
            option.setName('name')
                .setDescription('اسم الروم')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('نوع الروم')
                .setRequired(true)
                .addChoices(
                    { name: 'قناة نصية', value: 'text' },
                    { name: 'قناة صوتية', value: 'voice' }
                ))
        .addChannelOption(option =>
            option.setName('category')
                .setDescription('الكاتاجور التي سيتم إنشاء الغرفة فيها')
                .addChannelTypes(ChannelType.GuildCategory)
                .setRequired(true)),

    async execute(interaction) {
        try {
            const name = interaction.options.getString('name');
            const type = interaction.options.getString('type');
            const category = interaction.options.getChannel('category');

            if (!category || !category.id) {
                return interaction.reply({
                    content: 'الفئة المحددة غير صالحة!',
                    ephemeral: true
                });
            }

            const channelType = type === 'text' ? ChannelType.GuildText : ChannelType.GuildVoice;

            const channel = await interaction.guild.channels.create({
                name: name,
                type: channelType,
                parent: category.id,
                reason: `Created by ${interaction.user.tag}`
            }).catch(error => {
                console.error('Channel creation error:', error);
                return null;
            });

            if (!channel) {
                return interaction.reply({
                    content: 'فشل في إنشاء القناة. يرجى التحقق من صلاحياتي.',
                    ephemeral: true
                });
            }

            await interaction.reply({
                content: `تم إنشاء ${type === 'text' ? 'قناة نصية' : 'قناة صوتية'} **${channel.name}** في الفئة **${category.name}** بنجاح!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Execute error:', error);
            await interaction.reply({
                content: 'حدث خطأ أثناء إنشاء الغرفة!',
                ephemeral: true
            });
        }
    },
};