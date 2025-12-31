import { Ollama } from 'ollama';
import config from './config.js';

const ollama = new Ollama({ host: config.ollamaHost });

interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

export class AIService {
  private conversationHistory: Map<string, ConversationMessage[]>;
  private maxHistoryLength: number;

  constructor() {
    this.conversationHistory = new Map();
    this.maxHistoryLength = 10;
  }

  async generateJoke(topic: string): Promise<string> {
    const prompt = `Tell me a funny, clean joke about ${topic}. Keep it short and entertaining. Just give me the joke, no extra commentary.`;

    try {
      const response = await ollama.generate({
        model: config.ollamaModel,
        prompt: prompt,
        stream: false
      });

      return response.response.trim();
    } catch (error) {
      console.error('Error generating joke:', error);
      return `I tried to come up with a joke about ${topic}, but my humor circuits are temporarily offline! 🤖`;
    }
  }

  async generateConversationStarter(): Promise<string> {
    const prompt = `Generate a fun, engaging question or conversation starter for a Discord community.
    It should be interesting, light-hearted, and encourage people to share their thoughts.
    Keep it to one question or statement. No extra commentary.`;

    try {
      const response = await ollama.generate({
        model: config.ollamaModel,
        prompt: prompt,
        stream: false
      });

      return response.response.trim();
    } catch (error) {
      console.error('Error generating conversation starter:', error);
      const randomStarter = config.conversationStarters[
        Math.floor(Math.random() * config.conversationStarters.length)
      ];
      return randomStarter.replace('{topic}', this.getRandomTopic());
    }
  }

  async generateResponse(message: string, channelId: string): Promise<string | null> {
    const history = this.getChannelHistory(channelId);
    history.push({ role: 'user', content: message });

    const conversationContext = history
      .slice(-5)
      .map(msg => `${msg.role}: ${msg.content}`)
      .join('\n');

    const prompt = `You are a friendly, humorous Discord bot. Continue this conversation naturally.
Be engaging, witty, and helpful. Keep responses concise (1-3 sentences).

Conversation:
${conversationContext}

Your response:`;

    try {
      const response = await ollama.generate({
        model: config.ollamaModel,
        prompt: prompt,
        stream: false
      });

      const botResponse = response.response.trim();
      history.push({ role: 'assistant', content: botResponse });

      this.updateChannelHistory(channelId, history);

      return botResponse;
    } catch (error) {
      console.error('Error generating response:', error);
      return null;
    }
  }

  getChannelHistory(channelId: string): ConversationMessage[] {
    if (!this.conversationHistory.has(channelId)) {
      this.conversationHistory.set(channelId, []);
    }
    return [...this.conversationHistory.get(channelId)!];
  }

  updateChannelHistory(channelId: string, history: ConversationMessage[]): void {
    if (history.length > this.maxHistoryLength) {
      history = history.slice(-this.maxHistoryLength);
    }
    this.conversationHistory.set(channelId, history);
  }

  getRandomTopic(): string {
    return config.jokeTopics[Math.floor(Math.random() * config.jokeTopics.length)];
  }

  clearChannelHistory(channelId: string): void {
    this.conversationHistory.delete(channelId);
  }
}
