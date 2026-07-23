'use strict';

const sessions = new Map();

function saveMemory(sessionId, data) {
    sessions.set(sessionId, data);
}

function getMemory(sessionId) {
    return sessions.get(sessionId) || null;
}

function clearMemory(sessionId) {
    sessions.delete(sessionId);
}

module.exports = {
    saveMemory,
    getMemory,
    clearMemory
};