const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const BlacklistSchema = require('../../Schemas/BlacklistSchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('blacklist')
        .setDescription('إدارة نظام القائمة السوداء في السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('setup')
                .setDescription('تسطيب نظام البلاك ليست')
                .addRoleOption(option =>
                    option.setName('role')
                        .setDescription('الرتبة')
                        .setRequired(true))
                .addChannelOption(option =>
                    option.setName('category')
                        .setDescription('الكاتاجوري لروم القائمة السوداء')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة عضو إلى القائمة السوداء')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو')
                        .setRequired(true))
                .addStringOption(option =>
                    option.setName('reason')
                        .setDescription('سبب الإضافة للقائمة السوداء')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة عضو من القائمة السوداء')
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('العضو')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                const role = interaction.options.getRole('role');
                const category = interaction.options.getChannel('category');

                // Create blacklist channel
                const channel = await interaction.guild.channels.create({
                    name: 'blacklist',
                    parent: category.id,
                    permissionOverwrites: [
                        {
                            id: interaction.guild.id,
                            deny: ['ViewChannel']
                        },
                        {
                            id: role.id,
                            allow: ['ViewChannel', 'SendMessages', 'ReadMessageHistory']
                        }
                    ]
                });

                await BlacklistSchema.findOneAndUpdate(
                    { guildId: interaction.guild.id },
                    {
                        guildId: interaction.guild.id,
                        roleId: role.id,
                        channelId: channel.id,
                        categoryId: category.id
                    },
                    { upsert: true }
                );

                return interaction.reply(` تم إعداد نظام القائمة السوداء مع الرتبة ${role} والقناة ${channel}`);
            }

            case 'add': {
                const config = await BlacklistSchema.findOne({ guildId: interaction.guild.id });
                if (!config) return interaction.reply('❌ لم يتم إعداد نظام القائمة السوداء!');

                const user = interaction.options.getUser('user');
                const reason = interaction.options.getString('reason');
                const member = await interaction.guild.members.fetch(user.id);

                
                const originalRoles = member.roles.cache.filter(role => role.id !== interaction.guild.id);
                await member.roles.remove(originalRoles);

                
                await member.roles.add(config.roleId);

                const embed = new EmbedBuilder()
                    .setTitle('تمت إضافة عضو للقائمة السوداء')
                    .setDescription(`تم إضافة ${user} إلى القائمة السوداء\nالسبب: ${reason}`)
                    .setColor('Red')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });

                const blacklistChannel = interaction.guild.channels.cache.get(config.channelId);
                if (blacklistChannel) {
                    await blacklistChannel.send(`${user}, تم إضافتك إلى القائمة السوداء للسبب التالي: ${reason}`);
                }
                break;
            }

            case 'remove': {
                const config = await BlacklistSchema.findOne({ guildId: interaction.guild.id });
                if (!config) return interaction.reply('❌ لم يتم إعداد نظام القائمة السوداء!');

                const user = interaction.options.getUser('user');
                const member = await interaction.guild.members.fetch(user.id);

                
                await member.roles.remove(config.roleId);

                const embed = new EmbedBuilder()
                    .setTitle('تمت إزالة العضو من القائمة السوداء')
                    .setDescription(`تم إزالة ${user} من القائمة السوداء`)
                    .setColor('Green')
                    .setTimestamp();

                await interaction.reply({ embeds: [embed] });
                break;
            }
        }
    },
};
