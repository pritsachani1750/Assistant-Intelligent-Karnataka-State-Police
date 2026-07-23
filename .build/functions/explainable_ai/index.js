'use strict';

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');
// =====================================
// ACCESS TOKEN
// =====================================

async function getAccessToken() {

	const response =
		await axios.post(

			'https://accounts.zoho.in/oauth/v2/token',

			null,

			{
				params: {

					refresh_token:
						'1000.3d45f81a487f25bc9c00d2902685382a.88e5625a8137f92306fc28f1fa6e1bd0',

					client_id:
						'1000.712TQS6U2R6HXLTI926JCYP5050REK',

					client_secret:
						'aeb6912da98d669fe43c7101280465e3a577eb9189',

					grant_type:
						'refresh_token'
				}
			}
		);

	return response.data.access_token;
}

module.exports = async (req, res) => {

	let glmReport = "AI explanation unavailable.";
	let usage = {};
	let model = "";
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
		const prompt = `
You are the Explainable AI engine for Karnataka State Police.

Use ONLY the supplied evidence.

Never infer, assume, or add facts.

Do not describe criminal intent, dangerous behaviour, or previous crimes unless they appear in the evidence.

Risk Score: ${risk}
Confidence: ${confidence}%

Evidence:
${JSON.stringify(evidence)}

Return exactly these sections:

1. Risk Score Explanation
2. Primary Evidence
3. Confidence Explanation
4. Investigation Recommendation

Keep each section to 2-3 sentences.
Maximum 120 words.
`; try {

			const accessToken =
				await getAccessToken();

			const glm =
				await axios.post(

					'https://api.catalyst.zoho.in/quickml/v1/project/43167000000013025/glm/chat',

					{

						model: 'crm-di-glm47b_30b_it',

						messages: [

							{
								role: 'system',
								content: 'You are an Explainable AI expert for Karnataka State Police.'
							},

							{
								role: 'user',
								content: prompt
							}

						],

						max_tokens: 300,

						temperature: 0.1,

						stream: false,

						chat_template_kwargs: {

							enable_thinking: false

						}

					},

					{

						headers: {

							'Content-Type': 'application/json',

							'CATALYST-ORG': '60073047935',

							'Authorization': `Zoho-oauthtoken ${accessToken}`

						}

					}

				);

			glmReport = glm.data.response;
			usage = glm.data.usage;
			model = glm.data.model;

		}
		catch (err) {

			console.log("Explainable AI GLM Error");
			console.log("Message:", err.message);
			console.log("Code:", err.code);
			console.log("Status:", err.response?.status);
			console.log("Data:", err.response?.data);
		}
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

					risk_score: risk,

					confidence,

					evidence,

					recommendation:
						risk > 80
							? 'HIGH PRIORITY INVESTIGATION'
							: risk > 50
								? 'MEDIUM PRIORITY'
								: 'LOW PRIORITY',

					ai_explanation: glmReport,

					usage: usage,

					model: model

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