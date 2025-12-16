const { SlashCommandBuilder, EmbedBuilder, PermissionsBitField } = require('discord.js');
const { Database } = require("st.db");
const badWordsDB = new Database("./Database/badwords.json");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bad-word')
        .setDescription('إدارة الكلمات السيئة ومدة حظرها')
        .setDefaultMemberPermissions(PermissionsBitField.Flags.Administrator)
        .addSubcommand(subcommand =>
            subcommand
                .setName('add')
                .setDescription('إضافة كلمة سيئة مع مدة الحظر')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('الكلمة')
                        .setRequired(true))
                .addIntegerOption(option =>
                    option.setName('timeout')
                        .setDescription('مدة الحظر بالثواني')
                        .setRequired(true)
                        .setMinValue(1)
                        .setMaxValue(2419200)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('remove')
                .setDescription('إزالة كلمة من قائمة الكلمات السيئة')
                .addStringOption(option =>
                    option.setName('word')
                        .setDescription('الكلمة المراد إزالتها من قائمة الكلمات السيئة')
                        .setRequired(true)))
        .addSubcommand(subcommand =>
            subcommand
                .setName('list')
                .setDescription('عرض جميع الكلمات السيئة ومدة حظرها')),

    async execute(interaction) {
        const subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'add': {
                const word = interaction.options.getString('word').toLowerCase();
                const timeout = interaction.options.getInteger('timeout');

                const badWords = badWordsDB.get(`badwords_${interaction.guild.id}`) || [];
                
                if (badWords.some(bw => bw.word === word)) {
                    return interaction.reply({
                        content: '❌ هذه الكلمة موجودة بالفعل في القائمة!',
                        ephemeral: true
                    });
                }

                badWords.push({ word, timeout });
                badWordsDB.set(`badwords_${interaction.guild.id}`, badWords);

                const embed = new EmbedBuilder()
                    .setColor('Green')
                    .setTitle('تمت إضافة كلمة سيئة')
                    .addFields(
                        { name: 'الكلمة', value: `||${word}||` },
                        { name: 'مدة الحظر', value: `${timeout} ثانية` }
                    );

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }

            case 'remove': {
                const word = interaction.options.getString('word').toLowerCase();
                const badWords = badWordsDB.get(`badwords_${interaction.guild.id}`) || [];
                
                const index = badWords.findIndex(bw => bw.word === word);
                if (index === -1) {
                    return interaction.reply({
                        content: '❌ هذه الكلمة غير موجودة في القائمة!',
                        ephemeral: true
                    });
                }

                badWords.splice(index, 1);
                badWordsDB.set(`badwords_${interaction.guild.id}`, badWords);

                await interaction.reply({
                    content: `تم إزالة ||${word}|| من قائمة الكلمات السيئة بنجاح.`,
                    ephemeral: true
                });
                break;
            }

            case 'list': {
                const badWords = badWordsDB.get(`badwords_${interaction.guild.id}`) || [];
                
                if (badWords.length === 0) {
                    return interaction.reply({
                        content: '❌ لا توجد كلمات سيئة في القائمة.',
                        ephemeral: true
                    });
                }

                const embed = new EmbedBuilder()
                    .setColor('Blue')
                    .setTitle('قائمة الكلمات السيئة')
                    .setDescription('فيما يلي جميع الكلمات السيئة ومدة حظرها:')
                    .addFields(
                        badWords.map(bw => ({
                            name: `الكلمة: ||${bw.word}||`,
                            value: `مدة الحظر: ${bw.timeout} ثانية`
                        }))
                    );

                await interaction.reply({ embeds: [embed], ephemeral: true });
                break;
            }
        }
    },
};