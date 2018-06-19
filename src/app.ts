import * as commander from 'commander';
import * as fs from 'fs';
import * as yaml from 'js-yaml';
import { install } from './scripts/install';
import { start } from './scripts/start';

commander
    .command('install')
    .action((command: any) => {
        install();
    });

commander
    .command('start')
    .option('-c --config <config>', 'Config')
    .option('-f --forwardTo <forwardTo>', 'Forward To')
    .option('-h --hostname <hostname>', 'Hostname')
    .option('-l --log <log>', 'Log')
    .option('-m --mode <mode>', 'Mode')
    .option('-p --port <port>', 'Port')
    .action((command: any) => {
        if (command.config) {
            const yamlContents: string = fs.readFileSync(command.config, 'utf8');

            const yamlConfig: any = yaml.safeLoad(yamlContents);

            start(
                yamlConfig.forwardTo,
                yamlConfig.hostname,
                yamlConfig.log,
                yamlConfig.mode,
                yamlConfig.port ? yamlConfig.port : null,
            );
        } else {
            start(
                command.forwardTo,
                command.hostname,
                command.log,
                command.mode,
                command.port ? parseInt(command.port, 10) : null,
            );
        }
    });

commander.parse(process.argv);
