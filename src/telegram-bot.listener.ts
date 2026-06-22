import TelegramBot from 'node-telegram-bot-api';
import TaskData from './task.data';
import StorageOptionData from './storage.option.data';
import Logger from './log/logger';
import { StorageType } from './interfaces/database-credentials';

const iconeModeType: Record<StorageType, string> = {
  'local': '📍',
  'gcloud': '☁️',
}

export default class TelegramBotDbListener {
  private readonly bot?: TelegramBot = undefined;

  constructor(polling = false) {
    if (process.env.TELEGRAM_BOT_TOKEN && process.env.TELEGRAM_CHAT_ID) {
      this.bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN!, { polling });
      if (this.bot) {
        Logger.save('Telegram bot initialized');
      }
    }
  }

  public listen(): void {
    if (!this.bot) return;

    this.bot.on('channel_post', async (msg) => {
      const chatId = msg.chat.id;
      if (chatId === Number(process.env.TELEGRAM_CHAT_ID) && msg.text?.toLowerCase().search('status') !== -1) {
        let messages = [];

        for (const task of TaskData.get()) {
          let message = '';
          message += `📦 Banco ${(task.database || 'todos').toUpperCase()}\n`;
          for (const provider of task.storageProviders) {
            const data = await StorageOptionData.get(provider.name as StorageType, task).info();
            message += `${iconeModeType[provider.name]} ${provider.name.toUpperCase()}  \n📁  ${data.quantity}\n🔄  ${data.last_sync} ✅\n\n`;
          }
          messages.push(message);
        }
      
        this.sendMessage(messages.join('·······················\n\n'));
      }
    });
  }

  public sendMessage(message: string, options?: any): void {
    if (this.bot) {
      console.log(message);
      this.bot.sendMessage(process.env.TELEGRAM_CHAT_ID!, message, options);
    }
  }
} 