import { execFile } from 'child_process';
import * as path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';

let valid_token: string = '';

export const evalOnGAS = async (func: Function, customToken?: string): Promise<any> => {
  const code = `(${func.toString()})()`;
  const token =
    customToken ||
    valid_token ||
    (valid_token = await promisify(readFile)(
      path.join(__dirname, '..', 'evalOnGAS-token')
    ).toString());
  const response = await promisify(execFile)('clasp', [
    'run',
    'evalOnGAS',
    '--params',
    JSON.stringify([code, token])
  ]);
  const text = response.stdout.replace(/.*\u001b\[1G/, '');
  try {
    const { res } = JSON.parse(text);
    return res;
  } catch {
    return text; // returns "No response."
  }
};
