const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const weeklyUpdate = require('../services/weeklyUpdate');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('testupdate')
    .setDescription('Trigger a test weekly update (Admin only)'),

  async execute(interaction) {
    await interaction.deferReply({ ephemeral: true });

    try {
      // Check if user has admin permissions
      if (!interaction.member.permissions.has('Administrator')) {
        const embed = new EmbedBuilder()
          .setTitle('❌ Permission Denied')
          .setDescription('You need Administrator permissions to use this command.')
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      const embed = new EmbedBuilder()
        .setTitle('🧪 Test Update Triggered')
        .setDescription('Sending test weekly update...')
        .setColor('#0099ff')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });

      // Trigger test update
      await weeklyUpdate.sendTestUpdate(interaction.client);

      console.log(`🧪 Test update triggered by ${interaction.user.username}`);

    } catch (error) {
      console.error('Error in testupdate command:', error);
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Test Update Failed')
        .setDescription('An error occurred while sending the test update.')
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 