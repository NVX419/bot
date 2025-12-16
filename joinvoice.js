const { SlashCommandBuilder, EmbedBuilder, PermissionFlagsBits, ChannelType } = require("discord.js");
const { Database } = require('st.db');
const db = new Database('/Database/Voice.json');
const { joinVoiceChannel } = require("@discordjs/voice");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("join")
        .setDescription("الانضمام إلى قناة صوتية")
        .addChannelOption(option =>
            option.setName('channel')
            .setDescription('اختر القناة الصوتية للانضمام إليها')
            .setRequired(true)
            .addChannelTypes(ChannelType.GuildVoice)
        ),
    async execute(interaction) {
        const { options } = interaction;

        
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setDescription("❌ تحتاج إلى صلاحيات `المسؤول` لاستخدام هذا الأمر")
                        .setColor("Red")
                ],
                ephemeral: true
            });
        }

        const VoiceChannelJoin = interaction.options.getChannel('channel');

        try {
            joinVoiceChannel({
                channelId: VoiceChannelJoin.id,
                guildId: VoiceChannelJoin.guild.id,
                adapterCreator: VoiceChannelJoin.guild.voiceAdapterCreator,
            });

            const Embed = new EmbedBuilder()
                .setColor("Green")
                .setTitle('تم بنجاح')
                .setDescription(`💨 **تم الانضمام إلى القناة الصوتية بنجاح**`)
                .setTimestamp();
            
            await interaction.reply({ embeds: [Embed], ephemeral: false });
        } catch (err) {
            console.log(err);
            const EmbedError = new EmbedBuilder()
                .setTitle("خطأ")
                .setDescription("❌ حدث خطأ ما. يرجى التواصل مع المطورين")
                .setColor("Red")
                .setTimestamp();

            await interaction.reply({ embeds: [EmbedError], ephemeral: true });
        }
    }
};