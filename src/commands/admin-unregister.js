const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const database = require('../services/database');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('admin-unregister')
    .setDescription('Admin command to unregister a user (Admin only)')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('The Discord user to unregister')
        .setRequired(true)),

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

      const targetUser = interaction.options.getUser('user');
      const targetDiscordId = targetUser.id;
      const targetUsername = targetUser.username;

      // Check if the target user is registered
      const user = await database.getUserByDiscordId(targetDiscordId);

      if (!user) {
        const embed = new EmbedBuilder()
          .setTitle('❌ User Not Found')
          .setDescription(`**${targetUsername}** is not registered in the LeetCode tracking system.`)
          .setColor('#ff0000')
          .setTimestamp();

        await interaction.editReply({ embeds: [embed] });
        return;
      }

      // Delete the user
      await database.deleteUser(targetDiscordId);

      const embed = new EmbedBuilder()
        .setTitle('✅ User Unregistered Successfully')
        .setDescription(`**${targetUsername}** has been unregistered from the LeetCode tracking system.`)
        .setColor('#00ff00')
        .setTimestamp()
        .addFields({
          name: '📋 Previous Registration Details',
          value: `**Display Name:** ${user.display_name}\n**LeetCode Username:** ${user.leetcode_username}`,
          inline: false
        })
        .addFields({
          name: '👤 Unregistered By',
          value: `${interaction.user.username} (Admin)`,
          inline: false
        });

      await interaction.editReply({ embeds: [embed] });

      console.log(`✅ Admin unregistered user: ${user.display_name} (${user.leetcode_username}) by ${interaction.user.username}`);

    } catch (error) {
      console.error('Error in admin-unregister command:', error);
      
      let errorMessage = 'An error occurred during unregistration. Please try again later.';
      
      if (error.message === 'User not found') {
        errorMessage = 'The specified user is not registered.';
      } else if (error.message === 'No user was deleted') {
        errorMessage = 'Failed to delete the user registration. Please try again.';
      }
      
      const embed = new EmbedBuilder()
        .setTitle('❌ Admin Unregistration Failed')
        .setDescription(errorMessage)
        .setColor('#ff0000')
        .setTimestamp();

      await interaction.editReply({ embeds: [embed] });
    }
  },
}; 