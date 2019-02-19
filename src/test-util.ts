import { execFile } from 'child_process';
import * as path from 'path';
import { readFile } from 'fs';
import { promisify } from 'util';
import * as assert from 'assert';

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
    const { res, err } = JSON.parse(text);
    if (err) {
      throw Object.assign(new Error(err.message), { name: `GAS.${err.name}` });
    } else {
      return res;
    }
  } catch (err) {
    if (err.name.startsWith('GAS.')) {
      // error on GAS
      throw err;
    } else {
      // error in JSON.parse
      // usually when trying to parse "No response."
      assert(text === 'No response.\n');
      return;
    }
  }
};
