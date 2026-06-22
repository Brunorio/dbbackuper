import * as fs from 'fs';

export default class Logger {
  private static maxFilesRows = 1000;

  static init(): void {
    const filePath = process.env.LOG_PATH;
    if (!filePath) throw new Error('pathfile to logs not exists. Use the LOG_PATH environment in your .env');

    const fileExists = fs.existsSync(filePath);

    if (!fileExists) {
        fs.writeFileSync(filePath, '');
        console.log(`File created at ${filePath}`);
        return;
    }

    const file = fs.readFileSync(filePath, 'utf-8');
    const rows = file.split('\n');
    if (rows.length > this.maxFilesRows) {
      const newRows = rows.slice(rows.length - this.maxFilesRows);
      fs.writeFileSync(filePath, newRows.join('\n'));
    }
  }

  static save(message: string, prefix?: boolean): void {
    const filePath = process.env.LOG_PATH!;
    const logMessage = `${this.getMesssageHeader()} - ${prefix ? '==== ' : ''}${message}\n`;
    console.log(logMessage)
    fs.writeFileSync(filePath, logMessage, { flag: 'a' });
  }

  private static getMesssageHeader(): string {
    return new Date().toLocaleDateString('pt-br', {
      timeZone: 'America/Sao_Paulo',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

}