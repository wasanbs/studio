// Import the Firebase SDK for Google Cloud Functions.
const { onRequest } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");

// Import and initialize the Firebase Admin SDK.
const admin = require("firebase-admin");
admin.initializeApp();

// Secret value is stored in Secret Manager.
const { defineSecret } = require("firebase-functions/params");

const apiKey = defineSecret("GENAI_API");

/**
 * HTTP Cloud Function to generate text from the Gemini API
 *
 * input: text
 * output: generatedText
 */
exports.genkit = onRequest(
  { secrets: ["GENAI_API"] },
  async (req, res) => {
    // Check if the 'prompt' parameter is present in the request body
    if (!req.body || !req.body.prompt) {
      res.status(400).send("Missing 'prompt' parameter in the request body");
      return;
    }

    // Access the value of the secret using apiKey.value()
    const generatedText = `You asked me to say ${req.body.prompt} I said it! Here is a frog 🐸. My secret key is ${apiKey.value()}`;

    // Send the generated text back to the client
    res.status(200).send({
      generatedText: generatedText,
    });
  }
);
