'use strict';

const catalyst = require('zcatalyst-sdk-node');
const XLSX = require('xlsx');

module.exports = async (req, res) => {

	try {

		const app = catalyst.initialize(req);
		const datastore = app.datastore();

		const workbook = XLSX.readFile(
			'C:/Users/Prit Sachani/Music/ksp/dataset/data/KSP Crime Database Tables.xlsx'
		);

		// FIR already loaded
		const tablesToLoad = [
			'Crime_Forecast',
			'Socio_Economic'
		];

		const result = {};

		for (const sheetName of tablesToLoad) {

			console.log(`Loading ${sheetName}...`);

			const sheet = workbook.Sheets[sheetName];
			const rows = XLSX.utils.sheet_to_json(sheet);

			const table = datastore.table(sheetName);

			let inserted = 0;
			let failed = 0;

			for (let row of rows) {

				try {

					if (sheetName === 'Accused') {

						row.Age = parseInt(row.Age) || 0;
						row.Risk_Score = parseInt(
							String(row.Risk_Score).replace(/[^\d]/g, '')
						) || 0;

					}

					if (sheetName === 'Victim') {

						row.Age = parseInt(row.Age) || 0;

					}

					await table.insertRow(row);

					inserted++;

				} catch (err) {

					failed++;

					console.log(
						`${sheetName}: ${err.message}`
					);

				}

			}

			result[sheetName] = {
				total: rows.length,
				inserted,
				failed
			};

			console.log(
				`${sheetName} Done`
			);

		}

		res.writeHead(200, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: true,
			result
		}, null, 2));

	} catch (err) {

		res.writeHead(500, {
			'Content-Type': 'application/json'
		});

		res.end(JSON.stringify({
			success: false,
			error: err.message
		}, null, 2));

	}

};