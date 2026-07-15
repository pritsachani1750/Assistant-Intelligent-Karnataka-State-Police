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

		const victims =
			await zcql.executeZCQLQuery(
				`SELECT * FROM Victim`
			);

		const social =
			await zcql.executeZCQLQuery(
				`SELECT * FROM Socio_Economic`
			);


		// =====================================
		// AGE ANALYSIS
		// =====================================

		const ageGroups = {

			'0-18': 0,
			'19-30': 0,
			'31-50': 0,
			'51+': 0
		};

		victims.forEach(v => {

			const age =
				parseInt(
					v.Victim.Age
				);

			if (age <= 18)
				ageGroups['0-18']++;

			else if (age <= 30)
				ageGroups['19-30']++;

			else if (age <= 50)
				ageGroups['31-50']++;

			else
				ageGroups['51+']++;
		});


		// =====================================
		// GENDER
		// =====================================

		const gender =
			{};

		victims.forEach(v => {

			const g =
				v.Victim.Gender;

			gender[g] =
				(
					gender[g]
					|| 0
				) + 1;
		});


		// =====================================
		// UNEMPLOYMENT
		// =====================================

		let unemployment =
			[];

		social.forEach(s => {

			unemployment.push(

				parseFloat(
					s.Socio_Economic
						.Unemployment_Rate
				) || 0
			);
		});

		const avgUnemployment =
			unemployment.length
				?
				unemployment.reduce(
					(a, b) => a + b, 0
				)
				/
				unemployment.length
				:
				0;


		// =====================================
		// EDUCATION
		// =====================================

		let education =
			[];

		social.forEach(s => {

			education.push(

				parseFloat(
					s.Socio_Economic
						.Education_Index
				) || 0
			);
		});

		const avgEducation =
			education.length
				?
				education.reduce(
					(a, b) => a + b, 0
				)
				/
				education.length
				:
				0;


		// =====================================
		// POPULATION
		// =====================================

		let population =
			[];

		social.forEach(s => {

			population.push(

				parseFloat(
					s.Socio_Economic
						.Population_Density
				) || 0
			);
		});

		const avgPopulation =
			population.length
				?
				population.reduce(
					(a, b) => a + b, 0
				)
				/
				population.length
				:
				0;


		// =====================================
		// SOCIAL RISK
		// =====================================

		let socialRisk =
			0;

		socialRisk +=
			avgUnemployment;

		socialRisk +=
			(100 - avgEducation);

		socialRisk +=
			avgPopulation / 100;

		socialRisk =
			Math.round(
				socialRisk
			);

		socialRisk =
			Math.min(
				socialRisk,
				100
			);


		// =====================================
		// VULNERABILITY
		// =====================================

		let vulnerability =
			'LOW';

		if (socialRisk > 40)
			vulnerability =
				'MEDIUM';

		if (socialRisk > 70)
			vulnerability =
				'HIGH';


		// =====================================
		// QUICKML
		// =====================================

		const data = {
			victims: victims.length,
			age_distribution: ageGroups,
			gender_distribution: gender,
			average_unemployment: avgUnemployment,
			average_education: avgEducation,
			average_population_density: avgPopulation
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
								'You are a criminology expert.'
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

				total_victims:
					victims.length,

				age_distribution:
					ageGroups,

				gender_distribution:
					gender,

				average_unemployment:
					avgUnemployment,

				average_education:
					avgEducation,

				average_population_density:
					avgPopulation,

				social_risk_score:
					socialRisk,

				vulnerability_level:
					vulnerability,

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