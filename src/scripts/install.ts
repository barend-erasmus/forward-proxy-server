import * as fs from 'fs';
import * as yaml from 'js-yaml';
import * as readline from 'readline';

const readlineInterface: readline.ReadLine = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

export async function install(): Promise<void> {
    const forwardTo: string = await prompt('Forward To (127.0.0.1:8080): ');

    const hostname: string = await prompt('Hostname: (0.0.0.0): ');

    const log: string = await prompt('Log: (/var/log/forward-proxy-server) ');

    const mode: string = await prompt('Mode: (raw-raw) ');

    const port: string = await prompt('Port: (1337): ');

    readlineInterface.close();

    const configuration: any = {
        forwardTo: forwardTo || '127.0.0.1:8080',
        hostname: hostname || '0.0.0.0',
        log: log || '/var/log/forward-proxy-server',
        mode: mode || 'raw-raw',
        port: port ? parseInt(port, 10) : 1337,
    };

    const yamlConfig: string = yaml.safeDump(configuration);

    if (!fs.existsSync('/etc/forward-proxy-server')) {
        fs.mkdirSync('/etc/forward-proxy-server');
    }

    if (fs.existsSync('/etc/forward-proxy-server/config.yaml')) {
        fs.unlinkSync('/etc/forward-proxy-server/config.yaml');
    }

    fs.writeFileSync('/etc/forward-proxy-server/config.yaml', yamlConfig);

    writeServiceFile();
}

async function prompt(question: string): Promise<string> {
    return new Promise<string>((resolve: (answer: string) => void, reject: (error: Error) => void) => {
        readlineInterface.question(question, (answer: string) => {
            resolve(answer);
        });
    });
}

function writeServiceFile(): void {
    if (fs.existsSync('/lib/systemd/system/forward-proxy-server.service')) {
        fs.unlinkSync('/lib/systemd/system/forward-proxy-server.service');
    }

    fs.writeFileSync('/lib/systemd/system/forward-proxy-server.service', `
[Unit]
Description=Forward Proxy Server written in node.js
After=network.target

[Service]
Type=simple
ExecStart=/usr/bin/forward-proxy-server start --config /etc/forward-proxy-server/config.yaml
Restart=on-failure

[Install]
WantedBy=multi-user.target
`);
}
