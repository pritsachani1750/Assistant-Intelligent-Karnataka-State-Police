'use strict';

const catalyst = require("zcatalyst-sdk-node");

async function saveContext(req, key, data) {

    console.log("===== saveContext CALLED =====");
    console.log(data);

    return;

}

async function getContext(req, key) {

    try {

        const app = catalyst.initialize(req);

        const cache = app.cache();

        const segment = cache.segment();

        const result = await segment.get(key);

        console.log("RAW CACHE:", result);

        if (!result || result.cache_value == null)
            return null;

        if (typeof result.cache_value === "string")
            return JSON.parse(result.cache_value);

        return result.cache_value;

    } catch (err) {

        console.error(err);

        return null;

    }

}

module.exports = {
    saveContext,
    getContext
};