'use strict';

const { detectIntent } = require("./intent");
const { searchCrimeDatabase } = require("./database");
const { askGLM } = require("./glm");
const { investigateCase } = require("./investigation");
const { buildCaseContext } = require("./reportBuilder");
const { buildNetwork } = require("./network");
const { findSimilarCases } = require("./similarCases");
const { getCrimeAnalytics } = require("./analytics");
const {
    GENERAL_PROMPT,
    INVESTIGATION_PROMPT
} = require("./prompts");
const {
    saveMemory,
    getMemory
} = require("./memory");
const {
    translateToEnglish,
    translateToKannada
} = require("./language");

// ======================================
// MAIN ROUTER
// ======================================

async function processMessage(req, message, language) {
    // ======================================
    // LANGUAGE DETECTION
    // ======================================

    const originalMessage = message;

    const userLanguage =
        language || "en";
    if (userLanguage === "kn") {

        message =
            await translateToEnglish(message);

    }

    console.log("Original:", originalMessage);
    console.log("Translated:", message);


    const intent = detectIntent(message);

    // ======================================
    // GENERAL CHAT
    // ======================================

    if (intent === "general") {

        let answer = await askGLM(
            GENERAL_PROMPT,
            message
        );

        if (userLanguage === "kn") {

            answer =
                await translateToKannada(answer);

        }

        return {

            success: true,

            source: "GLM",

            type: "general",

            answer

        };

    }

    // ======================================
    // FULL CASE INVESTIGATION
    // ======================================

    const firMatch = message.match(/FIR\d+/i);

    if (
        firMatch &&
        (
            message.toLowerCase().includes("analyze") ||
            message.toLowerCase().includes("analyse") ||
            message.toLowerCase().includes("investigate") ||
            message.toLowerCase().includes("summary")
        )
    ) {

        const firId = firMatch[0].toUpperCase();

        const caseData = await investigateCase(
            req,
            firId
        );
        console.log("========== CASE DATA ==========");
        console.log(JSON.stringify(caseData, null, 2));

        console.log("FIR:", caseData.fir.length);
        console.log("Accused:", caseData.accused.length);
        console.log("Victims:", caseData.victims.length);
        console.log("Vehicles:", caseData.vehicles.length);
        console.log("Phones:", caseData.phones.length);
        console.log("Evidence:", caseData.evidence.length);
        console.log("Transactions:", caseData.transactions.length);
        saveMemory("default_user", {
            firId
        });
        console.log(
            "Current Memory:",
            getMemory("default_user")
        );
        console.log("Memory Saved:", getMemory("default_user"));
        console.log("========== CASE DATA ==========");
        console.log(JSON.stringify(caseData, null, 2));

        if (
            !caseData.fir ||
            caseData.fir.length === 0
        ) {

            return {

                success: false,

                answer: `No FIR found for ${firId}.`

            };

        }

        const caseContext =
            buildCaseContext(caseData);

        const prompt = `

You are Karnataka State Police Crime Intelligence AI.

Analyze ONLY the supplied investigation data.

Never fabricate evidence.

Generate a professional police intelligence report.

Report Format

████ KSP INTELLIGENCE REPORT ████

1. Executive Summary

2. Case Overview

3. Threat Assessment

4. Behavioral Analysis

5. Victim Assessment

6. Criminal Network Analysis

7. Financial Intelligence

8. Timeline Analysis

9. Evidence Analysis

10. Investigation Recommendations

11. Confidence Score (0-100%)

12. Final Assessment

Case Data

${caseContext}

`;

        console.log("========== PROMPT ==========");
        console.log(prompt);

        let report =
            await askGLM(
                INVESTIGATION_PROMPT,
                prompt
            );
        if (userLanguage === "kn") {

            report =
                await translateToKannada(report);

        }

        console.log("========== GLM RESPONSE ==========");
        console.log(report);

        return {

            success: true,

            source: "Investigation Engine",

            type: "investigation",

            fir_id: firId,


            report

        };

    }
    // ======================================
    // FOLLOW-UP INVESTIGATION QUESTIONS
    // ======================================

    const context =
        getMemory("default_user");

    if (
        context &&
        !message.match(/FIR\d+/i)
    ) {

        const lower = message.toLowerCase();

        if (
            lower.includes("accused") ||
            lower.includes("victim") ||
            lower.includes("timeline") ||
            lower.includes("evidence") ||
            lower.includes("vehicle") ||
            lower.includes("phone") ||
            lower.includes("district") ||
            lower.includes("crime") ||
            lower.includes("status") ||
            lower.includes("officer") ||
            lower.includes("station") ||
            lower.includes("financial") ||
            lower.includes("transaction") ||
            lower.includes("recommendation") ||
            lower.includes("summary")
        ) {

            const caseData =
                await investigateCase(
                    req,
                    context.firId
                );

            let section = "";

            if (lower.includes("accused"))
                section = JSON.stringify(caseData.accused, null, 2);

            else if (lower.includes("victim"))
                section = JSON.stringify(caseData.victims, null, 2);

            else if (lower.includes("timeline"))
                section = JSON.stringify(caseData.timeline, null, 2);

            else if (lower.includes("evidence"))
                section = JSON.stringify(caseData.evidence, null, 2);

            else if (lower.includes("vehicle"))
                section = JSON.stringify(caseData.vehicles, null, 2);

            else if (lower.includes("phone"))
                section = JSON.stringify(caseData.phones, null, 2);
            else if (lower.includes("district"))
                section = JSON.stringify(caseData.fir, null, 2);

            else if (lower.includes("crime"))
                section = JSON.stringify(caseData.fir, null, 2);

            else if (lower.includes("status"))
                section = JSON.stringify(caseData.investigation, null, 2);

            else if (lower.includes("station"))
                section = JSON.stringify(caseData.fir, null, 2);

            else if (lower.includes("officer"))
                section = JSON.stringify(caseData.investigation, null, 2);

            else if (lower.includes("financial"))
                section = JSON.stringify(caseData.transactions, null, 2);

            else if (lower.includes("transaction"))
                section = JSON.stringify(caseData.transactions, null, 2);

            else if (lower.includes("recommendation"))
                section = buildCaseContext(caseData);

            else if (lower.includes("summary"))
                section = buildCaseContext(caseData);

            const prompt = `
You are Karnataka State Police AI.

Current FIR:
${context.firId}

User Question:
${message}

Relevant Investigation Data:
${section}

Answer ONLY using the supplied data.

Never invent facts.
`;

            let aiReply =
                await askGLM(
                    INVESTIGATION_PROMPT,
                    prompt
                );

            if (userLanguage === "kn") {

                aiReply =
                    await translateToKannada(aiReply);

            }

            return {

                success: true,

                source: "Conversation Memory",

                type: "follow_up",

                answer: aiReply

            };

        }

    }
    // ======================================
    // CRIMINAL NETWORK ANALYSIS
    // ======================================

    if (
        intent === "network" &&
        firMatch
    ) {

        const firId =
            firMatch[0].toUpperCase();
        console.log("========== NETWORK.JS CALLED ==========");
        console.log("FIR:", firId);
        const network =
            await buildNetwork(
                req,
                firId
            );

        const prompt = `

You are Karnataka State Police Crime Intelligence AI.

Analyze the following criminal relationship network.

FIR:
${firId}

Network Data

${JSON.stringify(network, null, 2)}

Generate:

1. Criminal Network Summary

2. Important Relationships

3. Possible Organized Crime Indicators

4. Key Persons of Interest

5. Investigation Recommendations

Do not invent facts.

`;

        let report =
            await askGLM(
                INVESTIGATION_PROMPT,
                prompt
            );

        if (userLanguage === "kn") {

            report =
                await translateToKannada(report);

        }

        return {

            success: true,

            source: "Network Analysis",

            type: "network",

            network,

            report

        };

    }
    // ======================================
    // SIMILAR CASE RECOMMENDATION
    // ======================================

    if (
        intent === "similar" &&
        firMatch
    ) {

        const firId =
            firMatch[0].toUpperCase();

        const similar =
            await findSimilarCases(
                req,
                firId
            );

        const prompt = `

You are Karnataka State Police Crime Intelligence AI.

Current FIR

${firId}

Similar Cases

${JSON.stringify(similar, null, 2)}

Generate a professional report.

Include:

1. Best Matching FIRs

2. Similarity Score

3. Reasons for Similarity

4. Investigation Recommendations

Only use supplied data.

Do not invent facts.

`;

        let report =
            await askGLM(
                INVESTIGATION_PROMPT,
                prompt
            );

        if (userLanguage === "kn") {

            report =
                await translateToKannada(report);

        }

        return {

            success: true,

            source: "Similar Case Engine",

            type: "similar",

            currentFIR: firId,

            similarCases: similar,

            report

        };

    }
    // ======================================
    // CRIME ANALYTICS
    // ======================================

    if (intent === "analytics") {

        const analytics =
            await getCrimeAnalytics();

        return {

            success: true,

            source: "Crime Pattern Analytics",

            type: "analytics",

            analytics

        };

    }
    // ======================================
    // DATABASE SEARCH
    // ======================================
    const databaseResult =
        await searchCrimeDatabase(
            req,
            message
        );
    const prompt = `

You are Karnataka State Police AI.

User Question

${message}

Database Result

${JSON.stringify(databaseResult, null, 2)}

Answer naturally.

If there are no records,
say so clearly.

Never invent facts.

`;

    let aiReply =
        await askGLM(
            INVESTIGATION_PROMPT,
            prompt
        );

    if (userLanguage === "kn") {

        aiReply =
            await translateToKannada(aiReply);

    }

    return {

        success: true,

        source: "Database + GLM",

        type: databaseResult.type,

        database: databaseResult,

        answer: aiReply

    };
} module.exports = {
    processMessage
};