// ecosystem.config.js
module.exports = {
    apps: [
        {
            name: 'frequency-ecom-template-4',
            script: 'yarn',
            args: 'start',
            exec_mode: 'fork',
            instances: 3, // Increase if you want multiple instances (for better CPU usage)
            time: true,
            env: {
                NODE_ENV: 'production',
            },
        },
    ],
};