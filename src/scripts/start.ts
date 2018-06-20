import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as tls from 'tls';
import * as winston from 'winston';
import 'winston-daily-rotate-file';
import { Connection } from '../connection';

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
        case 'raw-raw':
        case 'raw-tls':
            rawServer(forwardToHostname, forwardToPort, hostname, mode, port);
            break;
        case 'tls-raw':
        case 'tls-tls':
            tlsServer(forwardToHostname, forwardToPort, hostname, mode, port);
            break;
    }
}

function rawServer(forwardToHostname: string, forwardToPort: number, hostname: string, mode: string, port: number): void {
    const server: net.Server = net.createServer((socket: net.Socket) => {
        const connection: Connection = new Connection(socket, forwardToHostname, forwardToPort, mode);
    });

    hostname = hostname ? hostname : '0.0.0.0';
    port = port ? port : 1337;

    server.listen(port, hostname, () => {
        winston.info(`Listening on ${hostname}:${port}`);
    });
}

function tlsServer(forwardToHostname: string, forwardToPort: number, hostname: string, mode: string, port: number): void {
    const server: tls.Server = tls.createServer({
        cert: fs.readFileSync(path.join(__dirname, '..', '..', 'certificate.pem')),
        key: fs.readFileSync(path.join(__dirname, '..', '..', 'key.pem')),
        rejectUnauthorized: false,
    }, (socket: net.Socket) => {
        const connection: Connection = new Connection(socket, forwardToHostname, forwardToPort, mode);
    });

    hostname = hostname ? hostname : '0.0.0.0';
    port = port ? port : 1337;

    server.listen(port, hostname, () => {
        winston.info(`Listening on ${hostname}:${port}`);
    });
}
