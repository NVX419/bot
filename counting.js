const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits } = require('discord.js');
const CountingSchema = require('../../Schemas/CountingSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('counting')
        .setDescription('إدارة نظام العد')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('تسطيب نظام العد')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة المستخدمة للعد')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('top')
                .setDescription('عرض توب العدد الحالي'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('leaderboard')
                .setDescription('عرض لوحة المتصدرين'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة قناة العد'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('reset')
                .setDescription('إعادة تعيين جميع بيانات العد'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('emoji')
                .setDescription('تعيين ايموجي للعد الصحيح')
                .addStringOption(option =>
                    option.setName('emoji')
                        .setDescription('الايموجي')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: ' تحتاج إلى صلاحيات المسؤول!', ephemeral: true });
                }

                const channel = interaction.options.getChannel('channel');
                
                await CountingSchema.findOneAndUpdate(
                    { guildId: interaction.guildId },
                    { 
                        guildId: interaction.guildId,
                        channelId: channel.id,
                        currentCount: 0,
                        lastUserId: null
                    },
                    { upsert: true, new: true }
                );

                return interaction.reply(` تم تعيين قناة العد إلى ${channel}`);
            }

            case 'top': {
                const countData = await CountingSchema.findOne({ guildId: interaction.guildId });
                if (!countData) return interaction.reply(' لم يتم إعداد قناة العد!');

                const embed = new EmbedBuilder()
                    .setTitle('العدد الحالي')
                    .setDescription(`العدد الحالي: **${countData.currentCount}**`)
                    .setColor('Blue')
                    .setTimestamp();

                return interaction.reply({ embeds: [embed] });
            }

            case 'leaderboard': {
                const countData = await CountingSchema.findOne({ guildId: interaction.guildId });
                if (!countData) return interaction.reply(' لم يتم إعداد قناة العد!');

                const sortedUsers = countData.users
                    .sort((a, b) => b.count - a.count)
                    .slice(0, 10);

                const embed = new EmbedBuilder()
                    .setTitle('لوحة المتصدرين')
                    .setColor('Gold')
                    .setTimestamp();

                if (sortedUsers.length > 0) {
                    const leaderboard = await Promise.all(sortedUsers.map(async (user, index) => {
                        const member = await interaction.guild.members.fetch(user.userId).catch(() => null);
                        const username = member ? member.user.username : 'Unknown User';
                        return `${index + 1}. ${username} - ${user.count} counts`;
                    }));

                    embed.setDescription(leaderboard.join('\n'));
                } else {
                    embed.setDescription('لا توجد بيانات عد حتى الآن!');
                }

                return interaction.reply({ embeds: [embed] });
            }

            case 'remove': {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: '❌ تحتاج إلى صلاحيات المسؤول!', ephemeral: true });
                }

                await CountingSchema.findOneAndDelete({ guildId: interaction.guildId });
                return interaction.reply(' تم إزالة قناة العد!');
            }

            case 'reset': {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: '❌ تحتاج إلى صلاحيات المسؤول!', ephemeral: true });
                }

                const countData = await CountingSchema.findOne({ guildId: interaction.guildId });
                if (!countData) return interaction.reply('❌ لم يتم إعداد قناة العد!');

                
                countData.currentCount = 0;
                countData.lastUserId = null;
                countData.users = [];
                await countData.save();

                return interaction.reply(' تم إعادة تعيين جميع بيانات العد!');
            }

            case 'emoji': {
                if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
                    return interaction.reply({ content: ' تحتاج إلى صلاحيات المسؤول!', ephemeral: true });
                }

                const emoji = interaction.options.getString('emoji');
                
                
                const emojiRegex = /(\u00a9|\u00ae|[\u2000-\u3300]|\ud83c[\ud000-\udfff]|\ud83d[\ud000-\udfff]|\ud83e[\ud000-\udfff])|<a?:.+?:\d{18,19}>/;
                if (!emojiRegex.test(emoji)) {
                    return interaction.reply({ content: ' الرجاء تقديم رمز تعبيري صالح!', ephemeral: true });
                }

                await CountingSchema.findOneAndUpdate(
                    { guildId: interaction.guildId },
                    { emoji: emoji },
                    { new: true }
                );

                return interaction.reply(` تم تعيين رمز العد إلى ${emoji}`);
            }
        }
    },
};
