const pty = require('node-pty');

const shell = pty.spawn('sh', [], {
  name: 'xterm-color',
  cols: 80,
  rows: 30,
  cwd: process.env.HOME,
  env: process.env
});

shell.on('data', (data) => {
  console.log(data);
});

shell.write('ls\r');
shell.write('exit\r');
