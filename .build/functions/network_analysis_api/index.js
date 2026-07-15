'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);

		const zcql = app.zcql();

		const ownerId =
			new URL(
				'http://localhost' + req.url
			).searchParams.get(
				'Owner_ID'
			);

		if (!ownerId) {

			return res.end(
				JSON.stringify({
					success: false,
					message:
						'Owner_ID required'
				})
			);

		}

		const accused =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Accused
                 WHERE Person_ID='${ownerId}'`
			);

		const phones =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Phone
                 WHERE Owner_ID='${ownerId}'`
			);

		const vehicles =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Vehicle
                 WHERE Owner_ID='${ownerId}'`
			);

		res.writeHead(200, {
			'Content-Type':
				'application/json'
		});

		res.end(JSON.stringify({

			success: true,

			accused,

			phones,

			vehicles

		}, null, 2));

	}
	catch (err) {

		res.writeHead(500, {
			'Content-Type':
				'application/json'
		});

		res.end(JSON.stringify({
			success: false,
			error: err.message
		}));

	}

};