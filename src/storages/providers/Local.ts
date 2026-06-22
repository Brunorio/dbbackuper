import Storage from '..';
import * as fs from 'fs';
import Logger from '../../log/logger';

export interface LocalProviderStorageProps {
  rootpath: string;
}

export default class LocalProviderStorage extends Storage {
  constructor(private readonly props: LocalProviderStorageProps) {
    super();
  }

  protected async save(temporaryPathFile: string, filename: string): Promise<void> {
    try {
      Logger.save(`Init save in LocalProviderStorage | Filename: ${filename}`);
      await this.ensureFolderExists();
      await fs.promises.copyFile(temporaryPathFile, `${this.resolvePath()}/${filename}`);
    } catch (error: any) {
      Logger.save(`Error saving file using LocalProviderStorage: ${error.message}`);
    }
  }

  private getFileNames(): string[] {
    const files = fs.readdirSync(this.resolvePath());
    return files.filter(file => {
      return file !== '.keep'
    })
  }

  protected async getQuantityFiles(): Promise<number> {
    return this.getFileNames().length;
  }

  protected async delete(numberOfFiles: number): Promise<void> {
    const files = this.getFileNames();
    for (let index = 0; index < numberOfFiles && index < files.length; index++) {
      fs.unlinkSync(`${this.resolvePath()}/${files[index]}`);
    }
  }

  public async getLastSync(): Promise<string | void> {
    const files = this.getFileNames();

    if (!files.length) return;

    const stat = fs.statSync(`${this.resolvePath()}/${files[files.length - 1]}`);
    const date = new Date(stat.mtime);
    
    return date.toLocaleDateString('pt-br', {
      day: '2-digit',
      year: 'numeric',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }

  private resolvePath(): string {
    if (!this.customPath) return this.props.rootpath;
    return `${this.props.rootpath}/${this.customPath}`;
  }

  private async ensureFolderExists(): Promise<void> {
    const pathfile = this.resolvePath();
    if (!fs.existsSync(pathfile)) {
      fs.mkdirSync(pathfile, { recursive: true });
    }
  }
}