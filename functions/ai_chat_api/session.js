'use strict';

const sessions = new Map();

function saveContext(key, data) {

    sessions.set(key, data);

    console.log("Session Saved:", data);

}

function getContext(key) {

    const data = sessions.get(key);

    console.log("Session Loaded:", data);

    return data || null;

}

module.exports = {
    saveContext,
    getContext
};