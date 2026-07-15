'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		let firId = null;

		if (req.url.includes('FIR_ID=')) {

			const urlObj = new URL(
				'http://localhost' + req.url
			);

			firId =
				urlObj.searchParams.get('FIR_ID');
		}

		if (!firId) {

			return res.end(JSON.stringify({
				success: false,
				message: 'FIR_ID required'
			}));

		}

		// Get mappings
		const mappings =
			await zcql.executeZCQLQuery(`
                SELECT *
                FROM FIR_Accused
                WHERE FIR_ID='${firId}'
            `);

		const accusedList = [];

		for (const row of mappings) {

			const personId =
				row.FIR_Accused.Accused_ID;

			const accused =
				await zcql.executeZCQLQuery(`
                    SELECT *
                    FROM Accused
                    WHERE Person_ID='${personId}'
                `);

			if (accused.length > 0) {

				accusedList.push(
					accused[0].Accused
				);

			}

		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: true,
			fir_id: firId,
			total_records: accusedList.length,
			data: accusedList
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