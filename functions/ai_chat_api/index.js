'use strict';

const { processMessage } = require("./router");

// =========================================
// MAIN FUNCTION
// =========================================

module.exports = async (req, res) => {

	try {

		const url =
			new URL(
				"http://localhost" + req.url
			);

		const message =
			url.searchParams.get("message");

		const language =
			url.searchParams.get("language") || "en";

		if (!message) {

			res.writeHead(400, {
				"Content-Type": "application/json"
			});

			return res.end(
				JSON.stringify({
					success: false,
					error: "Message is required"
				})
			);

		}

		const result =
			await processMessage(
				req,
				message,
				language
			);

		res.writeHead(200, {
			"Content-Type": "application/json"
		});

		res.end(
			JSON.stringify(result)
		);

	}

	catch (err) {

		console.error(err);

		res.writeHead(500, {
			"Content-Type": "application/json"
		});

		res.end(
			JSON.stringify({
				success: false,
				error: err.message
			})
		);

	}

};


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