const express = require('express');
const router = express.Router();
const bot = require('../controllers/BotStatus');

const fetchAPI = async () => {
	let datas = {};
	datas.collateral = await bot.getCollateral();
	datas.positions = await bot.getPositions();
    const { history, change, error } = await bot.getTodayResults();
    datas.history = history;
    datas.change = change;
    datas.status = await bot.getHealth();
    return datas;
}

router.get('/', async (req, res) => {
    const datas = await fetchAPI();
    res.render('index', datas);
});

router.post('/api/create', function(req, res, next) {
	let signal = req.body.signal;
	let position = req.body.position;
	let price = req.body.price;
	let transactionData = {
		side: signal,
		position: position,
		price: price
	};
	res.json({"message": "create transaction completed"});
});
module.exports = router;
