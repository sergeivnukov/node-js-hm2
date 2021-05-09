const yargs = require('yargs');
const express = require('express');

const PORT = 3000;

const argv = yargs
  .help('help')
  .alias('help', 'h')
  .version('1.0.0')
  .alias('version', 'v')
  .usage('Usage: node $0 [options]')
  .example('node $0 -e [path]')
  .option('interval', {
    alias: 'i',
    describe: 'Set interval between date display (ms)',
    default: 1000
  })
  .option('period', {
    alias: 'p',
    describe: 'Set the duration of the script (ms)',
    default: 10000
  })
  .epilog('application')
  .argv;

const options = {
  interval: argv.interval,
  period: argv.period
};

const getEndTime = (period) => {
  const now = new Date();

  return new Date(now.getTime() + period);
};

const app = express();

let connections = [];

app.get('/', (req, res, next) => {
  res.setHeader('Content-Type', 'text/html');
  res.setHeader('Transfer-Encoding', 'chunked');
  connections.push({ res: res, endTime: getEndTime(options.period) });
});

setTimeout(function run () {
  const now = new Date();
  const nowTime = now.getTime();
  const nowUTC = now.toISOString();

  console.log(`Server time: ${nowUTC}, connections: ${connections.length}`);

  // end expired connections
  connections.filter(connection => connection.endTime <= nowTime).forEach(connection => {
    connection.res.write(`Server time (UTC): ${nowUTC} (connection closed)\n`);
    connection.res.end();
  });
  // delete expired connections from array
  connections = connections.filter(connection => connection.endTime > nowTime);

  // send response to all actual connections
  connections.forEach((connection) => {
    connection.res.write(`Server time (UTC): ${nowUTC}\n`);
  });
  setTimeout(run, options.interval);
}, options.interval);

app.listen(PORT, () => {
  console.log(`Server is running on port: ${PORT}\n`);
});
