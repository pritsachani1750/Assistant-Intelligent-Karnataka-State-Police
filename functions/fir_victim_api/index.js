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

		const mappings =
			await zcql.executeZCQLQuery(`
                SELECT *
                FROM FIR_Victim
                WHERE FIR_ID='${firId}'
            `);

		const victimList = [];

		for (const row of mappings) {

			const personId =
				row.FIR_Victim.Victim_ID;

			const victim =
				await zcql.executeZCQLQuery(`
                    SELECT *
                    FROM Victim
                    WHERE Person_ID='${personId}'
                `);

			if (victim.length > 0) {

				victimList.push(
					victim[0].Victim
				);

			}

		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: true,
			fir_id: firId,
			total_records: victimList.length,
			data: victimList
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