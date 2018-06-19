import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as tls from 'tls';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

export function start(
    forwardTo: string,
    hostname: string,
    log: string,
    mode: string,
    port: number,
) {
    if (log) {
        winston.add(winston.transports.DailyRotateFile, {
            datePattern: 'YYYY-MM-DD-HH',
            filename: path.join(log, 'forward-proxy-server-%DATE%.log'),
            json: true,
            maxFiles: '30d',
            maxSize: '20m',
        });

        // winston.remove(winston.transports.Console);
    }

    const forwardToHostname: string = forwardTo.split(':')[0];
    const forwardToPort: number = parseInt(forwardTo.split(':')[1], 10);

    switch (mode) {
        case 'raw-tls':
            rawToTLS(forwardToHostname, forwardToPort, hostname, port);
            break;
        case 'tls-raw':
            tlsToRaw(forwardToHostname, forwardToPort, hostname, port);
            break;
    }
}

function rawToTLS(forwardToHostname: string, forwardToPort: number, hostname: string, port: number): void {
    const socketOutput: tls.TLSSocket = new tls.TLSSocket(new net.Socket(), {
        secureContext: tls.createSecureContext({

        }),
    });

    socketOutput.connect(forwardToPort, forwardToHostname, () => { });

    const serverInput: net.Server = net.createServer((socketInput: net.Socket) =>
        onConnection(
            socketInput,
            socketOutput,
        ));

    hostname = hostname ? hostname : '0.0.0.0';
    port = port ? port : 1337;

    serverInput.listen(port, hostname, () => {
        winston.info(`Listening on ${hostname}:${port}`);
    });
}

function tlsToRaw(forwardToHostname: string, forwardToPort: number, hostname: string, port: number): void {
    const socketOutput = new net.Socket();

    socketOutput.connect(forwardToPort, forwardToHostname, () => { });

    const serverInput: tls.Server = tls.createServer({
        cert: fs.readFileSync('server-cert.pem'),
        key: fs.readFileSync('server-key.pem'),
        rejectUnauthorized: true,
    }, (socketInput: net.Socket) =>
            onConnection(
                socketInput,
                socketOutput,
            ));

    hostname = hostname ? hostname : '0.0.0.0';
    port = port ? port : 1337;

    serverInput.listen(port, hostname, () => {
        winston.info(`Listening on ${hostname}:${port}`);
    });
}

function onConnection(
    socketInput: net.Socket | tls.TLSSocket,
    socketOutput: net.Socket | tls.TLSSocket,
): void {
    socketInput.on('data', (data: Buffer) => {
        socketOutput.write(data);
    });

    socketOutput.on('data', (data: Buffer) => {
        socketInput.write(data);
    });
}