const { execFile } = require('child_process');
const { promisify } = require('util');

export const execOnGAS = async (func: Function): Promise<any> => {
  const code = `(${func.toString()})()`;
  const response = await promisify(execFile)('clasp', [
    'run',
    'evalOnGAS',
    '--params',
    JSON.stringify(code)
  ]);
  const { res } = JSON.parse(response.stdout.replace(/.*\u001b\[1G/, ''));
  return res;
};
