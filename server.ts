import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Candidate, GOVERNORATES, QUALIFICATIONS, EXPERIENCE_LEVELS } from "./src/types.js";

const app = express();
const PORT = 3000;
const DB_FILE = path.join(process.cwd(), "candidates_db.json");

// Increase payload limit because CV files are sent in base64 format (up to 15MB)
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Ensure database file exists with a default empty array
function initDatabase() {
  if (!fs.existsSync(DB_FILE)) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify([], null, 2), "utf8");
      console.log("Database file created successfully.");
    } catch (err) {
      console.error("Error creating database file:", err);
    }
  }
}

// Helper to load candidates
function readCandidates(): Candidate[] {
  try {
    initDatabase();
    const data = fs.readFileSync(DB_FILE, "utf8");
    return JSON.parse(data) as Candidate[];
  } catch (err) {
    console.error("Error reading database file:", err);
    return [];
  }
}

// Helper to save candidates
function writeCandidates(candidates: Candidate[]): boolean {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(candidates, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("Error writing database file:", err);
    return false;
  }
}

// Simple admin passcode check
const ADMIN_PASSCODE = process.env.ADMIN_PASSCODE || "PrimeHR2026";

function verifyPasscode(req: express.Request): boolean {
  const codeHeader = req.headers["x-admin-passcode"] || req.query.passcode;
  return codeHeader === ADMIN_PASSCODE;
}

// ===================== API ROUTES =====================

// Endpoint to submit candidate registration
app.post("/api/candidates", (req, res) => {
  try {
    const {
      fullName,
      phone,
      age,
      governorate,
      qualification,
      specialization,
      experience,
      desiredTitle,
      cvFile,
    } = req.body;

    // Strict validation
    if (!fullName || typeof fullName !== "string" || fullName.trim().length === 0) {
      return res.status(400).json({ error: "الاسم الكامل مطلوب" });
    }
    if (!phone || typeof phone !== "string" || phone.trim().length === 0) {
      return res.status(400).json({ error: "رقم الهاتف مطلوب" });
    }
    const parsedAge = Number(age);
    if (!age || isNaN(parsedAge) || parsedAge <= 0) {
      return res.status(400).json({ error: "السن مطلوب ويجب أن يكون رقماً صحيحاً" });
    }
    if (!governorate || !GOVERNORATES.includes(governorate)) {
      return res.status(400).json({ error: "المحافظة المطلوبة غير صحيحة" });
    }
    if (!qualification || !QUALIFICATIONS.includes(qualification)) {
      return res.status(400).json({ error: "المؤهل الدراسي المطلوب غير صحيح" });
    }
    if (!experience || !EXPERIENCE_LEVELS.includes(experience)) {
      return res.status(400).json({ error: "سنوات الخبرة غير صحيحة" });
    }

    const uuid = "cand_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now();

    const newCandidate: Candidate = {
      id: uuid,
      fullName: fullName.trim(),
      phone: phone.trim(),
      age: parsedAge,
      governorate,
      qualification,
      specialization: (specialization || "").trim(),
      experience,
      desiredTitle: (desiredTitle || "").trim(),
      cvFile: cvFile ? {
        name: String(cvFile.name || "cv.pdf"),
        type: String(cvFile.type || "application/pdf"),
        size: Number(cvFile.size || 0),
        data: String(cvFile.data || ""), // Base64 string from browser
      } : undefined,
      submittedAt: new Date().toISOString(),
    };

    const candidates = readCandidates();
    candidates.push(newCandidate);
    const saveSuccess = writeCandidates(candidates);

    if (saveSuccess) {
      return res.status(201).json({ success: true, id: newCandidate.id });
    } else {
      return res.status(500).json({ error: "فشل حفظ البيانات بالخادم" });
    }
  } catch (err) {
    console.error("Submission error:", err);
    return res.status(500).json({ error: "حدث خطأ غير متوقع أثناء معالجة الطلب" });
  }
});

// Admin validation helper
const requireAdmin = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  if (!verifyPasscode(req)) {
    return res.status(401).json({ error: "غير مصرح - رمز المرور غير صحيح" });
  }
  next();
};

// Admin endpoint: Fetch candidates with search & filters
app.get("/api/candidates", requireAdmin, (req, res) => {
  try {
    const { searchTerm, specialization, governorate, experience, qualification } = req.query;
    let candidates = readCandidates();

    // Sorting by submission date descending
    candidates.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // Apply search filter
    if (searchTerm && typeof searchTerm === "string") {
      const q = searchTerm.toLowerCase().trim();
      candidates = candidates.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.desiredTitle.toLowerCase().includes(q)
      );
    }

    // Apply exact match filters
    if (specialization && typeof specialization === "string" && specialization.trim()) {
      const s = specialization.toLowerCase().trim();
      candidates = candidates.filter((c) => c.specialization.toLowerCase().includes(s));
    }
    if (governorate && typeof governorate === "string" && governorate.trim()) {
      candidates = candidates.filter((c) => c.governorate === governorate);
    }
    if (experience && typeof experience === "string" && experience.trim()) {
      candidates = candidates.filter((c) => c.experience === experience);
    }
    if (qualification && typeof qualification === "string" && qualification.trim()) {
      candidates = candidates.filter((c) => c.qualification === qualification);
    }

    return res.json({ candidates });
  } catch (err) {
    console.error("Fetch error:", err);
    return res.status(500).json({ error: "فشل تحميل قائمة المتقدمين" });
  }
});

// Admin endpoint: Delete candidate
app.delete("/api/candidates/:id", requireAdmin, (req, res) => {
  try {
    const { id } = req.params;
    let candidates = readCandidates();
    const lenBefore = candidates.length;
    candidates = candidates.filter((c) => c.id !== id);

    if (candidates.length === lenBefore) {
      return res.status(404).json({ error: "المرشح غير موجود" });
    }

    writeCandidates(candidates);
    return res.json({ success: true, message: "تم حذف بيانات المرشح بنجاح" });
  } catch (err) {
    console.error("Delete error:", err);
    return res.status(500).json({ error: "فشل حذف بيانات المرشح" });
  }
});

// Admin endpoint: Export candidates to CSV (for direct Excel opens in Arabic)
app.get("/api/candidates/export", requireAdmin, (req, res) => {
  try {
    const { searchTerm, specialization, governorate, experience, qualification } = req.query;
    let candidates = readCandidates();

    // Apply same filters as fetch
    if (searchTerm && typeof searchTerm === "string") {
      const q = searchTerm.toLowerCase().trim();
      candidates = candidates.filter(
        (c) =>
          c.fullName.toLowerCase().includes(q) ||
          c.phone.includes(q) ||
          c.desiredTitle.toLowerCase().includes(q)
      );
    }
    if (specialization && typeof specialization === "string" && specialization.trim()) {
      const s = specialization.toLowerCase().trim();
      candidates = candidates.filter((c) => c.specialization.toLowerCase().includes(s));
    }
    if (governorate && typeof governorate === "string" && governorate.trim()) {
      candidates = candidates.filter((c) => c.governorate === governorate);
    }
    if (experience && typeof experience === "string" && experience.trim()) {
      candidates = candidates.filter((c) => c.experience === experience);
    }
    if (qualification && typeof qualification === "string" && qualification.trim()) {
      candidates = candidates.filter((c) => c.qualification === qualification);
    }

    // Sort by newest first
    candidates.sort((a, b) => new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime());

    // Define CSV headers
    const headers = [
      "الاسم الكامل",
      "رقم الهاتف",
      "السن",
      "المحافظة",
      "المؤهل الدراسي",
      "مجال التخصص",
      "سنوات الخبرة",
      "المسمى الوظيفي المطلوب",
      "تاريخ التقديم",
    ];

    // Helper to escape values for CSV
    const escapeCsv = (val: string | number) => {
      const str = String(val === undefined || val === null ? "" : val);
      if (str.includes(",") || str.includes('"') || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    };

    // Build the CSV rows
    const rows = candidates.map((c) => [
      escapeCsv(c.fullName),
      escapeCsv(c.phone),
      escapeCsv(c.age),
      escapeCsv(c.governorate),
      escapeCsv(c.qualification),
      escapeCsv(c.specialization),
      escapeCsv(c.experience),
      escapeCsv(c.desiredTitle),
      escapeCsv(new Date(c.submittedAt).toLocaleString("ar-EG")),
    ]);

    // Use UTF-8 Byte Order Mark (BOM) for Arabic standard reading in Excel
    const csvContent =
      "\uFEFF" +
      [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");

    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=prime_hr_candidates_${Date.now()}.csv`
    );
    return res.send(csvContent);
  } catch (err) {
    console.error("Export error:", err);
    return res.status(500).send("فشل تصدير البيانات");
  }
});

// ===================== CLIENT SERVING MIDDLEWARE =====================

// Vite or Static files handling
async function startServer() {
  initDatabase();

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
  });
}

startServer();
