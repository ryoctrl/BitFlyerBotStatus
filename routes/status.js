const express = require('express');
const router = express.Router();

const dbOption = {
	dialect: 'sqlite3',
	connection: {
		filename: 'bfbotapi.db',
	},
	useNullAsDefault: true
};
const knex = require('knex')(dbOption);

router.get('/', (req, res, next) => {
	res.json({'message': 'status page'});
});

module.exports = router;
