import Compress from '../compress/compress';
import * as fs from 'fs';
import * as os from 'os';
import DatabaseConnection from '../interfaces/database-credentials';
import Logger from '../log/logger';

export interface FileGenerateInfo {
  pathfile: string;
  filename: string;
  customPath?: string;
}

export interface FolderGenerateInfo {
  pathfolder: string
}

export interface IBackupGenerator {
  execute: () => Promise<FileGenerateInfo>
}

export default abstract class BackupGenerator implements IBackupGenerator {
  protected path: string = os.tmpdir();
  protected pathFolder: string = '';
  abstract generate(): Promise<FileGenerateInfo>

  constructor(protected readonly credentials: DatabaseConnection) {
    this.pathFolder = `${this.path}/${this.credentials.database}`;
  }

  public async execute(): Promise<FileGenerateInfo> {
    Logger.save(`Starting backup the "${this.credentials.name}" database.`, true);
    this.cleanRootPath();
    this.createFolder();
    const result = await this.generate();
    
    if (!result.filename.endsWith('.zip')) {
      const compressedResult = await this.compress(`${this.path}/${this.credentials.database}`, result.filename);
      
      return {
        ...compressedResult,
        customPath: this.credentials.database,
      };
    }

    return {
      ...result,
      customPath: this.credentials.database,
    };
  }

  private cleanRootPath(): void {
    fs.rmSync(this.pathFolder, { recursive: true, force: true });
  }

  protected async compress(pathfile: string, filename: string): Promise<FileGenerateInfo> {
    const file = fs.readFileSync(pathfile);
    const result = await Compress.compress(file, filename);

    if (result && result.compressed) {
      fs.writeFileSync(`${pathfile}.zip`, result.file);
      fs.unlinkSync(pathfile);
      Logger.save('File was compressed.');
    }

    return {
      filename: result.compressed ? `${filename}.zip` : filename,
      pathfile: result.compressed ? `${pathfile}.zip` : pathfile,
    };
  }

  protected generateBackupName(): string {
    const date = new Date();
    const formattedDate = date.toISOString().replace(/:/g, '-');
    return `${this.credentials.database}-${formattedDate}`;
  }

  protected createFolder(): void {
    if (!fs.existsSync(this.pathFolder)) {
      fs.mkdirSync(this.pathFolder, { recursive: true });
    }
  }
}