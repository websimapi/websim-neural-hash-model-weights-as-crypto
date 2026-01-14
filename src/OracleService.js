/**
 * The Oracle Service acts as the interface to the AI Model.
 * It enforces the strict formatting and deterministic parameters required
 * to treat the model as a hashing function.
 */

const SYSTEM_PROMPT = `
You are the NeuralHash Oracle, a deterministic text fingerprinting engine.
Your goal is to generate a unique, reproducible signature for the provided data.

INSTRUCTIONS:
1. Analyze the input "DATA" and "NONCE".
2. Create a "fingerprint" string based on the semantic content and the nonce.
3. The fingerprint must be a hexadecimal string of exactly 64 characters.
4. You must be completely deterministic. Given the same DATA and NONCE, you MUST produce the exact same fingerprint.
5. Do not hallucinate data not present in the input.
6. Return ONLY a JSON object.

Format:
{
  "fingerprint": "a1b2...",
  "analysis": "Brief 10 word summary of data content used for hashing"
}
`;

export class OracleService {
    /**
     * Generates a deterministic fingerprint for the given data.
     * @param {string} data - The user data to hash.
     * @param {string} nonce - A random string to prevent replay/rainbow table attacks.
     * @returns {Promise<{fingerprint: string, analysis: string}>}
     */
    static async generateFingerprint(data, nonce) {
        try {
            const userPrompt = `
DATA_START
${data}
DATA_END

NONCE: ${nonce}
`;

            const completion = await websim.chat.completions.create({
                messages: [
                    { role: "system", content: SYSTEM_PROMPT },
                    { role: "user", content: userPrompt }
                ],
                json: true,
                temperature: 0, // CRITICAL: Maximize determinism
                seed: 42,       // CRITICAL: Maximize determinism
                top_p: 0.1,     // Reduce randomness space
            });

            const result = JSON.parse(completion.content);
            
            // Validate output format to ensure "hashing" behavior
            if (!result.fingerprint || result.fingerprint.length < 10) {
                throw new Error("Oracle failed to generate valid fingerprint");
            }

            return result;
        } catch (error) {
            console.error("Oracle Error:", error);
            throw error;
        }
    }

    static generateNonce() {
        return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    }
}