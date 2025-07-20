const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unregister')
    .setDescription('Remove your LeetCode registration'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      const discordId = interaction.user.id;
      const user = await database.getUserByDiscordId(discordId);

      if (!user) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Not Registered')
          .setDescription('You are not registered yet.')
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Delete the user
      await database.deleteUser(discordId);

      const embed = new EmbedBuilder()
        .setTitle('✅ Unregistered Successfully')
        .setDescription(`You have been unregistered from the LeetCode tracking system.\n\n**Previous Registration:**\nDiscord: ${user.discord_username}\nLeetCode: ${user.leetcode_username}`)
        .setColor('#00ff00')
        .setTimestamp()
        .addFields({
          name: '📅 Weekly Updates',
          value: 'You will no longer receive weekly updates. You can register again anytime with `/register`.',
          inline: false
        });

      await interaction.editReply({ embeds: [embed] });

      console.log(`✅ User unregistered: ${user.discord_username} (${user.leetcode_username})`);

    } catch (error) {
      console.error('Error in unregister command:', error);
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Unregistration Failed')
        .setDescription('An error occurred during unregistration. Please try again later.')
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 