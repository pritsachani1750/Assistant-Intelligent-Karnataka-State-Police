const fs = require('fs');
const filePath = 'c:/Users/Prit Sachani/Music/ksp/functions/ai_chat_api/router.js';
let content = fs.readFileSync(filePath, 'utf8');

const firstReplace = `
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

        console.log("Translated to English:", message);

    }

    const intent = detectIntent(message);
`;

content = content.replace(
    /async function processMessage\(req,\s*message\)\s*\{\s*const intent = detectIntent\(message\);/,
    firstReplace
);

const secondReplace = `}

module.exports = {
    processMessage
};
`;

content = content.replace(
    /[\t ]*async function processMessage\(req,\s*message\)\s*\{[\s\S]*?module\.exports = \{[\s\S]*?processMessage[\s\S]*?\};\s*\}/,
    secondReplace
);

fs.writeFileSync(filePath, content);
console.log('Fixed router.js');
