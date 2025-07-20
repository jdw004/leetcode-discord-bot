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
        .setDescription(`You have been unregistered from the LeetCode tracking system.\n\n**Previous Registration:**\nDisplay Name: ${user.display_name}\nLeetCode: ${user.leetcode_username}`)
        .setColor('#00ff00')
        .setTimestamp()
        .addFields({
          name: '📅 Weekly Updates',
          value: 'You will no longer receive weekly updates. You can register again anytime with `/register`.',
          inline: false
        });

      await interaction.editReply({ embeds: [embed] });

      console.log(`✅ User unregistered: ${user.display_name} (${user.leetcode_username})`);

    } catch (error) {
      console.error('Error in unregister command:', error);
      
      let errorMessage = 'An error occurred during unregistration. Please try again later.';
      
      if (error.message === 'User not found') {
        errorMessage = 'You are not registered yet.';
      } else if (error.message === 'No user was deleted') {
        errorMessage = 'Failed to delete your registration. Please try again.';
      }
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Unregistration Failed')
        .setDescription(errorMessage)
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 