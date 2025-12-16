const { SlashCommandBuilder } = require('@discordjs/builders');
const { PermissionsBitField, ChannelType } = require('discord.js');
const { Database } = require('st.db');

const logsDB = new Database("./Database/logs.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('setup-logs')
        .setDescription('إعداد اللوق للسيرفر')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('create')
                .setDescription('إنشاء رومات اللوق'))
        .addSubcommand(subcommand =>
            subcommand
                .setName('delete')
                .setDescription('حذف جميع رومات اللوق')),

    async execute(interaction) {
        try {
            await interaction.deferReply();

            const subcommand = interaction.options.getSubcommand();

            if (subcommand === 'delete') {
                const logData = logsDB.get(`logs_${interaction.guild.id}`);
                if (!logData) {
                    return await interaction.editReply('❌ لم يتم العثور على قنوات سجلات للحذف');
                }

                // Delete all log channels
                const channels = [
                    logData.messageLog,
                    logData.memberLog,
                    logData.nicknameLog,
                    logData.voiceLog,
                    logData.inviteLog,
                    logData.roomLog
                ];

                for (const channelId of channels) {
                    const channel = interaction.guild.channels.cache.get(channelId);
                    if (channel) await channel.delete().catch(() => {});
                }

                
                if (logData.category) {
                    const category = interaction.guild.channels.cache.get(logData.category);
                    if (category) await category.delete().catch(() => {});
                }

                
                logsDB.delete(`logs_${interaction.guild.id}`);

                return await interaction.editReply('تم حذف جميع قنوات السجلات بنجاح!');
            }

           
            const category = await interaction.guild.channels.create({
                name: '📋 لوقات السيرفر',
                type: ChannelType.GuildCategory,
            });

            const messageLog = await interaction.guild.channels.create({
                name: '💬-سجلات-الرسائل',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const memberLog = await interaction.guild.channels.create({
                name: '👥-log-members',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const nicknameLog = await interaction.guild.channels.create({
                name: '📝-log-messages',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const voiceLog = await interaction.guild.channels.create({
                name: '🎤-log-voice',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const inviteLog = await interaction.guild.channels.create({
                name: '📨-log-invites',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

            const roomLog = await interaction.guild.channels.create({
                name: '🚪-log-rooms',
                type: ChannelType.GuildText,
                parent: category.id,
                permissionOverwrites: [
                    {
                        id: interaction.guild.roles.everyone,
                        deny: [PermissionsBitField.Flags.ViewChannel],
                    },
                ],
            });

           
            logsDB.set(`logs_${interaction.guild.id}`, {
                messageLog: messageLog.id,
                memberLog: memberLog.id,
                nicknameLog: nicknameLog.id,
                voiceLog: voiceLog.id,
                inviteLog: inviteLog.id,
                roomLog: roomLog.id,
                category: category.id
            });

            await interaction.editReply('تم إنشاء جميع قنوات السجلات بنجاح!');

        } catch (error) {
            console.error(error);
            await interaction.editReply('❌ حدث خطأ أثناء إدارة قنوات السجلات');
        }
    },
};
