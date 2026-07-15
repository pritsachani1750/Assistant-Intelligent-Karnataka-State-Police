'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		// DEBUG OUTPUT
		console.log("URL:", req.url);
		console.log("QUERY:", req.query);
		console.log("PARAMS:", req.params);

		let firId = null;

		// Method 1
		if (req.query && req.query.FIR_ID) {
			firId = req.query.FIR_ID;
		}

		// Method 2
		if (!firId && req.url.includes('FIR_ID=')) {
			const urlObj = new URL(
				'http://localhost' + req.url
			);

			firId =
				urlObj.searchParams.get('FIR_ID');
		}

		if (!firId) {

			res.writeHead(200, {
				'Content-Type': 'application/json'
			});

			return res.end(JSON.stringify({
				success: false,
				message: 'FIR_ID not received',
				url: req.url,
				query: req.query,
				params: req.params
			}, null, 2));

		}

		const query = `
            SELECT *
            FROM FIR
            WHERE FIR_ID='${firId}'
        `;

		const data =
			await zcql.executeZCQLQuery(query);

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: true,
			fir_id: firId,
			total_records: data.length,
			data
		}, null, 2));

	}
	catch (err) {

		console.log(err);

		res.writeHead(500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: false,
			error: err.message
		}, null, 2));

	}

};