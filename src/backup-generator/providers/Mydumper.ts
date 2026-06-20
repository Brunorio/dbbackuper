import { execSync } from 'child_process';
import BackupGenerator, { FileGenerateInfo } from '..';
import CompressFolder from '../../compress/compress.folder';

export default class MydumperProviderBackupGenerator extends BackupGenerator {

  async generate(): Promise<FileGenerateInfo> {
    const filename = this.generateBackupName();
    const pathfolder = `${this.pathFolder}/${filename}`;

    execSync(`mydumper --host ${this.credentials.host} --user ${this.credentials.user} --password '${this.credentials.password}' --port ${this.credentials.port} --database ${this.credentials.database} --outputdir ${pathfolder} --compress --triggers --events --routines --verbose 3`);

    await CompressFolder.compress(this.pathFolder, filename);
  
    return { pathfile: `${pathfolder}.zip`, filename: `${filename}.zip` };
  }
}