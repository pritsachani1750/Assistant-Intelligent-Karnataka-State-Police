'use strict';

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');


// =====================================
// GET ACCESS TOKEN USING REFRESH TOKEN
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


// =====================================
// MAIN FUNCTION
// =====================================

module.exports = async (req, res) => {

	try {

		const app =
			catalyst.initialize(req);

		const zcql =
			app.zcql();

		const firId =
			new URL(
				'http://localhost' + req.url
			).searchParams.get(
				'FIR_ID'
			);

		if (!firId) {

			return res.end(
				JSON.stringify({
					success: false,
					message:
						'FIR_ID required'
				})
			);
		}


		// =====================================
		// GET FIR
		// =====================================

		const fir =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM FIR
                 WHERE FIR_ID='${firId}'`

			);

		if (fir.length === 0) {

			return res.end(
				JSON.stringify({
					success: false,
					message:
						'FIR not found'
				})
			);
		}

		const firData =
			fir[0].FIR;


		// =====================================
		// GET ACCUSED
		// =====================================

		const accused =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM FIR_Accused
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// GET VEHICLES
		// =====================================

		const vehicles =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Vehicle
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// GET PHONES
		// =====================================

		const phones =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Phone
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// CREATE PROMPT
		// =====================================

		const data = {
			fir: firData,
			accused,
			vehicles,
			phones
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


		// =====================================
		// GET ACCESS TOKEN
		// =====================================

		console.log(
			'Generating Access Token...'
		);

		const accessToken =
			await getAccessToken();

		console.log(
			'Token generated successfully'
		);


		// =====================================
		// CALL QUICKML GLM
		// =====================================

		console.log(
			'Calling GLM...'
		);

		const llm =
			await axios.post(

				'https://api.catalyst.zoho.in/quickml/v1/project/43167000000013025/glm/chat',

				{

					model:
						'crm-di-glm47b_30b_it',

					messages: [

						{
							role: 'system',

							content:
								'You are a senior Karnataka State Police Crime Intelligence Analyst.'
						},

						{
							role: 'user',

							content:
								prompt
						}

					],

					max_tokens: 1200,

					temperature: 0.3,

					stream: false,

					chat_template_kwargs: {

						enable_thinking: false

					}

				},

				{

					headers: {

						'Authorization':
							`Zoho-oauthtoken ${accessToken}`,

						'CATALYST-ORG':
							'60073047935',

						'Content-Type':
							'application/json'

					}

				}

			);


		// =====================================
		// RETURN RESULT
		// =====================================

		res.writeHead(200, {

			'Content-Type':
				'application/json'

		});

		res.end(

			JSON.stringify({

				success: true,

				fir: firData,

				accused,

				vehicles,

				phones,

				ai_report:
					llm.data.response,

				usage:
					llm.data.usage,

				model:
					llm.data.model,

				generated_at:
					llm.data.created_time

			}, null, 2)

		);

	}
	catch (err) {

		console.error(err);

		res.writeHead(500, {

			'Content-Type':
				'application/json'

		});

		res.end(

			JSON.stringify({

				success: false,

				error:
					err.message,

				details:
					err.response?.data

			}, null, 2)

		);

	}

};