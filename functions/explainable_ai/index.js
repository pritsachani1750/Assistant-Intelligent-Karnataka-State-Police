'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		const personId =
			new URL(
				'http://localhost' + req.url
			).searchParams.get(
				'Person_ID'
			);

		if (!personId) {

			return res.end(
				JSON.stringify({
					success: false,
					message:
						'Person_ID required'
				})
			);
		}

		// =====================================
		// GET ACCUSED
		// =====================================

		const accused =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Accused
                 WHERE Person_ID='${personId}'`
			);

		if (accused.length === 0) {

			return res.end(
				JSON.stringify({
					success: false,
					message:
						'Accused not found'
				})
			);
		}

		// =====================================
		// GET FIR COUNT
		// =====================================

		const firs =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM FIR_Accused
                 WHERE Accused_ID='${personId}'`
			);

		// =====================================
		// GET VEHICLES
		// =====================================

		const vehicles =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Vehicle
                 WHERE Owner_ID='${personId}'`
			);

		// =====================================
		// GET PHONES
		// =====================================

		const phones =
			await zcql.executeZCQLQuery(
				`SELECT *
                 FROM Phone
                 WHERE Owner_ID='${personId}'`
			);

		// =====================================
		// CALCULATE RISK
		// =====================================

		let risk = 0;

		const evidence = [];

		// Repeat offender
		if (firs.length >= 3) {

			risk += 30;

			evidence.push({
				factor:
					'Repeat Offender',
				score:
					30,
				reason:
					`${firs.length} FIRs found`
			});
		}

		// Vehicle links
		if (vehicles.length > 0) {

			risk += 25;

			evidence.push({
				factor:
					'Vehicle Evidence',
				score:
					25,
				reason:
					`${vehicles.length} vehicles linked`
			});
		}

		// Phone links
		if (phones.length > 0) {

			risk += 20;

			evidence.push({
				factor:
					'Phone Intelligence',
				score:
					20,
				reason:
					`${phones.length} phones linked`
			});
		}

		// Existing risk score
		const existing =
			parseInt(
				accused[0]
					.Accused
					.Risk_Score || 0
			);

		risk +=
			Math.floor(
				existing / 5
			);

		evidence.push({
			factor:
				'Historical Risk',
			score:
				Math.floor(
					existing / 5
				),
			reason:
				`Existing score ${existing}`
		});

		// Cap at 100
		if (risk > 100)
			risk = 100;

		// =====================================
		// CONFIDENCE
		// =====================================

		const confidence =
			Math.min(
				95,
				60 +
				evidence.length * 8
			);

		// =====================================
		// RESPONSE
		// =====================================

		res.writeHead(200, {
			'Content-Type':
				'application/json'
		});

		res.end(
			JSON.stringify({

				success: true,

				person:
					accused[0]
						.Accused,

				explainable_ai: {

					risk_score:
						risk,

					confidence,

					evidence,

					recommendation:

						risk > 80
							? 'HIGH PRIORITY INVESTIGATION'
							: risk > 50
								? 'MEDIUM PRIORITY'
								: 'LOW PRIORITY'

				}

			}, null, 2)
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

			}, null, 2)
		);
	}

};