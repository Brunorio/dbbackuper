import { Bucket, File, Storage } from '@google-cloud/storage';
import AStorage from '..';
import GCloudCredentials from '../../interfaces/gcloud-credentials';
import * as fs from 'fs';
import Logger from '../../log/logger';

export interface GCloudProviderStorageProps {
  bucketName: string;
  credentials: GCloudCredentials;
}

export default class GCloudProviderStorage extends AStorage {
  private readonly bucket: Bucket;

  constructor(private readonly props: GCloudProviderStorageProps) {
    super();
    const storage = new Storage({
      projectId: this.props.credentials.project_id,
      credentials: this.props.credentials,
    });
    this.bucket = storage.bucket(this.props.bucketName);
  }

  protected async save(temporaryPathFile: string, filename: string): Promise<void> {
    try {
      Logger.save('Init save in GCloudProviderStorage');
      const gFile = this.bucket.file(this.resolvePath(filename));
      const file = fs.readFileSync(temporaryPathFile);
      await gFile.save(file);
    } catch (error: any) {
      Logger.save(`Error saving file using GCloudProviderStorage: ${error.message}`);
    }
  }

  private async getFiles(): Promise<File[]> {
    const options: any = {};
    if (this.customPath) {
      options.prefix = `${this.customPath}/`;
    }
    return (await this.bucket.getFiles(options))[0];
  }

  protected async getQuantityFiles(): Promise<number> {
    const files = await this.getFiles();
    return files.length;
  }

  protected async delete(numberOfFiles: number): Promise<void> {
    const files = await this.getFiles();

    for (let index = 0; index < numberOfFiles && index < files.length; index++) {
      await files[index].delete();
    }
  }

  private resolvePath(filename: string): string {
    if (!this.customPath) return filename;
    return `${this.customPath}/${filename}`;
  }

  public async getLastSync(): Promise<string |  void> {
    const files = (await this.getFiles()).map(file => file.name);

    if (!files.length) return;

    const file = files[files.length - 1];
    const gFile = this.bucket.file(file);
    const [metadata] = await gFile.getMetadata();
    return new Date(metadata.updated!).toLocaleDateString('pt-br', {
      day: '2-digit',
      year: 'numeric',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  }
}