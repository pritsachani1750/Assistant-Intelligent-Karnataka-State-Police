'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app =
			catalyst.initialize(req);

		const zcql =
			app.zcql();

		const forecasts =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Crime_Forecast
                 ORDER BY Probability_Score DESC
                 LIMIT 20`

			);

		let alerts = [];

		forecasts.forEach(row => {

			const data =
				row.Crime_Forecast;

			if (
				parseFloat(
					data.Probability_Score
				) >= 0.75
			) {

				alerts.push({

					region:
						data.Region_ID,

					crime:
						data.Predicted_Crime_Type,

					score:
						data.Probability_Score,

					date:
						data.Forecast_Date

				});

			}

		});

		res.writeHead(200, {
			'Content-Type':
				'application/json'
		});

		res.end(
			JSON.stringify({

				success: true,

				total_forecasts:
					forecasts.length,

				alerts

			})
		);

	}
	catch (err) {

		res.writeHead(500, {
			'Content-Type':
				'application/json'
		});

		res.end(
			JSON.stringify({

				success: false,

				error:
					err.message

			})
		);

	}

};