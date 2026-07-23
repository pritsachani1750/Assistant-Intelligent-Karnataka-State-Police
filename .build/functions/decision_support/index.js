'use strict';

const catalyst = require('zcatalyst-sdk-node');
const axios = require('axios');


// =====================================
// GET ACCESS TOKEN
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
let glmReport = "AI Recommendation unavailable.";
let usage = {};
let model = "";
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
		// FIR
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
		// INVESTIGATION
		// =====================================

		const investigation =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Investigation
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// TIMELINE
		// =====================================

		const timeline =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Timeline
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// ACCUSED
		// =====================================

		const accused =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM FIR_Accused
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// VEHICLES
		// =====================================

		const vehicles =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Vehicle
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// PHONES
		// =====================================

		const phones =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Phone
                 WHERE FIR_ID='${firId}'`

			);


		// =====================================
		// TRANSACTIONS
		// =====================================

		const transactions =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM Transaction`

			);


		// =====================================
		// CASE SUMMARY
		// =====================================

		const caseSummary = {

			fir_id:
				firData.FIR_ID,

			crime_type:
				firData.Crime_Type,

			district:
				firData.District,

			police_station:
				firData.Police_Station,

			status:
				firData.Status,

			accused_count:
				accused.length,

			vehicle_count:
				vehicles.length,

			phone_count:
				phones.length,

			timeline_events:
				timeline.length,

			investigation_status:
				investigation.length
					? investigation[0]
						.Investigation
						.Status
					: 'Unknown'
		};


		// =====================================
		// SIMILAR CASES
		// =====================================

		const similarCases =
			await zcql.executeZCQLQuery(

				`SELECT *
                 FROM FIR
                 WHERE Crime_Type='${firData.Crime_Type}'
                 AND FIR_ID!='${firId}'`

			);

		const topCases =
			similarCases.slice(0, 5);


		// =====================================
		// INVESTIGATION LEADS
		// =====================================

		const leads = [];

		if (vehicles.length)
			leads.push(
				'Investigate linked vehicles'
			);

		if (phones.length)
			leads.push(
				'Analyze communication records'
			);

		if (accused.length > 1)
			leads.push(
				'Perform criminal network analysis'
			);

		if (transactions.length > 0)
			leads.push(
				'Perform financial investigation'
			);

		if (timeline.length)
			leads.push(
				'Review timeline evidence'
			);


		// =====================================
		// SUCCESS PROBABILITY
		// =====================================

		let probability = 50;

		if (
			firData.Status ===
			'Closed'
		)
			probability += 30;

		if (vehicles.length)
			probability += 5;

		if (phones.length)
			probability += 5;

		if (accused.length > 1)
			probability += 5;

		if (timeline.length)
			probability += 5;

		if (probability > 95)
			probability = 95;


		// =====================================
		// FINANCIAL RISK
		// =====================================

		const suspicious =
			transactions.filter(

				t =>
					t.Transaction
						?.Suspicious_Flag
					=== 'Yes'
			);

		const financialRisk = {

			total_transactions:
				transactions.length,

			suspicious_transactions:
				suspicious.length,

			risk_level:

				suspicious.length > 50
					? 'HIGH'

					: suspicious.length > 20
						? 'MEDIUM'
						: 'LOW'
		};


		// =====================================
		// QUICKML PROMPT
		// =====================================

		const data = {
			case_summary: caseSummary,
			timeline: timeline,
			similar_cases: topCases,
			investigation_leads: leads,
			financial_risk: financialRisk
		};

		const prompt = `
You are an AI Decision Support System for Karnataka State Police CICC.

CASE DETAILS

FIR ID: ${caseSummary.fir_id}

Crime Type: ${caseSummary.crime_type}

District: ${caseSummary.district}

Police Station: ${caseSummary.police_station}

Current Status: ${caseSummary.status}

Accused: ${caseSummary.accused_count}

Vehicles: ${caseSummary.vehicle_count}

Phones: ${caseSummary.phone_count}

Timeline Events: ${caseSummary.timeline_events}

Investigation Status: ${caseSummary.investigation_status}

Financial Risk:
${financialRisk.risk_level}

Investigation Leads:
${leads.join("\n")}

Success Probability:
${probability}%

Generate:

1. Executive Summary

2. Investigation Priority
(CRITICAL / HIGH / MEDIUM / LOW)

3. Recommended Police Actions

4. Resource Allocation
(Number of officers, cyber experts, forensic team, surveillance)

5. Possible Risks

6. Next Investigation Steps

Use ONLY the supplied information.
Do not invent facts.
Maximum 400 words.
`;

		console.log("PROMPT:");
		console.log(prompt);

		console.log("DATA:");
		console.log(JSON.stringify(data, null, 2));


		// =====================================
		// QUICKML
		// =====================================

		const accessToken =
			await getAccessToken();

		try {

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
								content: 'You are a Karnataka State Police investigation expert.'
							},

							{
								role: 'user',
								content: prompt
							}

						],

						max_tokens: 1000,
						temperature: 0.3,
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

			console.log("Decision Support GLM Error");
			console.log(err.response?.status);
			console.log(err.response?.data);

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

				case_summary:
					caseSummary,

				timeline,

				similar_cases:
					topCases,

				investigation_leads:
					leads,

				success_probability:
					probability,

				financial_risk:
					financialRisk,

				glm_report:
					glmReport,

				usage:
					usage,

				model:
					model

			},
				null,
				2)
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

			},
				null,
				2)
		);
	}
};