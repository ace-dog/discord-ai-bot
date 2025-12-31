import { Client, GatewayIntentBits, Message, ChannelType, TextChannel } from 'discord.js';
import dotenv from 'dotenv';
import config from './config.js';
import { AIService } from './ai.js';
import { ActivityMonitor } from './activityMonitor.js';
import { Scheduler } from './scheduler.js';

dotenv.config();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const aiService = new AIService();
const activityMonitor = new ActivityMonitor(client, aiService);
const scheduler = new Scheduler(client, aiService);

client.once('ready', async () => {
  if (!client.user) return;

  console.log(`✅ Bot logged in as ${client.user.tag}`);
  console.log(`📊 Active in ${client.guilds.cache.size} server(s)`);

  activityMonitor.start();
  scheduler.start();

  console.log('\n🤖 Bot is ready and monitoring channels!');

  // Send startup joke to all allowed channels
  await sendStartupJoke();
});

async function sendStartupJoke(): Promise<void> {
  try {
    const topic = aiService.getRandomTopic();
    console.log(`🎭 Generating startup joke about ${topic}...`);
    const joke = await aiService.generateJoke(topic);

    const channels = client.channels.cache.filter(channel => {
      if (!channel.isTextBased()) return false;

      if (config.allowedChannels.length === 0) {
        return channel.type === ChannelType.GuildText;
      }

      return config.allowedChannels.includes(channel.id);
    });

    for (const [, channel] of channels) {
      try {
        await (channel as TextChannel).send(`🤖 Bot is online! Here's a startup joke about ${topic}:\n\n${joke}`);
        console.log(`✅ Sent startup joke to: ${(channel as TextChannel).name}`);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        console.error(`Error sending startup joke to ${(channel as TextChannel).name}:`, errorMessage);
      }
    }
  } catch (error) {
    console.error('Error generating startup joke:', error);
  }
}

client.on('messageCreate', async (message: Message) => {
  if (message.author.bot) return;

  activityMonitor.recordActivity(message.channel.id);

  if (!activityMonitor.isChannelAllowed(message.channel.id)) {
    return;
  }

  const content = message.content.trim();

  if (content.startsWith(config.commandPrefix)) {
    await handleCommand(message, content);
  } else {
    await handleConversation(message, content);
  }
});

async function handleCommand(message: Message, content: string): Promise<void> {
  const args = content.slice(config.commandPrefix.length).trim().split(/ +/);
  const command = args.shift()?.toLowerCase();

  if (command === 'joke') {
    const topic = args.join(' ') || aiService.getRandomTopic();

    try {
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }
      const joke = await aiService.generateJoke(topic);
      await message.reply(`Here's a joke about ${topic}:\n\n${joke}`);
    } catch (error) {
      console.error('Error in joke command:', error);
      await message.reply('Oops! My joke circuits malfunctioned. Try again!');
    }
  } else if (command === 'convo' || command === 'conversation') {
    try {
      if ('sendTyping' in message.channel) {
        await message.channel.sendTyping();
      }
      const starter = await aiService.generateConversationStarter();
      if ('send' in message.channel) {
        await message.channel.send(starter);
      }
    } catch (error) {
      console.error('Error in conversation command:', error);
      await message.reply('Had trouble starting a conversation. Maybe try again?');
    }
  } else if (command === 'help') {
    const helpMessage = `
**🤖 AI Bot Commands**

\`${config.commandPrefix}joke [topic]\` - Get a joke about a topic (or random if no topic)
\`${config.commandPrefix}conversation\` - Start a conversation
\`${config.commandPrefix}help\` - Show this help message

**✨ Features:**
• I automatically post jokes and conversation starters on a schedule
• I'll engage when the channel is quiet for too long
• I can respond to messages naturally (with a ${Math.floor(config.responseChance * 100)}% chance)
• I keep your data private using local AI models

**📝 Available joke topics:**
${config.jokeTopics.join(', ')}
    `.trim();

    await message.reply(helpMessage);
  }
}

async function handleConversation(message: Message, content: string): Promise<void> {
  if (content.length < config.minMessageLength) {
    return;
  }

  if (!client.user) return;

  const mentionsBot = message.mentions.has(client.user);
  const shouldRespond = mentionsBot || Math.random() < config.responseChance;

  if (!shouldRespond) {
    return;
  }

  try {
    if ('sendTyping' in message.channel) {
      await message.channel.sendTyping();
    }
    const response = await aiService.generateResponse(content, message.channel.id);

    if (response) {
      await message.reply(response);
    }
  } catch (error) {
    console.error('Error in conversation:', error);
  }
}

process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down gracefully...');
  activityMonitor.stop();
  scheduler.stop();
  client.destroy();
  process.exit(0);
});

process.on('unhandledRejection', error => {
  console.error('Unhandled promise rejection:', error);
});

const token = process.env.DISCORD_TOKEN;
if (!token) {
  console.error('❌ DISCORD_TOKEN is not set in .env file');
  process.exit(1);
}

client.login(token);
