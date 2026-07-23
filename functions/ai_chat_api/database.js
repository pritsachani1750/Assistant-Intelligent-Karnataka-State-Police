'use strict';

const catalyst = require("zcatalyst-sdk-node");

// =====================================
// Database Search Service
// =====================================

async function searchCrimeDatabase(req, message) {

    const app = catalyst.initialize(req);
    const zcql = app.zcql();

    const text = message.toLowerCase();

    // ==========================
    // FIR SEARCH
    // ==========================

    const firMatch = message.match(/FIR\d+/i);

    if (firMatch) {

        const firId = firMatch[0].toUpperCase();

        const result = await zcql.executeZCQLQuery(`
            SELECT *
            FROM FIR
            WHERE FIR_ID='${firId}'
        `);

        return {
            type: "fir",
            data: result
        };
    }

    // ==========================
    // OPEN CASES
    // ==========================

    if (text.includes("open")) {

        const result = await zcql.executeZCQLQuery(`
            SELECT *
            FROM FIR
            WHERE Status='Open'
            LIMIT 20
        `);

        return {
            type: "open_cases",
            data: result
        };
    }

    // ==========================
    // CLOSED CASES
    // ==========================

    if (text.includes("closed")) {

        const result = await zcql.executeZCQLQuery(`
            SELECT *
            FROM FIR
            WHERE Status='Closed'
            LIMIT 20
        `);

        return {
            type: "closed_cases",
            data: result
        };
    }

    // ==========================
    // TOP CRIMINALS
    // ==========================

    if (
        text.includes("criminal") ||
        text.includes("risk")
    ) {

        const result = await zcql.executeZCQLQuery(`
            SELECT *
            FROM Accused
            ORDER BY Risk_Score DESC
            LIMIT 10
        `);

        return {
            type: "criminals",
            data: result
        };
    }

    // ==========================
    // DISTRICT SEARCH
    // ==========================

    const districts = [

        "bengaluru urban",
        "mysuru",
        "tumakuru",
        "ballari",
        "hubballi",
        "belagavi",
        "kalaburagi",
        "shivamogga",
        "mangaluru",
        "davanagere"

    ];

    for (const district of districts) {

        if (text.includes(district)) {

            const result = await zcql.executeZCQLQuery(`
                SELECT *
                FROM FIR
                WHERE District='${district}'
                LIMIT 20
            `);

            return {

                type: "district",

                district,

                data: result

            };

        }

    }

    // ==========================
    // DEFAULT
    // ==========================

    return {

        type: "general",

        data: []

    };

}

module.exports = {

    searchCrimeDatabase

};