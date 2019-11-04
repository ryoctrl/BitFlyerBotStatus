const pm2 = require('pm2');
const moment = require('moment');
moment.locale('ja');
const BitFlyer = require('../api/bitflyer');
const fs = require('fs');

const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;
const BOT_PM2_NAME = process.env.BOT_PM2_NAME;

class BotStatus {
    constructor(API_KEY, API_SECRET) {
        this.api = new BitFlyer(API_KEY, API_SECRET);
        this.botName = BOT_PM2_NAME;
    }

    _getPm2Status() {
        return new Promise((resolve, reject) => {
            pm2.describe(BOT_PM2_NAME, (err, desc) => {
                if(err) {
                    reject(err);
                    return;
                }

                if(desc.length === 0) {
                    reject(new Error('bot process was not found'));
                    return;
                }
        
                resolve(desc[0]);
            });
        });
    }

    async getHealth() {
        const status = await this._getPm2Status().catch(err => err);
        if(status instanceof Error) {
            return status.toString();
        }

        return status.pm2_env.status;
    }

    getCollateral() {
        return this.api.getCollateral();
    }

    getPositions() {
        return this.api.getPositions();
    }

    async getTodayResults() {
        const results = {
            history: [],
            change: 0
        };

        const historyProcess = data => {
            data.date = moment(data.date + 'Z').toDate();
            results.change += data.change;
            results.history.push(data);
        };
        const history = await this.api.getCollateralHistory();
        const today = moment().hour(0).minute(0).seconds(0);
        if(Array.isArray(history)) {
            history.filter(data => moment(data.date + 'Z') > today)
                    .map(historyProcess);
        } else {
            results.error = history;
        }
        return results;
    }

    async getLogs() {
        const today = moment().format('YYYYMMDD');
        const pm2Status = await this._getPm2Status();
        const path = pm2Status.pm2_env.pm_cwd + '/logs/' + today + '.log';
        try {
            fs.statSync(path);
            const logs = fs.readFileSync(path).toString().split('\n').slice(-51).slice(0, 50).reverse();
            return logs;
        } catch(e) {
            return ['Log file not found'];
        }
    }

    async getSettings() {
        const pm2Status = await this._getPm2Status();
        console.log(pm2Status.pm2_env.pm_cwd);
        const path = pm2Status.pm2_env.pm_cwd + '/bot/vixrsi/vixrsi_config.js';
        const settings = require(path);
        const traderSettings = settings.trader;
        const settingsObj = {
            lot: traderSettings.amount,
            leverage: traderSettings.leverage,
            candleSize: traderSettings.candleSize
        };
        return settingsObj;
    }
}

module.exports = new BotStatus(API_KEY, API_SECRET);
