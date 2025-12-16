const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('webhook')
        .setDescription('إدارة ويب هوك في السيرفر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('إنشاء ويب هوك في قناة محددة')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة التي سيتم إنشاء الويب هوك فيها')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('name')
                        .setDescription('اسم الويب هوك')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('image')
                        .setDescription('رابط صورة الويب هوك (اختياري)')
                        .setRequired(false)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض قائمة الويب هوك النشطة في السيرفر'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('حذف ويب هوك من قناة محددة')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('القناة المراد حذف الويب هوك منها')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('deleteall')
                .setDescription('حذف جميع الويب هوك في السيرفر'))
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

    async execute(interaction) {
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                content: '❌ ليس لديك صلاحية لإدارة الويب هوك!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'create': {
                    const channel = interaction.options.getChannel('channel');
                    const name = interaction.options.getString('name');
                    const image = interaction.options.getString('image');

                    const webhook = await channel.createWebhook({
                        name: name,
                        avatar: image || null,
                        reason: `Webhook created by ${interaction.user.tag}`,
                    });

                    await interaction.user.send(`**تم إنشاء الويب هوك بنجاح!**\nهذا هو رابط الويب هوك:\n${webhook.url}`);

                    return interaction.reply({
                        content: ` تم إنشاء الويب هوك بنجاح في ${channel}. تم إرسال الرابط في الخاص.`,
                        ephemeral: true,
                    });
                }

                case 'list': {
                    const webhooks = await interaction.guild.fetchWebhooks();
                    if (webhooks.size === 0) {
                        return interaction.reply({
                            content: '❌ لا يوجد ويب هوك في هذا السيرفر.',
                            ephemeral: true
                        });
                    }

                    let webhookList = '';
                    webhooks.forEach(webhook => {
                        webhookList += `📌 **${webhook.name}** - Channel: <#${webhook.channelId}>\n`;
                    });

                    const embed = new EmbedBuilder()
                        .setColor('Blue')
                        .setTitle('ويب هوك السيرفر')
                        .setDescription(webhookList)
                        .setFooter({ text: `إجمالي الويب هوك: ${webhooks.size}` });

                    await interaction.user.send({ embeds: [embed] });
                    return interaction.reply({
                        content: '📥 تم إرسال قائمة الويب هوك في الخاص.',
                        ephemeral: true
                    });
                }

                case 'delete': {
                    const channel = interaction.options.getChannel('channel');
                    const webhooks = await channel.fetchWebhooks();

                    if (webhooks.size === 0) {
                        return interaction.reply({
                            content: `❌ لا يوجد ويب هوك في ${channel}.`,
                            ephemeral: true
                        });
                    }

                    for (const webhook of webhooks.values()) {
                        await webhook.delete(`Deleted by ${interaction.user.tag}`);
                    }

                    return interaction.reply({
                        content: `تم حذف ${webhooks.size} ويب هوك من ${channel} بنجاح.`,
                        ephemeral: true
                    });
                }

                case 'deleteall': {
                    const webhooks = await interaction.guild.fetchWebhooks();
                    if (webhooks.size === 0) {
                        return interaction.reply({
                            content: '❌ لا يوجد ويب هوك في هذا السيرفر.',
                            ephemeral: true
                        });
                    }

                    let deletedCount = 0;
                    for (const webhook of webhooks.values()) {
                        await webhook.delete(` deletion by ${interaction.user.tag}`);
                        deletedCount++;
                    }

                    return interaction.reply({
                        content: ` تم حذف ${deletedCount} ويب هوك من السيرفر بنجاح.`,
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Error managing webhooks:', error);
            return interaction.reply({
                content: '❌ حدث خطأ أثناء إدارة الويب هوك. يرجى التحقق من الصلاحيات.',
                ephemeral: true
            });
        }
    },
};