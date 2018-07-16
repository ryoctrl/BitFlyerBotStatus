const BitFlyer = require('./api').BitFlyer;

let api = new BitFlyer();

const run = async () => {
	console.log("資産残高取得テスト");
	let balances = await api.getBalances();
	console.log(balances);

	console.log('証拠金状態取得テスト');
	let collateral = await api.getCollateral();
	console.log(collateral);

	console.log('証拠金変動履歴取得テスト');
	let collateralHistory = await api.getCollateralHistory();
	console.log(collateralHistory);

	console.log('現在の建玉取得テスト');
	let positions = await api.getPositions();
	console.log(positions);
	
	console.log('板情報取得テスト');
	let board = await api.getBoard();
	console.log(board);
}
run();
