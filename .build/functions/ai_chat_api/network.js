'use strict';

const { investigateCase } = require("./investigation");

async function buildNetwork(req, firId) {

    const caseData = await investigateCase(req, firId);

    const nodes = [];
    const edges = [];

    // ======================================
    // FIR
    // ======================================

    nodes.push({
        id: firId,
        label: firId,
        type: "FIR"
    });

    // ======================================
    // ACCUSED
    // ======================================

    if (caseData.accused) {

        caseData.accused.forEach(accused => {

            const accusedId =
                accused.Accused_ID ||
                accused.accused_id;

            if (!accusedId)
                return;

            nodes.push({
                id: accusedId,
                label: accusedId,
                type: "Accused"
            });

            edges.push({
                from: firId,
                to: accusedId,
                relation: "Accused"
            });

        });

    }

    // ======================================
    // VICTIMS
    // ======================================

    if (caseData.victims) {

        caseData.victims.forEach(victim => {

            const victimId =
                victim.Victim_ID ||
                victim.victim_id;

            if (!victimId)
                return;

            nodes.push({
                id: victimId,
                label: victimId,
                type: "Victim"
            });

            edges.push({
                from: firId,
                to: victimId,
                relation: "Victim"
            });

        });

    }

    // ======================================
    // VEHICLES
    // ======================================

    if (caseData.vehicles) {

        caseData.vehicles.forEach(vehicle => {

            const vehicleId =
                vehicle.Vehicle_ID ||
                vehicle.vehicle_id;

            if (!vehicleId)
                return;

            nodes.push({
                id: vehicleId,
                label:
                    vehicle.Vehicle_Number ||
                    vehicle.Registration_Number ||
                    vehicleId,
                type: "Vehicle"
            });

            edges.push({
                from: firId,
                to: vehicleId,
                relation: "Vehicle"
            });

        });

    }

    // ======================================
    // PHONES
    // ======================================

    if (caseData.phones) {

        caseData.phones.forEach(phone => {

            const phoneId =
                phone.Phone_ID ||
                phone.phone_id;

            if (!phoneId)
                return;

            nodes.push({
                id: phoneId,
                label:
                    phone.Phone_Number ||
                    phone.Number ||
                    phoneId,
                type: "Phone"
            });

            edges.push({
                from: firId,
                to: phoneId,
                relation: "Phone"
            });

        });

    }

    // ======================================
    // EVIDENCE
    // ======================================

    if (caseData.evidence) {

        caseData.evidence.forEach(evidence => {

            const evidenceId =
                evidence.Evidence_ID ||
                evidence.evidence_id;

            if (!evidenceId)
                return;

            nodes.push({
                id: evidenceId,
                label:
                    evidence.Category ||
                    evidence.Evidence_Type ||
                    evidenceId,
                type: "Evidence"
            });

            edges.push({
                from: firId,
                to: evidenceId,
                relation: "Evidence"
            });

        });

    }

    // ======================================
    // TRANSACTIONS
    // ======================================

    if (caseData.transactions) {

        caseData.transactions.forEach(transaction => {

            const transactionId =
                transaction.Transaction_ID ||
                transaction.transaction_id;

            if (!transactionId)
                return;

            nodes.push({
                id: transactionId,
                label: transactionId,
                type: "Transaction"
            });

            edges.push({
                from: firId,
                to: transactionId,
                relation: "Transaction"
            });

        });

    }

    return {

        firId,

        totalNodes: nodes.length,

        totalEdges: edges.length,

        nodes,

        edges

    };

}

module.exports = {
    buildNetwork
};