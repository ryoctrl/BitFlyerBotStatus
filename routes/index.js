var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;
const BitFlyer = require('../bitflyer/api').BitFlyer;
const api = new BitFlyer();
const pm2 = require('pm2');
const targetName = process.env.BOT_PM2_NAME;

const fetchAPI = async (callback) => {
	let datas = {};
	datas.collateral = await api.getCollateral();
	datas.positions = await api.getPositions();
	let history = await api.getCollateralHistory();
	let today = new Date(Date.now());
	today = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 0, 0, 0);
	datas.history = [];
	let change = 0;
    if(Array.isArray(history)) {
        for(let hist of history) {
            let date = new Date(Date.UTC(hist.date.substring(0, 4), hist.date.substring(5, 7), hist.date.substring(8, 10), hist.date.substring(11, 13), hist.date.substring(14, 16), hist.date.substring(17, 19)));
            if(date.getTime() > today.getTime()) {	
                hist.date = date;
                change += hist.change;
                datas.history.push(hist);
            }
        }
    }
	datas.change = change;

    return new Promise((resolve, reject) => {
        pm2.describe(targetName, (err, desc) => {
            if(err) {
                reject(err);
                return;
            }

            if(desc.length === 0) {
                reject(new Error('target process was not found'));
                return;
            }

            datas.status = desc[0].pm2_env.status;
            resolve(datas);

        });
    });
}

const knex = require('knex')({
	dialect: 'sqlite3',
	connection: {
		filename: 'bfbotapi.db',
	},
	useNullAsDefault: true
});

router.get('/', async (req, res) => {
    const datas = await fetchAPI();
    res.render('index', datas);
});

router.post('/api/create', function(req, res, next) {
	console.log("getting post request");
	let signal = req.body.signal;
	let position = req.body.position;
	let price = req.body.price;
	console.log(signal + "," + position + "," + price);
	let transactionData = {
		side: signal,
		position: position,
		price: price
	};
	console.log("create transaction");
	knex('transactions').insert(transactionData).then({});
	console.log("transaction complete");
	res.json({"message": "create transaction completed"});
});
module.exports = router;
