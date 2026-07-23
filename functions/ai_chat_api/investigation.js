'use strict';

const catalyst = require("zcatalyst-sdk-node");

// ======================================
// COMPLETE CASE INVESTIGATION
// ======================================

async function investigateCase(req, firId) {

    const app = catalyst.initialize(req);
    const zcql = app.zcql();

    // FIR
    const fir = await zcql.executeZCQLQuery(`
        SELECT *
        FROM FIR
        WHERE FIR_ID='${firId}'
    `);

    // Investigation
    const investigation = await zcql.executeZCQLQuery(`
        SELECT *
        FROM Investigation
        WHERE FIR_ID='${firId}'
    `);

    // Timeline
    const timeline = await zcql.executeZCQLQuery(`
        SELECT *
        FROM Timeline
        WHERE FIR_ID='${firId}'
    `);

    // Victims
    const victims = await zcql.executeZCQLQuery(`
        SELECT *
        FROM FIR_Victim
        WHERE FIR_ID='${firId}'
    `);

    // Accused
    const accused = await zcql.executeZCQLQuery(`
        SELECT *
        FROM FIR_Accused
        WHERE FIR_ID='${firId}'
    `);

    // Vehicles
    const vehicles = await zcql.executeZCQLQuery(`
        SELECT *
        FROM Vehicle
        WHERE FIR_ID='${firId}'
    `);

    // Phones
    const phones = await zcql.executeZCQLQuery(`
        SELECT *
        FROM Phone
        WHERE FIR_ID='${firId}'
    `);

    // Evidence
    const evidence = await zcql.executeZCQLQuery(`
        SELECT *
        FROM Evidence
        WHERE FIR_ID='${firId}'
    `);

    // Transactions
    const transactions = await zcql.executeZCQLQuery(`
    SELECT *
    FROM Transaction
    LIMIT 100
`);

    return {

        fir: fir.map(r => r.FIR),

        investigation: investigation.map(r => r.Investigation),

        timeline: timeline.map(r => r.Timeline),

        victims: victims.map(r => r.FIR_Victim),

        accused: accused.map(r => r.FIR_Accused),

        vehicles: vehicles.map(r => r.Vehicle),

        phones: phones.map(r => r.Phone),

        evidence: evidence.map(r => r.Evidence),

        transactions: transactions.map(r => r.Transaction)

    };

}

module.exports = {

    investigateCase

};