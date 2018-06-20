import * as fs from 'fs';
import * as net from 'net';
import * as tls from 'tls';
import * as winston from 'winston';

export class Connection {

    protected clientAddress: string = null;

    protected clientPort: number = null;

    protected destinationSocket: net.Socket | tls.TLSSocket = null;

    constructor(
        protected clientSocket: net.Socket | tls.TLSSocket,
        protected forwardToHostname: string,
        protected forwardToPort: number,
        protected mode: string,
    ) {
        winston.info(`Client connected`, {
            clientAddress: this.clientAddress,
            clientPort: this.clientPort,
        });

        this.clientSocket.on('close', () => {
            winston.info(`Client disconnected`, {
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
            });

            this.close();
        });

        this.clientSocket.on('error', (error: Error) => {
            winston.info(`Client failed`, {
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
                error,
            });

            this.close();
        });

        this.connectToDestination();
    }

    protected close(): void {
        if (this.clientSocket) {
            this.clientSocket.destroy();
            this.clientSocket = null;
        }

        if (this.destinationSocket) {
            this.destinationSocket.destroy();
            this.destinationSocket = null;
        }
    }

    protected connectToDestination(): void {
        switch (this.mode) {
            case 'raw-raw':
            case 'tls-raw':
                this.connectToDestinationRaw();
                break;
            case 'tls-tls':
            case 'raw-tls':
                this.connectToDestinationTLS();
                break;
        }
    }

    protected connectToDestinationRaw(): void {
        this.destinationSocket = net.connect(this.forwardToPort, this.forwardToHostname, (error: Error) => {
            this.onDestinationConnection(error);
        });
    }

    protected connectToDestinationTLS(): void {
        this.destinationSocket = tls.connect(this.forwardToPort, {
            host: this.forwardToHostname,
            passphrase: 'password',
            pfx: fs.readFileSync('example.pfx'),
            rejectUnauthorized: false,
        }, () => {
            this.onDestinationConnection(null);
        });
    }

    protected onDestinationConnection(connectionError: Error): void {
        if (connectionError) {
            winston.error(`Destination failed to connect`, {
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
                destinationAddress: this.forwardToHostname,
                destinationPort: this.forwardToPort,
                error: connectionError,
            });

            this.close();

            return;
        }

        winston.info(`Destination connected`, {
            clientAddress: this.clientAddress,
            clientPort: this.clientPort,
            destinationAddress: this.forwardToHostname,
            destinationPort: this.forwardToPort,
        });

        this.destinationSocket.on('close', () => {
            winston.info(`Destination disconnected`, {
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
                destinationAddress: this.forwardToHostname,
                destinationPort: this.forwardToPort,
            });

            this.close();
        });

        this.clientSocket.on('data', (data: Buffer) => {
            winston.info(`Client sending data`, {
                bytes: data.length,
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
            });

            this.destinationSocket.write(data);
        });

        this.destinationSocket.on('data', (data: Buffer) => {
            winston.info(`Client receiving data`, {
                bytes: data.length,
                clientAddress: this.destinationSocket.remoteAddress,
                clientPort: this.destinationSocket.remotePort,
            });

            this.clientSocket.write(data);
        });

        this.destinationSocket.on('error', (error: Error) => {
            winston.info(`Destination failed`, {
                clientAddress: this.clientAddress,
                clientPort: this.clientPort,
                destinationAddress: this.forwardToHostname,
                destinationPort: this.forwardToPort,
                error,
            });

            this.close();
        });
    }

}
