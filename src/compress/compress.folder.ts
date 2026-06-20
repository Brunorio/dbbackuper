import * as fs from 'fs';
import * as path from 'path';
import archiver from 'archiver';
import unzipper from 'unzipper';

export interface CompressOutput {
  compressed: boolean
  file: Buffer
}

export default class CompressFolder {
  static async compress(path: string, foldername: string): Promise<CompressOutput> {
    return await (new Promise((resolve, reject) => {
      const output = fs.createWriteStream(`${path}/${foldername}.zip`);
      const archive = archiver('zip', { zlib: { level: 9 } });
      const outputBuffers: Buffer[] = [];

      archive.on('data', (chunk: Buffer) => outputBuffers.push(chunk));
      archive.on('error', (err: Error) => { reject(err); });
      output.on('close', () => {
        resolve({
          compressed: true,
          file: fs.readFileSync(`${path}/${foldername}.zip`),
        });
      });

      archive.pipe(output);
      archive.directory(`${path}/${foldername}`, false);
      void archive.finalize();
    }));
  }

  static async decompress(file: Buffer): Promise<Buffer> {
    if (!this.isZip(file)) {
      return file;
    }
    const result = await unzipper.Open.buffer(file);
    return await result.files[0].buffer();
  }

  private static isZip(buffer: Buffer): boolean {
    if (!Buffer.isBuffer(buffer) || buffer.length < 4) {
      return false;
    }
    return buffer[0] === 0x50 && buffer[1] === 0x4B && buffer[2] === 0x03 && buffer[3] === 0x04;
  }
}
