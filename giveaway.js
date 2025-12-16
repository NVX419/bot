const { Events, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { Database } = require('st.db');
const moment = require('moment');
const _ = require('lodash');

const giveawaydb = new Database('/Database/Giveaway');

module.exports = {
  name: Events.ClientReady,
  once: true,
  execute(client) {

    // Giveaway management
    setInterval(() => {
      const Timer = giveawaydb.get('RunningGiveaways') || [];
      if (Timer.length > 0) {
        for (const data2 of Timer) {
          const { Time: giveawayTime, messageID: Message, guild: GuildID, Winners, Prize, Channel } = data2;
          const guild = client.guilds.cache.get(GuildID);
          if (!guild) continue;

          const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');
          const giveawaychannel = client.channels.cache.get(Channel);
          if (!giveawaychannel) continue;

          const giveawaymessage = giveawaychannel.messages.cache.get(Message);
          if (!giveawaymessage) continue;

          if (moment(currentTime).isAfter(giveawayTime) && data2.Status === "true" && data2.Ended === "false") {
            const participants = giveawaydb.get(`${GuildID}_${Message}_Members`) || [];
            const winners = _.sampleSize(participants, Math.min(Winners, participants.length));

            let winnersFormatted = [];
            let winnersIds = [];
            winners.forEach(winner => {
              winnersFormatted.push(`<@!${winner}>`);
              winnersIds.push(`${winner}`);
            });

            if (winnersFormatted.length > 0) {
              data2.winner = winnersFormatted;
              data2.Reroll = winnersIds;

              giveawaychannel.send({ 
                content: `الف مبروك يامحظوظ: ${winnersFormatted.join(', ')}! الفائزون: ${Prize}. تستطيع رؤية القيف [here](${giveawaymessage.url}).`
              });
            } else {
              giveawaychannel.send({ 
                content: `حدث خطا لم يتم تحديد فائز [here](${giveawaymessage.url}).`
              });
            }

            // Set up the button
            const GiveawayButton = new ActionRowBuilder().addComponents([
              new ButtonBuilder()
                .setCustomId('giveaway-entries')
                .setLabel('رؤية المشاركين')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(false),
            ]);

            const embedMessage = giveawaymessage.embeds[0];
            const updatedDescription = embedMessage.description
              .replace("Ends", "Ended")
              .replace(/Winners: \*\*\d+\*\*/, `Winners: ${winnersFormatted.join(", ")}`);

            const embed = new EmbedBuilder()
              .setTitle(giveawaymessage.embeds[0].title)
              .setDescription(updatedDescription);

            // Update giveaway data
            data2.Ended = "true";
            data2.Status = "false";
            giveawaymessage.edit({ embeds: [embed], components: [GiveawayButton] });

            giveawaydb.set(`${data2.messageID}_Data`, {
              Winner: winnersFormatted,
              Reroll: winnersIds,
              Prize,
              channelID: Channel
            }).then(() => {
              const updatedTimer = Timer.filter(s => s.messageID !== Message);
              giveawaydb.set("RunningGiveaways", updatedTimer);
            });
          }
        }
      }
    }, 1000);
  },
};