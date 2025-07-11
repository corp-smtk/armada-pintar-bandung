module.exports = {
  apps: [
    {
      name: 'gastrax-proxy',
      script: './zapin-proxy.cjs',
      cwd: __dirname,
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'development',
        PORT: 3001,
        HOST: '0.0.0.0'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3001,
        HOST: '0.0.0.0',
        FRONTEND_URL: 'https://gastrax.smarteksistem.com'
      },
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      error_file: './logs/gastrax-proxy-error.log',
      out_file: './logs/gastrax-proxy-out.log',
      log_file: './logs/gastrax-proxy-combined.log',
      time: true,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      restart_delay: 1000
    }
  ]
}; 