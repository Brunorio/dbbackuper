import TelegramBotDbListener from './telegram-bot.listener';
import Logger from './log/logger';

export interface BackupStat {
  taskName: string;
  database?: string;
  files: { filename: string; size: string }[];
  providers: string[];
  success: boolean;
  error?: string;
}

export default class BackupReporter {
  private readonly botListener: TelegramBotDbListener;

  constructor() {
    this.botListener = new TelegramBotDbListener(false);
  }

  private escapeMarkdown(text: string): string {
    return text.replace(/[*_`[\]]/g, '\\$&');
  }

  public report(stats: BackupStat[], duration: string): void {
    let message = `📊 *Relatório de Backup*\n\n`;
    message += `📅 *Data:* ${new Date().toLocaleString('pt-BR')}\n`;
    message += `⏱️ *Tempo total:* ${duration}s\n\n`;

    const successes = stats.filter(s => s.success);
    const failures = stats.filter(s => !s.success);

    if (successes.length > 0) {
      message += `✅ *Sucessos:*\n`;
      for (const s of successes) {
        const taskName = this.escapeMarkdown(s.taskName);
        const database = s.database ? this.escapeMarkdown(s.database) : 'todos';
        message += `• *Tarefa:* ${taskName} (Banco: ${database})\n`;
        for (const file of s.files) {
          const filename = file.filename.replace(/`/g, '');
          message += `  📁 *Arquivo:* \`${filename}\` (${file.size})\n`;
        }
        message += `  🚀 *Destinos:* ${s.providers.join(', ')}\n\n`;
      }
    }

    if (failures.length > 0) {
      message += `❌ *Falhas:*\n`;
      for (const f of failures) {
        const taskName = this.escapeMarkdown(f.taskName);
        const database = f.database ? this.escapeMarkdown(f.database) : 'todos';
        const error = f.error ? this.escapeMarkdown(f.error) : 'Erro desconhecido';
        message += `• *Tarefa:* ${taskName} (Banco: ${database})\n`;
        message += `  ⚠️ *Erro:* ${error}\n\n`;
      }
    }

    try {
      this.botListener.sendMessage(message, { parse_mode: 'Markdown' });
    } catch (error) {
      Logger.save(`Error sending telegram message: ${error}`);
    }
  }
}
