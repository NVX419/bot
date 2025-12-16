const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require("st.db");
const DecorativeFont = require("decorative-fonts.js");
const fontChannelDB = new Database("./Database/fontChannels.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('fonts')
        .setDescription('نظام الخطوط وتحويل النصوص')
        .addSubcommand(subcommand =>
            subcommand
                .setName('convert')
                .setDescription('تحويل النص إلى خطوط مختلفة')
                .addStringOption(option => 
                    option.setName('text')
                        .setDescription('النص الذي تريد تحويله')
                        .setRequired(true))
                .addStringOption(option => 
                    option.setName('font')
                        .setDescription('الخط الذي تريد التحويل إليه')
                        .setRequired(true)
                        .setChoices(
                            { name: '𝐒𝐞𝐫𝐢𝐟', value: 'serif' },
                            { name: '𝔉𝔯𝔞𝔨𝔱𝔲𝔯', value: 'Fraktur' },
                            { name: '𝗕𝗼𝗹𝗱', value: 'bold' },
                            { name: '𝘐𝘵𝘢𝘭𝘪𝘤', value: 'Italic' },
                            { name: 'ℳ𝒯ℬℴ𝓁𝒹', value: 'MTBold' },
                            { name: '𝓔𝓭𝔀𝓪𝓻𝓭𝓲𝓪𝓷', value: 'Edwardian' },
                            { name: '𝗕𝘂𝗰𝗸𝗹𝗲', value: 'buckle' }
                        )))
        .addSubcommand(subcommand =>
            subcommand
                .setName('setchannel')
                .setDescription('تحديد روم الزخرفة')
                .addChannelOption(option =>
                    option.setName('channel')
                        .setDescription('الروم')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('removechannel')
                .setDescription('إزالة روم الزخرفة')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        if (subcommand === 'convert') {
            const text = interaction.options.getString('text');
            const font = interaction.options.getString('font');
            
            let convertedText = '';
            switch (font) {
                case 'serif': convertedText = DecorativeFont.serif(text); break;
                case 'Fraktur': convertedText = DecorativeFont.Fraktur(text); break;
                case 'bold': convertedText = DecorativeFont.bold(text); break;
                case 'Italic': convertedText = DecorativeFont.Italic(text); break;
                case 'MTBold': convertedText = DecorativeFont.MTBold(text); break;
                case 'buckle': convertedText = DecorativeFont.buckle(text); break;
                case 'Edwardian': convertedText = DecorativeFont.Edwardian(text); break;
            }
            
            await interaction.reply({ content: convertedText });
        }
        else if (subcommand === 'setchannel') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '**لا تملك صلاحيات كافية لاستخدام هذا الأمر!**',
                    ephemeral: true
                });
            }

            const channel = interaction.options.getChannel('channel');
            fontChannelDB.set(`fontchannel_${interaction.guild.id}`, channel.id);

            const embed = new EmbedBuilder()
                .setColor('Green')
                .setTitle('تم تحديد روم الزخرفة')
                .setDescription(` تم تحديد ${channel} كروم للزخرفة بنجاح!`)
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
        else if (subcommand === 'removechannel') {
            if (!interaction.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
                return interaction.reply({
                    content: '**لا تملك صلاحيات كافية لاستخدام هذا الأمر!**',
                    ephemeral: true
                });
            }

            fontChannelDB.delete(`fontchannel_${interaction.guild.id}`);

            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('تم إزالة روم الزخرفة')
                .setDescription('تم إزالة روم الزخرفة بنجاح!')
                .setTimestamp();

            await interaction.reply({ embeds: [embed] });
        }
    },
};