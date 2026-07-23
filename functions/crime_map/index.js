'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		// Fetch all locations
		const locations = await zcql.executeZCQLQuery(`
            SELECT *
            FROM Location
        `);

		const data = locations.map(row => ({

			fir: row.Location.FIR_ID,

			latitude: parseFloat(row.Location.Latitude),

			longitude: parseFloat(row.Location.Longitude),

			address: row.Location.Address

		}));

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({

			success: true,

			locations: data

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