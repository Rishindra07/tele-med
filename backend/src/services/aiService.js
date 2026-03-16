const axios = require("axios");

/* ---------------- NORMALIZERS ---------------- */

function normalizeSymptoms(symptoms) {
  if (!Array.isArray(symptoms)) return [];
  return symptoms.map(s => s.toLowerCase().trim());
}

function normalizeSeverity(value = "") {
  value = value.toLowerCase();
  if (["high", "severe", "emergency"].includes(value)) return "high";
  if (["medium", "moderate"].includes(value)) return "medium";
  return "low";
}

/* ---------------- SAFE JSON PARSER ---------------- */

function safeParse(content) {
  try {
    content = content.replace(/```json|```/g, "");
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  } catch {
    throw new Error("INVALID_AI_RESPONSE");
  }
}

/* ---------------- CLOUD AI (OPENROUTER) ---------------- */

async function getCloudDiagnosis(symptoms) {
  const cleanSymptoms = normalizeSymptoms(symptoms);

  const prompt = `
You are a medical triage assistant for rural telehealth.

Symptoms: ${cleanSymptoms.join(", ")}

Return ONLY valid JSON:
{
  "conditions": ["condition name"],
  "severity": "low|medium|high",
  "advice": "short simple advice for patient"
}
`;

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "mistralai/mistral-7b-instruct",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost:5000",
          "X-Title": "Seva TeleHealth"
        },
        timeout: 7000
      }
    );

    const content = response.data.choices[0].message.content;
    const parsed = safeParse(content);

    return {
      source: "cloud",
      data: {
        conditions: parsed.conditions || [],
        severity: normalizeSeverity(parsed.severity),
        advice: parsed.advice || "Consult doctor if symptoms persist"
      }
    };

  } catch (err) {
    console.error("CLOUD AI ERROR:", err.response?.data || err.message);
    throw new Error("CLOUD_FAILED");
  }
}

/* ---------------- LOCAL MODEL DIAGNOSIS ---------------- */

async function getLocalDiagnosis(symptoms) {
  try {
    const response = await axios.post(
      process.env.AI_SERVICE_URL,
      { symptoms: normalizeSymptoms(symptoms) },
      { timeout: 4000 }
    );

    return {
      source: "local",
      data: {
        conditions: response.data.conditions || [],
        severity: normalizeSeverity(response.data.severity),
        advice: response.data.advice || "Consult doctor"
      }
    };

  } catch {
    throw new Error("LOCAL_FAILED");
  }
}

/* ---------------- HYBRID FALLBACK ---------------- */

const getDiagnosis = async (symptoms) => {

  try {
    console.log("AI: Using Cloud AI (OpenRouter)");
    return await getCloudDiagnosis(symptoms);
  } catch (err) {
    console.log("AI: Cloud failed → switching to Local AI");
  }

  try {
    return await getLocalDiagnosis(symptoms);
  } catch {
    throw new Error("ALL_AI_FAILED");
  }
};

module.exports = getDiagnosis;