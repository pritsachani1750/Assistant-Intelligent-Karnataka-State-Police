'use strict';

const axios = require("axios");

// ===============================
// GET ACCESS TOKEN
// ===============================

async function getAccessToken() {

    const response = await axios.post(
        "https://accounts.zoho.in/oauth/v2/token",
        null,
        {
            params: {
                refresh_token:
                    '1000.3d45f81a487f25bc9c00d2902685382a.88e5625a8137f92306fc28f1fa6e1bd0',

                client_id:
                    '1000.712TQS6U2R6HXLTI926JCYP5050REK',

                client_secret:
                    'aeb6912da98d669fe43c7101280465e3a577eb9189',
                grant_type: "refresh_token"
            }
        }
    );

    return response.data.access_token;
}

// ===============================
// CALL GLM
// ===============================

async function askGLM(systemPrompt, userPrompt) {

    const accessToken = await getAccessToken();

    const response = await axios.post(

        "https://api.catalyst.zoho.in/quickml/v1/project/43167000000013025/glm/chat",

        {

            model: "crm-di-glm47b_30b_it",

            messages: [

                {
                    role: "system",
                    content: systemPrompt
                },

                {
                    role: "user",
                    content: userPrompt
                }

            ],

            temperature: 0.2,

            max_tokens: 1200,

            stream: false,

            chat_template_kwargs: {
                enable_thinking: false
            }

        },

        {

            headers: {

                "Authorization":
                    `Zoho-oauthtoken ${accessToken}`,

                "CATALYST-ORG":
                    "60073047935",

                "Content-Type":
                    "application/json"

            }

        }

    );

    return response.data.response;

}

module.exports = {
    askGLM
};