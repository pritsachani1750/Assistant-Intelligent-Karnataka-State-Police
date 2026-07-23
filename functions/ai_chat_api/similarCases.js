'use strict';

const catalyst = require("zcatalyst-sdk-node");

async function findSimilarCases(req, firId) {

    const app = catalyst.initialize(req);
    const zcql = app.zcql();

    // =====================================
    // Current FIR
    // =====================================

    const currentResult = await zcql.executeZCQLQuery(`
        SELECT *
        FROM FIR
        WHERE FIR_ID='${firId}'
    `);

    if (!currentResult.length) {

        return [];

    }

    const current = currentResult[0].FIR;

    // =====================================
    // Get All FIRs
    // =====================================

    const allResult = await zcql.executeZCQLQuery(`
        SELECT *
        FROM FIR
    `);

    const matches = [];

    for (const row of allResult) {

        const fir = row.FIR;

        if (fir.FIR_ID === firId)
            continue;

        let score = 0;

        const reasons = [];

        // Crime Type
        if (fir.Crime_Type === current.Crime_Type) {

            score += 30;

            reasons.push("Same Crime Type");

        }

        // District
        if (fir.District === current.District) {

            score += 20;

            reasons.push("Same District");

        }

        // Police Station
        if (fir.Police_Station === current.Police_Station) {

            score += 15;

            reasons.push("Same Police Station");

        }

        // Status
        if (fir.Status === current.Status) {

            score += 10;

            reasons.push("Same Investigation Status");

        }

        if (score > 0) {

            matches.push({

                firId: fir.FIR_ID,

                crimeType: fir.Crime_Type,

                district: fir.District,

                policeStation: fir.Police_Station,

                status: fir.Status,

                score,

                reasons

            });

        }

    }

    matches.sort((a, b) => b.score - a.score);

    return matches.slice(0, 5);

}

module.exports = {

    findSimilarCases

};