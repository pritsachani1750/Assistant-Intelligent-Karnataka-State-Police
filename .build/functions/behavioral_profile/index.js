'use strict';

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');

// ======================================
// GET ACCESS TOKEN
// ======================================

async function getAccessToken() {

	try {

		const response = await axios.post(
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

		console.log('TOKEN RESPONSE');
		console.log(
			JSON.stringify(
				response.data,
				null,
				2
			)
		);

		if (!response.data.access_token) {
			throw new Error(
				'ACCESS TOKEN NOT RETURNED'
			);
		}

		return response.data.access_token;

	} catch (err) {

		console.log(
			'TOKEN ERROR'
		);

		console.log(
			err.response?.data
		);

		throw err;
	}
}


// ======================================
// MAIN
// ======================================

module.exports = async (req, res) => {

	try {

		const app =
			catalyst.initialize(req);

		const zcql =
			app.zcql();

		const personId =
			new URL(
				'http://localhost' + req.url
			)
				.searchParams
				.get(
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


		// ======================================
		// ACCUSED
		// ======================================

		const accusedResult =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Accused
                 WHERE Person_ID='${personId}'`

			);

		if (
			accusedResult.length === 0
		) {

			return res.end(
				JSON.stringify({

					success: false,

					message:
						'Person not found'

				})
			);
		}

		const person =
			accusedResult[0]
				.Accused;


		// ======================================
		// FIR HISTORY
		// ======================================

		const firHistory =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM FIR_Accused
                 WHERE Accused_ID='${personId}'`

			);


		// ======================================
		// VEHICLES
		// ======================================

		const vehicles =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Vehicle
                 WHERE Owner_ID='${personId}'`

			);


		// ======================================
		// PHONES
		// ======================================

		const phones =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Phone
                 WHERE Owner_ID='${personId}'`

			);


		// ======================================
		// PROFILE ENGINE
		// ======================================

		const repeatProbability =
			Math.min(
				firHistory.length * 15,
				95
			);

		let criminalType =
			'Occasional Offender';

		if (
			firHistory.length >= 5
		) {
			criminalType =
				'Habitual Criminal';
		}

		if (
			firHistory.length >= 3 &&
			(
				vehicles.length > 0 ||
				phones.length > 0
			)
		) {
			criminalType =
				'Organized Criminal';
		}

		let behavior =
			'Impulsive';

		if (
			vehicles.length ||
			phones.length
		) {
			behavior =
				'Planned';
		}

		let violenceRisk =
			'LOW';

		const risk =
			parseInt(
				person.Risk_Score || 0
			);

		if (
			risk > 40
		) {
			violenceRisk =
				'MEDIUM';
		}

		if (
			risk > 70
		) {
			violenceRisk =
				'HIGH';
		}

		let networkRisk =
			'LOW';

		if (
			firHistory.length > 2
		) {
			networkRisk =
				'MEDIUM';
		}

		if (
			firHistory.length > 5
		) {
			networkRisk =
				'HIGH';
		}

		let modus =
			'Unknown';

		if (
			vehicles.length &&
			phones.length
		) {

			modus =
				'Vehicle-assisted coordinated crime';

		} else if (
			vehicles.length
		) {

			modus =
				'Vehicle-assisted crime';

		} else if (
			phones.length
		) {

			modus =
				'Communication-based crime';
		}

		let psychology =
			'Low-risk individual';

		if (
			risk > 50
		) {

			psychology =
				'Calculated offender';
		}

		if (
			risk > 80
		) {

			psychology =
				'High-risk organized offender';
		}

		let threat =
			'LOW';

		if (
			risk > 50
		) {

			threat =
				'MEDIUM';
		}

		if (
			risk > 80 ||
			firHistory.length > 5
		) {

			threat =
				'HIGH';
		}

		const profile = {

			criminal_type:
				criminalType,

			behavior_pattern:
				behavior,

			violence_risk:
				violenceRisk,

			repeat_probability:
				repeatProbability,

			network_risk:
				networkRisk,

			modus_operandi:
				modus,

			psychological_profile:
				psychology,

			threat_level:
				threat
		};


		// ======================================
		// QUICKML PROMPT
		// ======================================

		const data = {
			person: person,
			profile: profile,
			fir_history_count: firHistory.length,
			vehicles: vehicles,
			phones: phones
		};

		const prompt = `
KSP-CICC AI CORE

Analyze the following police intelligence data.

DATA TO ANALYZE:

${JSON.stringify(data, null, 2)}

Generate a KSP intelligence report using the required format.
`;

		console.log("PROMPT:");
		console.log(prompt);

		console.log("DATA:");
		console.log(JSON.stringify(data, null, 2));


		// ======================================
		// QUICKML
		// ======================================

		const accessToken =
			await getAccessToken();

		console.log(
			'ACCESS TOKEN'
		);

		console.log(
			accessToken
		);

		const glm =
			await axios.post(

				'https://api.catalyst.zoho.in/quickml/v1/project/43167000000013025/glm/chat',

				{

					model:
						'crm-di-glm47b_30b_it',

					messages: [

						{
							role:
								'system',

							content:
								'You are a Karnataka State Police criminology expert.'
						},

						{
							role:
								'user',

							content:
								prompt
						}

					],

					max_tokens:
						1000,

					temperature:
						0.3,

					stream:
						false,

					chat_template_kwargs: {

						enable_thinking:
							false
					}
				},

				{

					headers: {

						'Content-Type':
							'application/json',

						'CATALYST-ORG':
							'60073047935',

						'Authorization':
							`Zoho-oauthtoken ${accessToken}`
					}
				}
			);


		// ======================================
		// RESPONSE
		// ======================================

		res.writeHead(
			200,
			{
				'Content-Type':
					'application/json'
			}
		);

		res.end(

			JSON.stringify({

				success:
					true,

				person,

				behavioral_profile:
					profile,

				fir_history:
					firHistory.length,

				vehicles,

				phones,

				glm_report:
					glm.data.response,

				usage:
					glm.data.usage,

				model:
					glm.data.model

			},
				null,
				2)
		);

	} catch (err) {

		console.error(
			err
		);

		res.writeHead(
			500,
			{
				'Content-Type':
					'application/json'
			}
		);

		res.end(

			JSON.stringify({

				success:
					false,

				error:
					err.message,

				details:
					err.response?.data

			},
				null,
				2)
		);
	}
};  