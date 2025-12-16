const { SlashCommandBuilder } = require('@discordjs/builders');
const { EmbedBuilder, PermissionsBitField } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('change-server')
        .setDescription('إدارة إعدادات السيرفر')
        .addSubcommand(subcommand =>
            subcommand
                .setName('avatar')
                .setDescription('تغيير صورة السيرفر')
                .addAttachmentOption(option =>
                    option
                        .setName('image')
                        .setDescription('صورة السيرفر الجديدة')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('banner')
                .setDescription('تغيير بنر السيرفر')
                .addAttachmentOption(option =>
                    option
                        .setName('image')
                        .setDescription('صورة')
                        .setRequired(true)
                )
        )
        .addSubcommand(subcommand =>
            subcommand
                .setName('name')
                .setDescription('تغيير اسم السيرفر')
                .addStringOption(option =>
                    option
                        .setName('new-name')
                        .setDescription('اسم السيرفر الجديد')
                        .setRequired(true)
                        .setMinLength(2)
                        .setMaxLength(100)
                )
        ),

    async execute(interaction) {
        
        if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return interaction.reply({
                content: '❌ تحتاج إلى صلاحيات الإدارة لاستخدام هذا الأمر!',
                ephemeral: true
            });
        }

        const subcommand = interaction.options.getSubcommand();

        try {
            switch (subcommand) {
                case 'avatar': {
                    const image = interaction.options.getAttachment('image');
                    
                   
                    if (!image.contentType?.startsWith('image/')) {
                        return interaction.reply({
                            content: '❌ الرجاء تقديم ملف صورة صالح!',
                            ephemeral: true
                        });
                    }

                    await interaction.guild.setIcon(image.url);
                    
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('تم تحديث صورة السيرفر')
                        .setDescription('تم تغيير صورة السيرفر بنجاح!')
                        .setImage(image.url)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'banner': {
                    const image = interaction.options.getAttachment('image');
                    
                    
                    if (!image.contentType?.startsWith('image/')) {
                        return interaction.reply({
                            content: '❌ الرجاء تقديم ملف صورة صالح!',
                            ephemeral: true
                        });
                    }

                    await interaction.guild.setBanner(image.url);
                    
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle('تم تحديث بانر السيرفر')
                        .setDescription('تم تغيير بانر السيرفر بنجاح!')
                        .setImage(image.url)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }

                case 'name': {
                    const newName = interaction.options.getString('new-name');
                    const oldName = interaction.guild.name;

                    await interaction.guild.setName(newName);
                    
                    const embed = new EmbedBuilder()
                        .setColor('Green')
                        .setTitle(' تم تحديث اسم السيرفر')
                        .setDescription(`تم تغيير اسم السيرفر:\n**القديم:** ${oldName}\n**الجديد:** ${newName}`)
                        .setTimestamp();

                    await interaction.reply({ embeds: [embed] });
                    break;
                }
            }
        } catch (error) {
            console.error(error);
            return interaction.reply({
                content: '❌ حدث خطأ أثناء تحديث إعدادات السيرفر!',
                ephemeral: true
            });
        }
    }
};
