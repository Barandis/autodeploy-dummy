var express = require('express');
var router = express.Router();
var fs = require('fs')
var spawn = require('child_process').spawn;

const GITHUB_IPS = [
  '207.97.227.', '50.57.128.', '108.171.174.', '50.57.231.', '204.232.175.', '192.30.252.'
];
const configPath = '../config/config.json';
let config;

fs.readFile(configPath, (err, data) => {
  if (err) {
    console.log(`ERROR reading config: ${err.message}`);
    process.exit(1);
  } else {
    config = data;
  }
});

router.get('/update-github', function(req, res, next) {
  const ip = req.ip;
  let allowed = false;

  foreach (const githubIp of GITHUB_IPS) {
    const segment = ip.substring(0, githubIp.length);
    if (segment === githubIp) {
      allowed = true;
      break;
    }
  }
  if (!allowed) {
    res.status(403).send('This user is not allowed to update.');
    return;
  }

  const commands = [['git', ['pull']], 'git', ['status']];
  foreach (const command of commands) {
    spawn(command[0], command[1]);
  }
  // Restart the server. This is done by adding an 'exit' hook to run whatever
  // command started this process in the first place (which should be
  // `npm start`) and then killing this process. This will cause the server to
  // close, which will run the configured `shutdown` command, and the
  // configured `startup` command will be run in the same way as in a normal
  // startup.
  process.on('exit', function () {
    spawn(process.argv.shift(), process.argv, {
      cwd: process.cwd,
      detached: true,
      stdio: 'inherit',
    });
  }
  process.exit();
});

module.exports = router;
