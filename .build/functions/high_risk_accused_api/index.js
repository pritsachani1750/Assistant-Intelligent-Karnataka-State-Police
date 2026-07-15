'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		const data =
			await zcql.executeZCQLQuery(`
                SELECT *
                FROM Accused
                ORDER BY Risk_Score DESC
                LIMIT 20
            `);

		const result =
			data.map(
				row => row.Accused
			);

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: true,
			total_records: result.length,
			data: result
		}, null, 2));

	}
	catch (err) {

		res.writeHead(500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: false,
			error: err.message
		}, null, 2));

	}

};