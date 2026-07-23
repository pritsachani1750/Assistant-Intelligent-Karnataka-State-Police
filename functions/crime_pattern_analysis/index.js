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
		// GET FIR DATA
		// =====================================

		const firs =
			await zcql.executeZCQLQuery(
				`SELECT * FROM FIR`
			);


		// =====================================
		// CRIME TYPE ANALYSIS
		// =====================================

		const crimeType =
			{};

		firs.forEach(f => {

			const crime =
				f.FIR.Crime_Type;

			crimeType[crime] =
				(crimeType[crime] || 0) + 1;
		});


		// =====================================
		// DISTRICT ANALYSIS
		// =====================================

		const districtCrime =
			{};

		firs.forEach(f => {

			const district =
				f.FIR.District;

			districtCrime[district] =
				(districtCrime[district] || 0) + 1;
		});


		// =====================================
		// MONTH ANALYSIS
		// =====================================

		const monthlyCrime =
			{};

		firs.forEach(f => {

			try {

				const month =
					new Date(
						f.FIR.FIR_Date
					).toLocaleString(
						'en',
						{
							month: 'long'
						}
					);

				monthlyCrime[month] =
					(monthlyCrime[month] || 0) + 1;

			}
			catch (e) { }
		});


		// =====================================
		// HOTSPOTS
		// =====================================

		const hotspots =
			Object.entries(
				districtCrime
			)
				.sort(
					(a, b) => b[1] - a[1]
				)
				.slice(0, 10)
				.map(x => ({

					district: x[0],
					crime_count: x[1]

				}));


		// =====================================
		// CRIME CLUSTERS
		// =====================================

		const clusters =
			Object.entries(
				crimeType
			)
				.sort(
					(a, b) => b[1] - a[1]
				)
				.slice(0, 5)
				.map(x => ({

					crime: x[0],
					incidents: x[1]

				}));


		// =====================================
		// RISK
		// =====================================

		let risk =
			'LOW';

		if (firs.length > 500)
			risk = 'MEDIUM';

		if (firs.length > 5000)
			risk = 'HIGH';


		// =====================================
		// QUICKML
		// =====================================

		const data = {
			total_cases: firs.length,
			crime_types: crimeType,
			district_hotspots: hotspots,
			seasonal_patterns: monthlyCrime,
			crime_clusters: clusters
		};
		const prompt = `
Generate a Karnataka State Police Crime Intelligence Report.

Statistics:

Total Cases: ${firs.length}

Crime Types:
${JSON.stringify(crimeType)}

Top Hotspots:
${JSON.stringify(hotspots)}

Top Crime Clusters:
${JSON.stringify(clusters)}

Seasonal Trend:
${JSON.stringify(monthlyCrime)}

Provide:

1. Executive Summary

2. Crime Trends

3. Hotspots

4. Risk Assessment

5. Recommendations
`;

		console.log("PROMPT:");
		console.log(prompt);

		console.log("DATA:");
		console.log(JSON.stringify(data, null, 2));

		const accessToken =
			await getAccessToken();

		let glmReport = "AI report unavailable.";
		let usage = {};
		let model = "";

		try {

			const glm = await axios.post(
				// your existing axios.post(...)
			);

			glmReport = glm.data.response;
			usage = glm.data.usage;
			model = glm.data.model;

		} catch (err) {

			console.log("GLM ERROR");
			console.log(err.response?.status);
			console.log(err.response?.data);

			glmReport =
				"AI report is temporarily unavailable. Crime statistics are still displayed.";

		}


		// =====================================
		// RESPONSE
		// =====================================

		res.end(

			JSON.stringify({

				success: true,

				total_cases:
					firs.length,

				crime_distribution:
					crimeType,

				district_hotspots:
					hotspots,

				seasonal_patterns:
					monthlyCrime,

				crime_clusters:
					clusters,

				crime_risk:
					risk,

				glm_report: glmReport,

				usage: usage,

				model: model

			},
				null,
				2)
		);

	}
	catch (err) {

		console.log("GLM ERROR");

		console.log(err.response?.status);

		console.log(err.response?.data);

		console.log(err.message);

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