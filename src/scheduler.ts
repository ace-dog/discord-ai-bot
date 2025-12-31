import cron, { ScheduledTask } from 'node-cron';
import { Client, ChannelType, TextChannel } from 'discord.js';
import config from './config.js';
import { AIService } from './ai.js';

export class Scheduler {
  private client: Client;
  private aiService: AIService;
  private jobs: ScheduledTask[];

  constructor(client: Client, aiService: AIService) {
    this.client = client;
    this.aiService = aiService;
    this.jobs = [];
  }

  start(): void {
    const jokeJob = cron.schedule(config.scheduledJokeCron, async () => {
      await this.postRandomJoke();
    });

    const conversationJob = cron.schedule(config.scheduledConversationCron, async () => {
      await this.postConversationStarter();
    });

    this.jobs.push(jokeJob, conversationJob);
    console.log('Scheduled jobs started');
    console.log(`- Random jokes: ${config.scheduledJokeCron}`);
    console.log(`- Conversation starters: ${config.scheduledConversationCron}`);
  }

  stop(): void {
    this.jobs.forEach(job => job.stop());
    this.jobs = [];
  }

  async postRandomJoke(): Promise<void> {
    const topic = this.aiService.getRandomTopic();
    const joke = await this.aiService.generateJoke(topic);
    await this.postToAllowedChannels(`🎭 Scheduled joke about ${topic}:\n\n${joke}`);
  }

  async postConversationStarter(): Promise<void> {
    const starter = await this.aiService.generateConversationStarter();
    await this.postToAllowedChannels(`💬 ${starter}`);
  }

  async postToAllowedChannels(message: string): Promise<void> {
    try {
      const channels = this.client.channels.cache.filter(channel => {
        if (!channel.isTextBased()) return false;

        if (config.allowedChannels.length === 0) {
          return channel.type === ChannelType.GuildText;
        }

        return config.allowedChannels.includes(channel.id);
      });

      for (const [, channel] of channels) {
        try {
          await (channel as TextChannel).send(message);
          console.log(`Posted scheduled message to: ${(channel as TextChannel).name}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.error(`Error posting to ${(channel as TextChannel).name}:`, errorMessage);
        }
      }
    } catch (error) {
      console.error('Error in scheduled posting:', error);
    }
  }
}
