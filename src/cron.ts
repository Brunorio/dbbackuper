
import { DbTask } from './interfaces/database-credentials';
import dotenv from 'dotenv';
import TaskData from './task.data';
import Logger from './log/logger';
import MydumperProviderBackupGenerator from './backup-generator/providers/Mydumper';
import { performance } from 'perf_hooks';
import StorageOptionData from './storage.option.data';
import ConnectionResolver from './connection-resolver';
import { FileGenerateInfo } from './backup-generator';

dotenv.config();
const tasks = TaskData.get();

const execute = async () => {
  const startedAt = performance.now();
  Logger.save('Starting backup process', true);
  await Promise.all(tasks.map(async (task: DbTask) => {
    try {
      const connections = await ConnectionResolver.resolve(task);
      const results: FileGenerateInfo[] = [];
      await Promise.all(connections.map(async (connection) => {
        const generator =  new MydumperProviderBackupGenerator(connection);
        if (!generator) throw new Error(`"${process.env.GENERATOR_MODE}" generator is not implemented yet.`);
        const result = await generator.execute();
        results.push(result);
      }));

      for (const provider of task.storageProviders) {
        const storage = StorageOptionData.get(provider.name, task);
        if (!storage) throw new Error(`"${provider.name}" is not implemented yet.`);
        for (const result of results) {
          await storage
            .setCustomPath(result.customPath || '')
            .process(result.pathfile, result.filename);
        }
      }
    } catch (error) {
      Logger.save(`Error generating backup: ${error}`);
    }
  }));
  const endedAt = performance.now();
  Logger.save(`Backup process finished in ${((endedAt - startedAt) / 1000).toFixed(2)} seconds.\n\n`, true);
}

const cron = (hours: number) => {
  execute();
  setInterval(execute, hours * 60 * 60 * 1000);
}


const runner = (attempt = 1) => {
  if (attempt > 3) {
    Logger.save('Failed to start the cron job after 3 attempts.');
    return;
  }

  try {
    cron(Number(process.env.FREQUENCY_IN_HOURS));
  } catch (error) {
    runner(attempt + 1);
  }
}

runner();