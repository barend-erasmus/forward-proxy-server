# Forward Proxy Server

## Installation

`npm install -g forward-proxy-server`

`forward-proxy-server install`

`sudo systemctl daemon-reload`

`sudo systemctl enable forward-proxy-server`

`sudo systemctl start forward-proxy-server`

## Running

`forward-proxy-server start --hostname 0.0.0.0 --log ./ --port 1337`

`forward-proxy-server start --config my-config.yaml`

**Example**

```yaml
---
hostname: 0.0.0.0
log: D:/temp
port: 1080
```
