const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

exports.extractMedicines = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const filePath = req.file.path;
    console.log(`[OCR] Processing file: ${filePath}`);

    const { data: { text } } = await Tesseract.recognize(filePath, 'eng', {
      logger: m => console.log(`[OCR PROGRESS] ${m.status}: ${m.progress}`)
    });

    // Simple parsing logic (Demo purpose)
    // Looking for patterns like "Medicine Name 500mg 10 tablets"
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const medicines = [];

    lines.forEach(line => {
      // Very basic regex to identify potential medicine lines
      // Typically: [Name] [Dosage] [Qty]
      const dosageMatch = line.match(/(\d+\s*(mg|mcg|ml|g))/i);
      const qtyMatch = line.match(/(\d+)\s*(tabs|tablets|caps|capsules|units)/i);
      
      if (dosageMatch || line.length > 5) {
         const name = line.replace(dosageMatch?.[0] || '', '').replace(qtyMatch?.[0] || '', '').trim();
         if (name.length > 2) {
           medicines.push({
             name: name,
             dosage: dosageMatch ? dosageMatch[0] : "As prescribed",
             quantity: qtyMatch ? parseInt(qtyMatch[1]) : 10,
             frequency: "Twice a day", // Default or extracted
             instructions: "After meals"
           });
         }
      }
    });

    // If no medicines found by regex, just return the lines as names
    const finalMedicines = medicines.length > 0 ? medicines : lines.slice(0, 5).map(line => ({
        name: line.trim(),
        dosage: "500mg",
        quantity: 10,
        frequency: "Twice a day",
        instructions: "After meals"
    }));

    return res.json({
      success: true,
      text: text,
      medicines: finalMedicines
    });

  } catch (error) {
    console.error("[OCR ERROR]", error);
    res.status(500).json({ success: false, message: "Failed to extract text from prescription" });
  }
};
