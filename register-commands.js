const { REST, Routes } = require('discord.js');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const config = require('./config');

async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(config.DISCORD_TOKEN);

  // Load commands
  const commands = [];
  const commandsPath = path.join(__dirname, 'src/commands');
  const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
      commands.push(command.data.toJSON());
      console.log(`Loaded command: ${command.data.name}`);
    }
  }

  try {
    console.log('Started refreshing application (/) commands.');
    console.log(`Client ID: ${config.CLIENT_ID}`);
    console.log(`Guild ID: ${config.GUILD_ID}`);
    console.log(`Commands to register: ${commands.length}`);

    await rest.put(
      Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
      { body: commands }
    );

    console.log('✅ Successfully reloaded application (/) commands.');
    console.log('Commands registered:');
    commands.forEach(cmd => console.log(`  - /${cmd.name}: ${cmd.description}`));
    
  } catch (error) {
    console.error('❌ Error registering commands:', error);
    console.error('Error details:', error.message);
    
    if (error.code === 50001) {
      console.error('❌ Missing Access: Bot does not have permission to create slash commands');
    } else if (error.code === 50013) {
      console.error('❌ Missing Permissions: Bot does not have required permissions');
    } else if (error.code === 10002) {
      console.error('❌ Unknown Application: Check your CLIENT_ID');
    } else if (error.code === 10004) {
      console.error('❌ Unknown Guild: Check your GUILD_ID');
    }
  }
}

// Run registration
registerCommands().then(() => {
  console.log('Command registration completed');
  process.exit(0);
}).catch(error => {
  console.error('Registration failed:', error);
  process.exit(1);
}); 