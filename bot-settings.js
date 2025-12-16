const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');
const { ownerId } = require('../../config.json');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot-control')
        .setDescription('أوامر إدارة البوت (للمالك فقط)'),

    async execute(interaction) {

        if (interaction.user.id !== ownerId) {
            return interaction.reply({
                content: 'هذا الأمر متاح فقط لمالك البوت!',
                ephemeral: true
            });
        }

        const embed = new EmbedBuilder()
            .setTitle('لوحة تحكم البوت')
            .setDescription('اختر إجراءً لإدارة البوت')
            .setColor('#ff0000');

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('restart_bot')
                    .setLabel('إعادة تشغيل البوت')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('stop_bot')
                    .setLabel('إيقاف البوت')
                    .setStyle(ButtonStyle.Danger),
                new ButtonBuilder()
                    .setCustomId('show_servers')
                    .setLabel('عرض السيرفرات')
                    .setStyle(ButtonStyle.Secondary),
                new ButtonBuilder()
                    .setCustomId('leave_server')
                    .setLabel('مغادرة سيرفر')
                    .setStyle(ButtonStyle.Danger)
            );

        await interaction.reply({
            embeds: [embed],
            components: [row],
            ephemeral: false
        });

        const collector = interaction.channel.createMessageComponentCollector({
            filter: i => i.user.id === ownerId,
            time: 60000
        });

        collector.on('collect', async i => {
            if (i.customId === 'leave_server') {
                const modal = new ModalBuilder()
                    .setCustomId('leave_server_modal')
                    .setTitle('مغادرة السيرفر')
                    .addComponents(
                        new ActionRowBuilder().addComponents(
                            new TextInputBuilder()
                                .setCustomId('server_id')
                                .setLabel('أدخل معرف السيرفر')
                                .setStyle(TextInputStyle.Short)
                                .setRequired(true)
                        )
                    );

                await i.showModal(modal);

                try {
                    const modalResponse = await i.awaitModalSubmit({
                        filter: i => i.user.id === ownerId && i.customId === 'leave_server_modal',
                        time: 60000
                    });

                    const serverId = modalResponse.fields.getTextInputValue('server_id');
                    const guild = interaction.client.guilds.cache.get(serverId);

                    if (!guild) {
                        await modalResponse.reply({
                            content: 'لم يتم العثور على سيرفر بهذا المعرف!',
                            ephemeral: true
                        });
                        return;
                    }

                    try {
                        await guild.leave();
                        await modalResponse.reply({
                            content: `تم مغادرة السيرفر بنجاح: ${guild.name}`,
                            ephemeral: true
                        });
                    } catch (error) {
                        await modalResponse.reply({
                            content: 'فشل في مغادرة السيرفر. يرجى التحقق من المعرف والمحاولة مرة أخرى.',
                            ephemeral: true
                        });
                    }
                } catch (error) {
                    // Modal timed out or was cancelled
                    return;
                }
                return;
            }

            // Handle other button interactions
            await i.deferReply({ ephemeral: true });

            switch (i.customId) {
                case 'restart_bot':
                    await i.editReply({ content: 'جاري إعادة تشغيل البوت...' });
                    process.exit(1);
                    break;

                case 'stop_bot':
                    await i.editReply({ content: 'جاري إيقاف البوت...' });
                    process.exit(0);
                    break;

                case 'show_servers':
                    let serverInfo = [];
                    
                    for (const guild of interaction.client.guilds.cache.values()) {
                        try {
                            const channel = guild.channels.cache
                                .filter(ch => ch.type === 0)
                                .first();
                                
                            let inviteLink = 'لا يوجد رابط دعوة متاح';
                            if (channel) {
                                const invite = await channel.createInvite({
                                    maxAge: 0,
                                    maxUses: 0
                                });
                                inviteLink = invite.url;
                            }
                            
                            serverInfo.push(`السيرفر: ${guild.name}\nالمعرف: ${guild.id}\nالدعوة: ${inviteLink}\n`);
                        } catch (error) {
                            serverInfo.push(`السيرفر: ${guild.name}\nالمعرف: ${guild.id}\nالدعوة: تعذر الإنشاء (الأذونات مفقودة)\n`);
                        }
                    }

                    try {
                        const owner = await interaction.client.users.fetch(ownerId);
                        const chunks = serverInfo.join('\n').match(/(.|[\r\n]){1,1900}/g);
                        
                        for (const chunk of chunks) {
                            await owner.send({
                                content: `**معلومات السيرفرات:**\n\`\`\`\n${chunk}\`\`\``
                            });
                        }
                        
                        await i.editReply({
                            content: 'تم إرسال معلومات السيرفر إلى الرسائل الخاصة!'
                        });
                    } catch (error) {
                        await i.editReply({
                            content: 'فشل في إرسال معلومات السيرفر. يرجى التأكد من فتح الرسائل الخاصة.'
                        });
                    }
                    break;
            }
        });

        collector.on('end', async () => {
            await interaction.editReply({
                components: []
            }).catch(() => {});
        });
    }
};