export default interface DatabaseConnection {
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
  database: string;
}

export type StorageType = 'local' | 'gcloud';

export interface StorageProvider {
  name: StorageType;
  metadata: Object;
};

export interface DbTask {
  storageProviders: StorageProvider[];
  name: string;
  user: string;
  password: string;
  host: string;
  port: number;
  database?: string;
}