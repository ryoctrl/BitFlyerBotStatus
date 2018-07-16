var express = require('express');
var router = express.Router();
const exec = require('child_process').exec;
const BitFlyer = require('../bitflyer/api').BitFlyer;
const api = new BitFlyer();


const fetchAPI = async (callback) => {
	let datas = {};
	datas.collateral = await api.getCollateral();
	datas.positions = await api.getPositions();
	let history = await api.getCollateralHistory();
	let today = new Date(Date.now());
	today = new Date(today.getFullYear(), today.getMonth() + 1, today.getDate(), 0, 0, 0);
	datas.history = [];
	let change = 0;
	for(let hist of history) {
		let date = new Date(Date.UTC(hist.date.substring(0, 4), hist.date.substring(5, 7), hist.date.substring(8, 10), hist.date.substring(11, 13), hist.date.substring(14, 16), hist.date.substring(17, 19)));
		if(date.getTime() > today.getTime()) {	
			hist.date = date;
			change += hist.change;
			datas.history.push(hist);
		}
	}
	datas.change = change;
	exec('ps -x | grep node', (err, stdout, stderr) => {
		if(err) {
			datas.status = "exec error";
		} else {
			let status = stdout.indexOf('trade') != -1? 'running' : 'stop';
			datas.status = status;
		}
		callback(datas);
	});
}

const knex = require('knex')({
	dialect: 'sqlite3',
	connection: {
		filename: 'bfbotapi.db',
	},
	useNullAsDefault: true
});

/* GET home page. */
router.get('/', function(req, res, next) {
	fetchAPI((datas) => {
		res.render('index', datas);
		res.end();
	});
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
