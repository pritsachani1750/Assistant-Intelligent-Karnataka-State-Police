'use strict';

const axios = require("axios");

async function getCrimeAnalytics() {

    const response = await axios.get(
        "http://localhost:3000/server/crime_pattern_analysis"
    );

    return response.data;

}

module.exports = {
    getCrimeAnalytics
};