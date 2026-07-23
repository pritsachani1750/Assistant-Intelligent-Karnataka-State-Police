'use strict';

const { askGLM } = require("./glm");

// ================================
// Detect Kannada
// ================================

function isKannada(text) {

    const kannadaRegex = /[\u0C80-\u0CFF]/;

    return kannadaRegex.test(text);

}

// ================================
// Kannada → English
// ================================

async function translateToEnglish(text) {

    const prompt = `

You are a professional translator.

Translate the following Kannada text into English.

Return ONLY the translated English sentence.

Text:

${text}

`;

    return await askGLM("", prompt);

}

// ================================
// English → Kannada
// ================================

async function translateToKannada(text) {

    const prompt = `

You are a professional translator.

Translate the following English text into natural Kannada.

Return ONLY the Kannada translation.

Text:

${text}

`;

    return await askGLM("", prompt);

}

module.exports = {

    isKannada,
    translateToEnglish,
    translateToKannada

};