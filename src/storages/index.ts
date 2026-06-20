export interface IStorage {
  process: (temporaryPathFile: string, filename: string) => Promise<void>
}

export interface StorageInfo {
  quantity: number;
  last_sync: string;
}

export default abstract class Storage implements IStorage {
  protected customPath: string = '';
  protected abstract save(temporaryPathFile: string, filename: string): Promise<void>;
  protected abstract delete(numberOfFiles: number): Promise<void>;
  protected abstract getQuantityFiles(): Promise<number>;
  protected abstract getLastSync(): Promise<string | void>;

  async process(temporaryPathFile: string, filename: string): Promise<void> {
    await this.save(temporaryPathFile, filename);
    await this.autoClean();
  };
  
  private async autoClean(): Promise<void> {
    if (await this.getQuantityFiles() > Number(process.env.MAX_FILES)) {
      await this.delete(Number(process.env.FILES_TO_DELETE))
    }
  }

  public async info(): Promise<StorageInfo> {
    return {
      quantity: await this.getQuantityFiles(),
      last_sync: await this.getLastSync() || 'Nenhum backup',
    }
  };

  public setCustomPath(customPath: string): this {
    this.customPath = customPath;
    return this;
  }
}