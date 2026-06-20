import Storage from './storages';
import LocalProviderStorage, { LocalProviderStorageProps } from './storages/providers/Local';
import GCloudProviderStorage, { GCloudProviderStorageProps } from './storages/providers/Gcloud';
import { DbTask, StorageType } from './interfaces/database-credentials';

export default class StorageOptionData {

  static get(type: StorageType, task: DbTask): Storage {
    switch (type) {
      case 'local': return new LocalProviderStorage(this.getMetadata(type, task) as LocalProviderStorageProps);
      case 'gcloud': return  new GCloudProviderStorage(this.getMetadata(type, task) as GCloudProviderStorageProps);
    }
  }

  private static getMetadata(storageType: StorageType, task: DbTask): Object {
    const provider = task.storageProviders.find(provider => provider.name === storageType)?.metadata;
    if (!provider) throw new Error(`Metadata not found for storage type ${storageType}`);

    return provider;
  }
}