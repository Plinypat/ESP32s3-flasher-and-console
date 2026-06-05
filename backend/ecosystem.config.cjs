module.exports = {
  apps: [{
    name: 'hive-backend',
    script: 'src/index.js',
    interpreter: 'node',
    interpreter_args: '--experimental-vm-modules',
    env: {
      NODE_ENV: 'production',
    },
    error_file: '/var/log/hive/error.log',
    out_file: '/var/log/hive/out.log',
    time: true,
    restart_delay: 3000,
    max_restarts: 10,
  }],
};
