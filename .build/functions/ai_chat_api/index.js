'use strict';

const catalyst = require('zcatalyst-sdk-node');

module.exports = async (req, res) => {


	try {

		const app = catalyst.initialize(req);
		const zcql = app.zcql();

		const message =
			new URL(
				'http://localhost' + req.url
			).searchParams.get('message');

		const lowerMessage =
			message
				? message.toLowerCase()
				: '';

		let response = '';

		// =====================================
		// FIR SEARCH
		// =====================================

		if (
			lowerMessage.includes('fir')
		) {

			const firMatch =
				message.match(/FIR\d+/i);

			if (firMatch) {

				const firId =
					firMatch[0].toUpperCase();

				const fir =
					await zcql.executeZCQLQuery(
						`SELECT *
                     FROM FIR
                     WHERE FIR_ID='${firId}'`
					);

				if (fir.length > 0) {

					const data =
						fir[0].FIR;

					response =


						`FIR ID: ${data.FIR_ID}

Crime Type: ${data.Crime_Type}

District: ${data.District}

Police Station: ${data.Police_Station}

Status: ${data.Status}

FIR Date: ${data.FIR_Date}`;


				} else {

					response =
						'FIR not found';

				}

			}

		}

		// =====================================
		// OPEN CASES
		// =====================================

		else if (
			lowerMessage.includes('open')
		) {

			const cases =
				await zcql.executeZCQLQuery(

					`SELECT *
                 FROM FIR
                 WHERE Status='Open'
                 LIMIT 10`

				);

			response =
				`Open Cases Found: ${cases.length}\n\n`;

			cases.forEach(row => {

				response +=


					`${row.FIR.FIR_ID}
${row.FIR.Crime_Type}
${row.FIR.District}

`;


			});

		}

		// =====================================
		// CLOSED CASES
		// =====================================

		else if (
			lowerMessage.includes('closed')
		) {

			const cases =
				await zcql.executeZCQLQuery(

					`SELECT *
                 FROM FIR
                 WHERE Status='Closed'
                 LIMIT 10`

				);

			response =
				`Closed Cases Found: ${cases.length}\n\n`;

			cases.forEach(row => {

				response +=


					`${row.FIR.FIR_ID}
${row.FIR.Crime_Type}
${row.FIR.District}

`;


			});

		}

		// =====================================
		// KIDNAPPING CASES
		// =====================================

		else if (
			lowerMessage.includes('kidnapping')
		) {

			const cases =
				await zcql.executeZCQLQuery(

					`SELECT *
                 FROM FIR
                 WHERE Crime_Type='Kidnapping'
                 LIMIT 10`

				);

			response =
				`Kidnapping Cases\n\n`;

			cases.forEach(row => {

				response +=


					`${row.FIR.FIR_ID}
${row.FIR.District}
${row.FIR.Status}

`;


			});

		}

		// =====================================
		// TUMAKURU SEARCH
		// =====================================

		else if (
			lowerMessage.includes('tumakuru')
		) {

			const cases =
				await zcql.executeZCQLQuery(

					`SELECT *
                 FROM FIR
                 WHERE District='Tumakuru'
                 LIMIT 20`

				);

			response =


				`Tumakuru Crime Summary

Total Cases Found: ${cases.length}

`;


			cases.slice(0, 5).forEach(row => {

				response +=


					`${row.FIR.FIR_ID}
${row.FIR.Crime_Type}

`;


			});

		}

		// =====================================
		// TOP CRIMINALS
		// =====================================

		else if (

			lowerMessage.includes('top') ||

			lowerMessage.includes('criminal') ||

			lowerMessage.includes('risk')

		) {

			const accused =
				await zcql.executeZCQLQuery(

					`SELECT *
                 FROM Accused
                 ORDER BY Risk_Score DESC
                 LIMIT 5`

				);

			response =
				'Top High Risk Criminals\n\n';

			accused.forEach(row => {

				response +=


					`${row.Accused.Full_Name}
Risk Score: ${row.Accused.Risk_Score}

`;


			});

		}

		// =====================================
		// DEFAULT
		// =====================================

		else {

			response =


				`Try:

Show FIR000007

Show Open Cases

Show Closed Cases

Show Kidnapping Cases

Show Crimes In Tumakuru

Show Top Criminals`;


		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({

			success: true,

			question: message,

			answer: response

		}));

	}
	catch (err) {

		res.writeHead(500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({

			success: false,

			error: err.message

		}));

	}


};
const catalyst = require("zcatalyst-sdk-node");

async function saveContext(req, key, data) {

	const app = catalyst.initialize(req);

	const cache = app.cache();

	const segment = cache.segment();

	await segment.put(
		key,
		JSON.stringify(data),
		3600        // 1 hour
	);
}

async function getContext(req, key) {

	const app = catalyst.initialize(req);

	const cache = app.cache();

	const segment = cache.segment();

	const result = await segment.get(key);

	if (!result)
		return {};

	return JSON.parse(result);
}