# Forward Proxy Server

## Installation

`npm install -g forward-proxy-server`

`forward-proxy-server install`

`sudo systemctl daemon-reload`

`sudo systemctl enable forward-proxy-server`

`sudo systemctl start forward-proxy-server`

## Running

`forward-proxy-server start --forwardTo 127.0.0.1:1337  --hostname 0.0.0.0 --log ./ --mode raw-tls --port 1337`

`forward-proxy-server start --config my-config.yaml`

**Example**

```yaml
---
forwardTo: 127.0.0.1:1337
hostname: 0.0.0.0
log: D:/temp
mode: raw-raw | raw-tls | tls-tls | tls-raw
port: 1080
```
