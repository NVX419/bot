const { SlashCommandBuilder, PermissionFlagsBits, EmbedBuilder } = require('discord.js');
const SecuritySchema = require('../../Schemas/SecuritySchema');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('security')
        .setDescription('إدارة إعدادات حماية السيرفر')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('antidelete-channels')
                .setDescription('تفعيل/تعطيل حماية حذف القنوات')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antidelete-roles')
                .setDescription('تفعيل/تعطيل حماية حذف الرتب')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antidelete-categories')
                .setDescription('تفعيل/تعطيل حماية حذف الكاتاجورب')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antilinks')
                .setDescription('تفعيل/تعطيل حماية الروابط')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antiban')
                .setDescription('تفعيل/تعطيل حماية الحظر')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antikick')
                .setDescription('تفعيل/تعطيل حماية الطرد')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('whitelist')
                .setDescription('إدارة القائمة البيضاء')
                .addStringOption(option =>
                    option.setName('action')
                        .setDescription('إضافة أو إزالة من القائمة البيضاء')
                        .setRequired(true)
                        .addChoices(
                            { name: 'إضافة', value: 'add' },
                            { name: 'إزالة', value: 'remove' }
                        ))
                .addUserOption(option =>
                    option.setName('user')
                        .setDescription('المستخدم المراد إضافته/إزالته من القائمة البيضاء')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('antibots')
                .setDescription('تفعيل/تعطيل حماية إضافة البوتات')
                .addBooleanOption(option =>
                    option.setName('enable')
                        .setDescription('تفعيل أو تعطيل الحماية')
                        .setRequired(true))),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();
        let config = await SecuritySchema.findOne({ guildId: interaction.guild.id });
        
        if (!config) {
            config = await SecuritySchema.create({
                guildId: interaction.guild.id,
                whitelist: [interaction.guild.ownerId] 
            });
        }

        switch (subcommand) {
            case 'antidelete-channels': {
                const enable = interaction.options.getBoolean('enable');
                config.antiDelete.channels = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية حذف القنوات`);
            }

            case 'antidelete-roles': {
                const enable = interaction.options.getBoolean('enable');
                config.antiDelete.roles = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية حذف الرتب`);
            }

            case 'antidelete-categories': {
                const enable = interaction.options.getBoolean('enable');
                config.antiDelete.categories = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية حذف الفئات`);
            }

            case 'antilinks': {
                const enable = interaction.options.getBoolean('enable');
                config.antiLinks = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية الروابط`);
            }

            case 'antiban': {
                const enable = interaction.options.getBoolean('enable');
                config.antiBan = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية الحظر الجماعي`);
            }

            case 'antikick': {
                const enable = interaction.options.getBoolean('enable');
                config.antiKick = enable;
                await config.save();

                return interaction.reply(` تم ${enable ? 'تفعيل' : 'تعطيل'} حماية الطرد الجماعي`);
            }

            case 'whitelist': {
                const action = interaction.options.getString('action');
                const user = interaction.options.getUser('user');

                if (action === 'add') {
                    if (!config.whitelist.includes(user.id)) {
                        config.whitelist.push(user.id);
                        await config.save();
                        return interaction.reply(` تمت إضافة ${user.tag} إلى القائمة البيضاء`);
                    }
                    return interaction.reply('❌ المستخدم موجود بالفعل في القائمة البيضاء');
                } else {
                    if (user.id === interaction.guild.ownerId) {
                        return interaction.reply('❌ لا يمكن إزالة مالك السيرفر من القائمة البيضاء');
                    }
                    config.whitelist = config.whitelist.filter(id => id !== user.id);
                    await config.save();
                    return interaction.reply(` تمت إزالة ${user.tag} من القائمة البيضاء`);
                }
            }

            case 'antibots': {
                const enable = interaction.options.getBoolean('enable');
                config.antiBots = enable;
                await config.save();

                const embed = new EmbedBuilder()
                    .setColor(enable ? 'Green' : 'Red')
                    .setDescription(`تم ${enable ? 'تفعيل' : 'تعطيل'} حماية إضافة البوتات`)
                    .setTimestamp();

                return interaction.reply({ embeds: [embed] });
            }
        }
    },
};
