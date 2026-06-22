import * as fs from 'fs';

export default class FileSizeCalculator {
  public static getFormatSize(pathfile: string): string {
    try {
      const fileStats = fs.statSync(pathfile);
      const sizeInBytes = fileStats.size;
      if (sizeInBytes > 1024 * 1024) {
        return `${(sizeInBytes / (1024 * 1024)).toFixed(2)} MB`;
      } else {
        return `${(sizeInBytes / 1024).toFixed(2)} KB`;
      }
    } catch (e) {
      return 'unknown size';
    }
  }
}
