import { execSync } from 'child_process';
import BackupGenerator, { FileGenerateInfo } from '..';

export default class MysqlProviderBackupGenerator extends BackupGenerator {

  async generate(): Promise<FileGenerateInfo> {
    const filename = this.generateBackupName();
    const pathfile = `${this.path}/${filename}.sql`;

    execSync(`mysqldump -u'${this.credentials.user}' -p'${this.credentials.password}' -P ${this.credentials.port} -h ${this.credentials.host} ${this.credentials.database} > ${pathfile}`);
  
    return { pathfile, filename };
  }
}