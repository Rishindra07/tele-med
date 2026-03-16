// Symptom checker API for frontend
import API from "./axios";

/**
 * Check symptoms and get AI diagnosis
 * @param {string[]} symptoms - Array of symptom strings
 * @returns {Promise<Object>} Diagnosis result
 */
export const checkSymptoms = async (symptoms) => {
  return await API.post("/symptoms/check", { symptoms });
};
