const { SlashCommandBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require("st.db");
const calculatorDB = new Database("./Database/calculator.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('calculator')
        .setDescription('نظام الحاسبة')
        .addSubcommand(subcommand =>
            subcommand
                .setName('setchannel')
                .setDescription('تعيين روم للحاسبة')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('الروم')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removechannel')
                .setDescription('إزالة روم الحاسبة')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setchannel') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '**تحتاج إلى صلاحيات المسؤول لاستخدام هذا الأمر!**',
                    ephemeral: true
                });
            }

            const channel = interaction.options.getChannel('channel');
            calculatorDB.set(`calculator_${interaction.guild.id}`, channel.id);

            return interaction.reply({
                content: ` تم تعيين ${channel} كقناة للحاسبة التلقائية بنجاح!`,
                ephemeral: false
            });
        }
        else if (subcommand === 'removechannel') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '**تحتاج إلى صلاحيات المسؤول لاستخدام هذا الأمر!**',
                    ephemeral: true
                });
            }

            calculatorDB.delete(`calculator_${interaction.guild.id}`);

            return interaction.reply({
                content: ' تم إزالة قناة الحاسبة التلقائية بنجاح!',
                ephemeral: false
            });
        }
    },
};