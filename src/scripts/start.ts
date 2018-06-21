import { ForwardProxyServer } from '../forward-proxy-server';
import { IProxyServer } from '../interfaces/proxy-server';

export function start(
    forwardTo: string,
    hostname: string,
    log: string,
    mode: string,
    port: number,
) {
    const forwardToHostname: string = forwardTo.split(':')[0];
    const forwardToPort: number = parseInt(forwardTo.split(':')[1], 10);

    const proxyServer: IProxyServer = new ForwardProxyServer(
        forwardToHostname,
        forwardToPort,
        hostname,
        log,
        mode,
        port,
    );

    proxyServer.listen();
}
