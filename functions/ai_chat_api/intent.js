'use strict';

// ==========================================
// Detect User Intent
// ==========================================

function detectIntent(message) {

    const text = message.toLowerCase();

    // ======================================
    // Criminal Network
    // ======================================
    if (

        text.includes("similar") ||
        text.includes("related") ||
        text.includes("same case") ||
        text.includes("past case") ||
        text.includes("similar case") ||
        text.includes("recommend case")

    ) {

        return "similar";

    } {

        return "network";

    }

    // ======================================
    // Crime Forecast
    // ======================================

    if (

        text.includes("forecast") ||
        text.includes("prediction") ||
        text.includes("future crime")

    ) {

        return "forecast";

    }

    // ======================================
    // Crime Analytics
    // ======================================

    if (

        text.includes("analytics") ||
        text.includes("analysis") ||
        text.includes("crime analytics") ||
        text.includes("crime analysis") ||
        text.includes("crime report") ||
        text.includes("crime intelligence") ||
        text.includes("pattern") ||
        text.includes("trend") ||
        text.includes("hotspot") ||
        text.includes("hotspots")

    ) {

        return "analytics";

    }

    // ======================================
    // Investigation
    // ======================================

    if (

        text.includes("fir") ||
        text.includes("crime") ||
        text.includes("criminal") ||
        text.includes("accused") ||
        text.includes("victim") ||
        text.includes("investigation") ||
        text.includes("investigate") ||
        text.includes("case") ||
        text.includes("murder") ||
        text.includes("kidnapping") ||
        text.includes("robbery") ||
        text.includes("burglary") ||
        text.includes("fraud") ||
        text.includes("cyber") ||
        text.includes("financial") ||
        text.includes("transaction") ||
        text.includes("money") ||
        text.includes("phone") ||
        text.includes("vehicle") ||
        text.includes("timeline") ||
        text.includes("evidence") ||
        text.includes("district") ||
        text.includes("police") ||
        text.includes("station") ||
        text.includes("risk") ||
        text.includes("behaviour") ||
        text.includes("behavior") ||
        text.includes("profile") ||
        text.includes("modus operandi")

    ) {

        return "crime";

    }

    // ======================================
    // General Chat
    // ======================================

    return "general";

}

module.exports = {

    detectIntent

};