import { Client, TextChannel } from 'discord.js';
import config from './config.js';
import { AIService } from './ai.js';

export class ActivityMonitor {
  private client: Client;
  private aiService: AIService;
  private channelActivity: Map<string, number>;
  private monitorInterval: NodeJS.Timeout | null;

  constructor(client: Client, aiService: AIService) {
    this.client = client;
    this.aiService = aiService;
    this.channelActivity = new Map();
    this.monitorInterval = null;
  }

  start(): void {
    this.monitorInterval = setInterval(() => {
      this.checkInactiveChannels();
    }, config.checkActivityIntervalMinutes * 60 * 1000);

    console.log('Activity monitor started');
  }

  stop(): void {
    if (this.monitorInterval) {
      clearInterval(this.monitorInterval);
      this.monitorInterval = null;
    }
  }

  recordActivity(channelId: string): void {
    this.channelActivity.set(channelId, Date.now());
  }

  async checkInactiveChannels(): Promise<void> {
    const now = Date.now();
    const inactivityThreshold = config.inactivityThresholdMinutes * 60 * 1000;

    for (const [channelId, lastActivity] of this.channelActivity.entries()) {
      const timeSinceActivity = now - lastActivity;

      if (timeSinceActivity >= inactivityThreshold) {
        await this.engageChannel(channelId);
        this.recordActivity(channelId);
      }
    }
  }

  async engageChannel(channelId: string): Promise<void> {
    try {
      const channel = await this.client.channels.fetch(channelId);

      if (!channel || !channel.isTextBased()) {
        return;
      }

      if (config.allowedChannels.length > 0 && !config.allowedChannels.includes(channelId)) {
        return;
      }

      const shouldPostJoke = Math.random() > 0.5;

      if (shouldPostJoke) {
        const topic = this.aiService.getRandomTopic();
        const joke = await this.aiService.generateJoke(topic);
        await (channel as TextChannel).send(`💡 Random joke time! Here's one about ${topic}:\n\n${joke}`);
      } else {
        const conversationStarter = await this.aiService.generateConversationStarter();
        await (channel as TextChannel).send(`🤔 ${conversationStarter}`);
      }

      console.log(`Engaged inactive channel: ${'name' in channel ? channel.name : channel.id}`);
    } catch (error) {
      console.error(`Error engaging channel ${channelId}:`, error);
    }
  }

  isChannelAllowed(channelId: string): boolean {
    if (config.allowedChannels.length === 0) {
      return true;
    }
    return config.allowedChannels.includes(channelId);
  }
}
