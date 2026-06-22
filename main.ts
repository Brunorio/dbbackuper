import Logger from './src/log/logger';
import dotenv from 'dotenv';
import { Worker } from 'worker_threads';
import path from 'path';
import TelegramBotDbListener from './src/telegram-bot.listener';

dotenv.config();
Logger.init();

Logger.save('API Application is running.');

new Worker(path.resolve(__dirname, './src/cron'));
new TelegramBotDbListener(true).listen();
