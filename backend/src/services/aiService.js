const axios = require("axios");

const DEFAULT_OPENROUTER_MODELS = [
  "mistralai/mistral-small-3.2-24b-instruct",
  "mistralai/mistral-small-24b-instruct-2501",
  "mistralai/mistral-7b-instruct:free"
];

/* ---------------- NORMALIZERS ---------------- */

function normalizeSymptoms(symptoms) {
  if (!Array.isArray(symptoms)) return [];
  return symptoms.map((s) => s.toLowerCase().trim());
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
    content = String(content || "").replace(/```json|```/g, "");
    const match = content.match(/\{[\s\S]*\}/);
    if (!match) throw new Error("No JSON found");
    return JSON.parse(match[0]);
  } catch {
    throw new Error("INVALID_AI_RESPONSE");
  }
}

function getCloudModels() {
  const configured = process.env.OPENROUTER_MODELS || process.env.OPENROUTER_MODEL || "";
  const parsed = configured
    .split(",")
    .map((model) => model.trim())
    .filter(Boolean);

  return parsed.length > 0 ? parsed : DEFAULT_OPENROUTER_MODELS;
}

/* ---------------- CLOUD AI (OPENROUTER) ---------------- */

async function getCloudDiagnosis(symptoms) {
  const cleanSymptoms = normalizeSymptoms(symptoms);
  const models = getCloudModels();

  const prompt = `
You are a medical triage assistant for rural telehealth.

Symptoms: ${cleanSymptoms.join(", ")}

Return ONLY valid JSON:
{
  "conditions": ["condition name"],
  "severity": "low|medium|high",
  "advice": "short simple advice for patient",
  "suggestedSpecialization": "Recommended medical specialization (e.g. Cardiologist, Neurologist, General Physician, etc.)"
}
`;

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY missing");
    }

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        models,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.1,
        max_tokens: 300
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

    const content = response.data?.choices?.[0]?.message?.content;
    if (!content) {
      throw new Error("EMPTY_CLOUD_RESPONSE");
    }

    const parsed = safeParse(content);

    return {
      source: "cloud",
      data: {
        conditions: parsed.conditions || [],
        severity: normalizeSeverity(parsed.severity),
        advice: parsed.advice || "Consult doctor if symptoms persist",
        suggestedSpecialization: parsed.suggestedSpecialization || "General Physician"
      }
    };
  } catch (err) {
    console.error("CLOUD AI ERROR:", {
      models,
      error: err.response?.data || err.message
    });
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
  } catch (err) {
    console.error("LOCAL AI ERROR:", err.response?.data || err.message);
    throw new Error("LOCAL_FAILED");
  }
}

/* ---------------- HYBRID FALLBACK ---------------- */

const getDiagnosis = async (symptoms) => {
  try {
    console.log("AI: Using Cloud AI (OpenRouter)");
    return await getCloudDiagnosis(symptoms);
  } catch (err) {
    console.log("AI: Cloud failed -> switching to Local AI");
  }

  try {
    return await getLocalDiagnosis(symptoms);
  } catch {
    throw new Error("ALL_AI_FAILED");
  }
};

module.exports = getDiagnosis;
