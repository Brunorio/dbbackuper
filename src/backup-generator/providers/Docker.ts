import { execSync } from 'child_process';
import BackupGenerator, { FileGenerateInfo } from '..';
import DatabaseConnection from '../../interfaces/database-credentials';
import Logger from '../../log/logger';

export default class DockerProviderBackupGenerator extends BackupGenerator {

  constructor(private readonly dockerfilePath: string, protected readonly credentials: DatabaseConnection) {
    super(credentials);
  }

  async generate(): Promise<FileGenerateInfo> {
    Logger.save('Init generator with DockerProviderBackupGenerator');
    let filename = `${this.generateBackupName()}.sql`;
    let pathfile = `${this.path}/${filename}`;
    
    execSync(`docker compose -f ${this.dockerfilePath} exec database bash -c "mysqldump -u'${this.credentials.user}' -p'${this.credentials.password}' -P ${this.credentials.port} -h ${this.credentials.host} ${this.credentials.database}" > ${pathfile}`);
    Logger.save('Finish generate');

    return { pathfile, filename };
  }
}