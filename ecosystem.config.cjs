module.exports = {
  apps: [
    {
      name: 'study-search-api',
      script: './apps/api/dist/server.js',
      instances: 'max',
      exec_mode: 'cluster',
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 4000
      }
    },
    {
      name: 'study-search-worker',
      script: './apps/worker/dist/index.js',
      instances: 1,
      exec_mode: 'fork',
      watch: false,
      max_memory_restart: '800M',
      env: {
        NODE_ENV: 'production'
      }
    }
  ]
};
