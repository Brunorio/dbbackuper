import path from 'path';
import { DbTask } from './interfaces/database-credentials';
import * as fs from 'fs';

export default class TaskData {

  static get(): DbTask[] {
    const options = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../tasks.json')).toString());

    return options;
  }
}