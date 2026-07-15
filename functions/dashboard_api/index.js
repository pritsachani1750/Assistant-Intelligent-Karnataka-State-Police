'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		const firs =
			await zcql.executeZCQLQuery(
				"SELECT COUNT(FIR_ID) FROM FIR"
			);

		const accused =
			await zcql.executeZCQLQuery(
				"SELECT COUNT(Person_ID) FROM Accused"
			);

		const victims =
			await zcql.executeZCQLQuery(
				"SELECT COUNT(Person_ID) FROM Victim"
			);

		const openCases =
			await zcql.executeZCQLQuery(
				"SELECT COUNT(FIR_ID) FROM FIR WHERE Status='Open'"
			);

		res.writeHead(200, {
			"Content-Type": "application/json"
		});

		res.end(JSON.stringify({

			success: true,

			total_firs:
				firs[0].FIR["COUNT(FIR_ID)"],

			total_accused:
				accused[0].Accused["COUNT(Person_ID)"],

			total_victims:
				victims[0].Victim["COUNT(Person_ID)"],

			open_cases:
				openCases[0].FIR["COUNT(FIR_ID)"]

		}));

	}
	catch (err) {

		console.log(err);

		res.writeHead(500, {
			"Content-Type": "application/json"
		});

		res.end(JSON.stringify({
			success: false,
			error: err.message
		}));

	}

};