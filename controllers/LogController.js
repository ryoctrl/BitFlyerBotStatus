const fs = require('fs');
const chokidar = require('chokidar');
const sc = require('./SocketController');
const bot = require('./BotStatus');
const moment = require('moment');
const cron = require('node-cron');
const diff = require('deep-diff');

const logFormat = 'YYYYMMDD';

let watcher = null;
let previousData = '';

const CHANNELS = {
    UPDATE_LOG: 'log.update'
};


const init = async () => {
    console.log('log controller initialize');
    const today = moment().format(logFormat);
    const logDir = await bot._getPm2Status().then(status => status.pm2_env.pm_cwd + '/logs/');
    const path = logDir + today + '.log';
    console.log(path);
    const watcher = chokidar.watch(path, {
        ignored: /(^|[\/\\])\../, // ignore dotfiles
        persistent: true
    });

    watcher.on('change', (path, stats) => {
        console.log('change detected!!');
        if(!previousData) {
            console.log('no previous data!!');
            fs.readFile(path, (err, data) => err ? null : previousData = data);
            return;
        }

        console.log('checking diff!');
        fs.readFile(path, (err, data) => {
            if(err) return;

            const lbl = moment().format('YYYYMMDDHHmmss');
            console.time(lbl);
            const differences = diff(previousData, data);
            const diffs = differences.map(d => String.fromCharCode(d.rhs)).reduce((str, c) => str + c, '');
            console.timeEnd(lbl);

            console.log(diffs);
            sc.emit(CHANNELS.UPDATE_LOG, diffs);
            previousData = data;
        });
    });

    cron.schedule('0 0 0 * * *', () => {
        const today = moment();
        const yesterday = today.add(-1, 'days');
        const yesterdayLogPath = logDir + yesterday.format(logFormat) + '.log';
        const todayLogPath = logDir + today.format(logFormat);
        watcher.add(todayLogPath);
        watcher.unwatch(yesterdayLogPath);
    });
};


module.exports = {
    init,

}
