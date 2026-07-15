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


// =====================================
// MAIN
// =====================================

module.exports = async (req, res) => {

	try {

		const app =
			catalyst.initialize(req);

		const zcql =
			app.zcql();


		// =====================================
		// GET DATA
		// =====================================

		const transactions =
			await zcql.executeZCQLQuery(

				`SELECT *
             FROM Transaction`

			);

		const accounts =
			await zcql.executeZCQLQuery(

				`SELECT *
             FROM Bank_Account`

			);


		// =====================================
		// SUSPICIOUS
		// =====================================

		const suspicious =
			transactions.filter(

				t =>
					t.Transaction
						.Suspicious_Flag
					=== 'Yes'
			);


		// =====================================
		// HIGH VALUE
		// =====================================

		const highValue =
			transactions.filter(

				t =>
					parseFloat(
						t.Transaction
							.Amount
					) > 50000
			);


		// =====================================
		// MONEY TRAIL
		// =====================================

		const moneyTrail =
			transactions
				.slice(0, 20)
				.map(t => ({

					from:
						t.Transaction
							.From_Account,

					to:
						t.Transaction
							.To_Account,

					amount:
						t.Transaction
							.Amount,

					suspicious:
						t.Transaction
							.Suspicious_Flag
				}));


		// =====================================
		// NETWORK
		// =====================================

		const network =
			{};

		transactions
			.forEach(t => {

				const from =
					t.Transaction
						.From_Account;

				const to =
					t.Transaction
						.To_Account;

				network[from] =
					(
						network[from]
						|| 0
					) + 1;

				network[to] =
					(
						network[to]
						|| 0
					) + 1;
			});


		const topAccounts =
			Object
				.entries(network)
				.sort(
					(a, b) =>
						b[1] - a[1]
				)
				.slice(0, 10)
				.map(x => ({

					account:
						x[0],

					transactions:
						x[1]
				}));


		// =====================================
		// MONEY LAUNDERING
		// =====================================

		let laundering =
			0;

		laundering +=
			suspicious.length;

		laundering +=
			highValue.length;

		laundering +=
			topAccounts.length;

		laundering =
			Math.min(
				laundering,
				95
			);


		// =====================================
		// RISK
		// =====================================

		let risk =
			'LOW';

		if (laundering > 30)
			risk = 'MEDIUM';

		if (laundering > 60)
			risk = 'HIGH';


		// =====================================
		// RECOMMENDATIONS
		// =====================================

		const recommendations =
			[];

		if (
			suspicious.length
		) {

			recommendations.push(
				'Freeze suspicious accounts'
			);
		}

		if (
			highValue.length
		) {

			recommendations.push(
				'Investigate large transfers'
			);
		}

		if (
			topAccounts.length
		) {

			recommendations.push(
				'Perform network analysis'
			);
		}

		recommendations.push(
			'Trace fund movement'
		);


		// =====================================
		// QUICKML
		// =====================================

		const data = {
			transactions: transactions.length,
			suspicious: suspicious.length,
			high_value: highValue.length,
			money_trail: moneyTrail,
			network: topAccounts
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

		const accessToken =
			await getAccessToken();


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
								'You are a financial crime investigation expert.'
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


		// =====================================
		// RESPONSE
		// =====================================

		res.end(

			JSON.stringify({

				success: true,

				total_transactions:
					transactions.length,

				suspicious_transactions:
					suspicious.length,

				high_value_transactions:
					highValue.length,

				money_laundering_probability:
					laundering,

				network_risk:
					risk,

				money_trail:
					moneyTrail,

				suspicious_accounts:
					topAccounts,

				recommendations,

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

	}
	catch (err) {

		console.log(err);

		res.end(

			JSON.stringify({

				success: false,

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