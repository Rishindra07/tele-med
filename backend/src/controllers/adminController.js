const Complaint = require("../models/Complaint.js");
const Consultation = require("../models/Consultation.js");
const Doctor = require("../models/Doctor.js");
const HealthRecord = require("../models/HealthRecord.js");
const Patient = require("../models/Patient.js");
const Pharmacy = require("../models/Pharmacy.js");
const PharmacyStock = require("../models/PharmacyStock.js");
const Prescription = require("../models/Prescription.js");
const SymptomLog = require("../models/SymptomLog.js");
const SystemLog = require("../models/SystemLog.js");
const User = require("../models/User.js");
const GlobalSetting = require("../models/GlobalSetting.js");

const startOfDay = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
const startOfMonth = (date) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));
const addMonthsUtc = (date, months) => new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + months, 1));
const startOfWeek = (date) => new Date(startOfDay(date).getTime() - 6 * 24 * 60 * 60 * 1000);

const toMonthKey = (date) => {
  const parsed = new Date(date);
  return `${parsed.getUTCFullYear()}-${String(parsed.getUTCMonth() + 1).padStart(2, "0")}`;
};

const formatMonthLabel = (date) =>
  date.toLocaleDateString("en-GB", { month: "short", timeZone: "UTC" });

const detectStateFromAddress = (value) => {
  if (!value) return "Unknown";
  const raw = String(value).trim();
  if (!raw) return "Unknown";

  const parts = raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  return parts[parts.length - 1] || "Unknown";
};

const isLikelyRuralAddress = (value) => {
  if (!value) return false;
  const normalized = String(value).toLowerCase();
  const majorUrbanMarkers = [
    "mumbai",
    "delhi",
    "new delhi",
    "bengaluru",
    "bangalore",
    "pune",
    "hyderabad",
    "chennai",
    "kolkata",
    "ahmedabad",
    "jaipur",
    "lucknow"
  ];

  return !majorUrbanMarkers.some((marker) => normalized.includes(marker));
};

const stateCodeMap = {
  Punjab: "PB",
  "Uttar Pradesh": "UP",
  Maharashtra: "MH",
  Rajasthan: "RJ",
  Bihar: "BR",
  "Madhya Pradesh": "MP",
  Haryana: "HR",
  Delhi: "DL",
  "New Delhi": "DL",
  Gujarat: "GJ",
  Karnataka: "KA",
  Telangana: "TS",
  "Tamil Nadu": "TN",
  Kerala: "KL",
  "West Bengal": "WB",
  Odisha: "OD",
  Assam: "AS",
  Chhattisgarh: "CG",
  Jharkhand: "JH",
  Uttarakhand: "UK",
  "Himachal Pradesh": "HP",
  Jammu: "JK",
  Kashmir: "JK"
};

const getStateCode = (state) => {
  if (!state) return null;
  const normalized = String(state).trim();
  if (normalized.length <= 3) return normalized.toUpperCase();
  return stateCodeMap[normalized] || normalized.slice(0, 2).toUpperCase();
};

const buildPatientRegistryId = (user) => {
  if (!user?._id) return "SVT-UNKNOWN";
  const year = new Date(user.createdAt || Date.now()).getUTCFullYear();
  const objectIdTail = String(user._id).slice(-6);
  const numericTail = Number.parseInt(objectIdTail, 16);
  const serial = Number.isFinite(numericTail) ? String(numericTail % 100000).padStart(5, "0") : "00000";
  return `SVT-${year}-${serial}`;
};

const parseLocation = (address) => {
  if (!address) {
    return {
      city: null,
      state: null,
      label: "Not added"
    };
  }

  const parts = String(address)
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

  const city = parts[0] || null;
  const state = parts[parts.length - 1] || null;
  const code = getStateCode(state);

  return {
    city,
    state,
    label: city && code ? `${city}, ${code}` : city || state || "Not added"
  };
};

const getAgeFromDob = (dob) => {
  if (!dob) return null;
  const parsed = new Date(dob);
  if (Number.isNaN(parsed.getTime())) return null;
  const now = new Date();
  let age = now.getUTCFullYear() - parsed.getUTCFullYear();
  const hasBirthdayPassed =
    now.getUTCMonth() > parsed.getUTCMonth() ||
    (now.getUTCMonth() === parsed.getUTCMonth() && now.getUTCDate() >= parsed.getUTCDate());
  if (!hasBirthdayPassed) age -= 1;
  return age >= 0 && age <= 120 ? age : null;
};

const getCompletionPercentage = (profile = {}) => {
  const checks = [
    Boolean(profile.address),
    Boolean(profile.dob),
    Boolean(profile.gender),
    Boolean(profile.bloodGroup),
    Array.isArray(profile.allergies),
    Array.isArray(profile.chronicDiseases),
    Boolean(profile.emergency_contact?.name),
    Boolean(profile.emergency_contact?.phone),
    Boolean(profile.vitals?.height_cm),
    Boolean(profile.vitals?.weight_kg)
  ];

  const completed = checks.filter(Boolean).length;
  return Math.round((completed / checks.length) * 100);
};

const formatMinutesAgo = (value) => {
  if (!value) return "Recent";
  const diffMinutes = Math.max(0, Math.round((Date.now() - new Date(value).getTime()) / 60000));
  if (diffMinutes < 1) return "Just now";
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  const diffHours = Math.round(diffMinutes / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
};

const formatLiveDuration = (startTime) => {
  if (!startTime) return "Live";
  const diffMinutes = Math.max(1, Math.round((Date.now() - new Date(startTime).getTime()) / 60000));
  return `Live ${diffMinutes}m`;
};

const formatTimeSlotLabel = (date) =>
  new Date(date).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" });

const csvEscape = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const buildAnalyticsPayload = async () => {
  const now = new Date();
  const dayStart = startOfDay(now);
  const weekStart = new Date(dayStart.getTime() - 6 * 24 * 60 * 60 * 1000);
  const monthStart = startOfMonth(now);
  const previousMonthStart = addMonthsUtc(monthStart, -1);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const monthlySeriesStart = addMonthsUtc(monthStart, -11);

  const [
    consultationsToday,
    consultationsWeek,
    consultationsMonth,
    activeUsersByRole,
    commonHealthIssues,
    fulfillmentStatusCounts,
    completedConsultations,
    systemHealth,
    pendingApprovals,
    complaintSummary,
    totalPatients,
    currentMonthPatients,
    previousMonthPatients,
    patientMonthSeries,
    consultationMonthSeries,
    patientsWithConsultations,
    patientsWithRepeatConsultations,
    patientsByState,
    patientProfiles,
    consultationModeCounts,
    consultationHourCounts,
    totalConsultationsPast30Days,
    symptomUsageStats
  ] = await Promise.all([
    Consultation.countDocuments({ createdAt: { $gte: dayStart } }),
    Consultation.countDocuments({ createdAt: { $gte: weekStart } }),
    Consultation.countDocuments({ createdAt: { $gte: monthStart } }),
    User.aggregate([
      {
        $match: {
          is_active: true,
          $or: [
            { role: "patient" },
            { role: "admin" },
            { role: { $in: ["doctor", "pharmacist"] }, is_approved: true }
          ]
        }
      },
      { $group: { _id: "$role", count: { $sum: 1 } } }
    ]),
    SymptomLog.aggregate([
      { $project: { issues: { $cond: [{ $gt: [{ $size: "$predictedConditions" }, 0] }, "$predictedConditions", "$symptoms"] } } },
      { $unwind: "$issues" },
      { $group: { _id: "$issues", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]),
    Prescription.aggregate([
      { $group: { _id: "$fulfillmentStatus", count: { $sum: 1 } } }
    ]),
    Consultation.find({ status: "Completed" }).select("createdAt updatedAt").lean(),
    Promise.all([
      SystemLog.countDocuments({ level: "error", createdAt: { $gte: last24h } }),
      SystemLog.aggregate([
        { $match: { createdAt: { $gte: last24h } } },
        { $group: { _id: null, avgDurationMs: { $avg: "$durationMs" } } }
      ]),
      SystemLog.find().sort({ createdAt: -1 }).limit(10).lean()
    ]),
    User.find({ role: { $in: ["doctor", "pharmacist"] }, is_approved: false })
      .select("full_name email role createdAt")
      .lean(),
    Complaint.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } }
    ]),
    User.countDocuments({ role: "patient", is_active: true }),
    User.countDocuments({ role: "patient", createdAt: { $gte: monthStart } }),
    User.countDocuments({ role: "patient", createdAt: { $gte: previousMonthStart, $lt: monthStart } }),
    User.aggregate([
      {
        $match: {
          role: "patient",
          createdAt: { $gte: monthlySeriesStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Consultation.aggregate([
      {
        $match: {
          createdAt: { $gte: monthlySeriesStart }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      }
    ]),
    Consultation.distinct("patient"),
    Consultation.aggregate([
      { $group: { _id: "$patient", totalConsultations: { $sum: 1 } } },
      { $match: { totalConsultations: { $gte: 2 } } },
      { $count: "count" }
    ]),
    Patient.aggregate([
      {
        $project: {
          state: {
            $let: {
              vars: {
                splitAddress: { $split: [{ $ifNull: ["$address", "Unknown"] }, ","] }
              },
              in: { $arrayElemAt: ["$$splitAddress", -1] }
            }
          }
        }
      },
      {
        $group: {
          _id: { $trim: { input: "$state" } },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 8 }
    ]),
    Patient.find({}).select("address").lean(),
    Consultation.aggregate([
      { $group: { _id: "$consultationMode", count: { $sum: 1 } } }
    ]),
    Consultation.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: { $hour: "$createdAt" },
          count: { $sum: 1 }
        }
      }
    ]),
    Consultation.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    SymptomLog.aggregate([
      {
        $group: {
          _id: null,
          totalLogs: { $sum: 1 },
          uniquePatients: { $addToSet: "$patient" },
          offlineChecks: {
            $sum: {
              $cond: [{ $in: ["$aiSource", ["local", "offline_rule_based"]] }, 1, 0]
            }
          }
        }
      }
    ])
  ]);

  const roleCounts = activeUsersByRole.reduce((acc, entry) => {
    acc[entry._id] = entry.count;
    return acc;
  }, {});

  const fulfillmentMap = fulfillmentStatusCounts.reduce((acc, entry) => {
    acc[entry._id || "Pending"] = entry.count;
    return acc;
  }, {});
  const totalFulfillment = Object.values(fulfillmentMap).reduce((sum, count) => sum + count, 0);
  const fulfilledCount = (fulfillmentMap.Ready || 0) + (fulfillmentMap.Completed || 0) + (fulfillmentMap["Partially Available"] || 0);
  const fulfillmentRate = totalFulfillment ? Number(((fulfilledCount / totalFulfillment) * 100).toFixed(1)) : 0;

  const averageConsultationDurationMinutes = completedConsultations.length
    ? Number((
        completedConsultations.reduce((sum, consultation) => {
          const createdAt = new Date(consultation.createdAt).getTime();
          const updatedAt = new Date(consultation.updatedAt).getTime();
          return sum + Math.max(updatedAt - createdAt, 0);
        }, 0) /
        completedConsultations.length /
        60000
      ).toFixed(1))
    : 0;

  const [errorCount24h, avgResponseAgg, recentLogs] = systemHealth;
  const patientGrowthRate = previousMonthPatients
    ? Number((((currentMonthPatients - previousMonthPatients) / previousMonthPatients) * 100).toFixed(1))
    : currentMonthPatients > 0
      ? 100
      : 0;
  const consultationsPerDay = Number((consultationsWeek / 7).toFixed(1));
  const consultationsDayGrowth = consultationsWeek ? Number(((consultationsToday / Math.max(consultationsWeek / 7, 1)) * 100 - 100).toFixed(1)) : 0;
  const retentionRate = totalPatients ? Number((((patientsWithRepeatConsultations[0]?.count || 0) / totalPatients) * 100).toFixed(1)) : 0;
  const monthlyLabels = Array.from({ length: 12 }, (_, index) => addMonthsUtc(monthlySeriesStart, index));
  const patientSeriesMap = new Map(
    patientMonthSeries.map((entry) => [
      `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
      entry.count
    ])
  );
  const consultationSeriesMap = new Map(
    consultationMonthSeries.map((entry) => [
      `${entry._id.year}-${String(entry._id.month).padStart(2, "0")}`,
      entry.count
    ])
  );
  const monthlyGrowth = monthlyLabels.map((date) => {
    const key = toMonthKey(date);
    return {
      label: formatMonthLabel(date),
      newPatients: patientSeriesMap.get(key) || 0,
      consultations: consultationSeriesMap.get(key) || 0
    };
  });
  const consultationModeMap = consultationModeCounts.reduce((acc, entry) => {
    acc[entry._id || "video"] = entry.count;
    return acc;
  }, {});
  const totalModeCount = Object.values(consultationModeMap).reduce((sum, count) => sum + count, 0);
  const modePercent = (count) => totalModeCount ? Number(((count / totalModeCount) * 100).toFixed(1)) : 0;
  const hourMap = new Map(consultationHourCounts.map((entry) => [entry._id, entry.count]));
  const hourlyConsultations = Array.from({ length: 24 }, (_, hour) => ({
    hour,
    count: hourMap.get(hour) || 0
  }));
  const symptomSummary = symptomUsageStats[0] || { totalLogs: 0, uniquePatients: [], offlineChecks: 0 };
  const symptomCheckerUsageRate = totalPatients ? Number(((symptomSummary.uniquePatients.length / totalPatients) * 100).toFixed(1)) : 0;
  const offlineUsageRate = symptomSummary.totalLogs ? Number(((symptomSummary.offlineChecks / symptomSummary.totalLogs) * 100).toFixed(1)) : 0;
  const ruralPatients = patientProfiles.filter((profile) => isLikelyRuralAddress(profile.address)).length;
  const ruralPatientRate = patientProfiles.length ? Number(((ruralPatients / patientProfiles.length) * 100).toFixed(1)) : 0;
  const topStates = patientsByState.map((entry) => ({
    state: entry._id || "Unknown",
    patients: entry.count
  }));
  const followUpCount = await Consultation.countDocuments({ status: "FollowUp" });
  const escalatedCount = await Complaint.countDocuments({});
  const totalConsultationsAll = await Consultation.countDocuments({});
  const prescribedCount = await Prescription.countDocuments({});
  const consultationOutcomePercent = (count) => totalConsultationsAll ? Number(((count / totalConsultationsAll) * 100).toFixed(1)) : 0;

  return {
    consultations: {
      today: consultationsToday,
      week: consultationsWeek,
      month: consultationsMonth
    },
    growth: {
      totalPatients,
      patientGrowthRate,
      consultationsPerDay,
      consultationsDayGrowth,
      retentionRate
    },
    activeUsers: {
      patients: roleCounts.patient || 0,
      doctors: roleCounts.doctor || 0,
      pharmacists: roleCounts.pharmacist || 0
    },
    commonHealthIssues: commonHealthIssues.map((entry) => ({
      issue: entry._id,
      count: entry.count
    })),
    pharmacyFulfillment: {
      rate: fulfillmentRate,
      breakdown: fulfillmentMap
    },
    averageConsultationDurationMinutes,
    monthlyGrowth,
    acquisition: {
      appInstalls: totalPatients,
      registrations: currentMonthPatients,
      firstConsultation: patientsWithConsultations.length,
      retained30d: patientsWithRepeatConsultations[0]?.count || 0,
      registrationRate: totalPatients ? Number(((currentMonthPatients / totalPatients) * 100).toFixed(1)) : 0,
      firstConsultationRate: totalPatients ? Number(((patientsWithConsultations.length / totalPatients) * 100).toFixed(1)) : 0,
      retained30dRate: retentionRate
    },
    consultationOutcomes: {
      prescriptionIssued: consultationOutcomePercent(prescribedCount),
      followUpBooked: consultationOutcomePercent(followUpCount),
      escalated: consultationOutcomePercent(escalatedCount)
    },
    consultationModes: {
      video: modePercent(consultationModeMap.video || 0),
      audio: modePercent(consultationModeMap.audio || 0),
      chat: modePercent(consultationModeMap.chat || 0)
    },
    topStates,
    hourlyConsultations,
    engagement: {
      avgSessionDurationMinutes: averageConsultationDurationMinutes,
      symptomCheckerUsageRate,
      offlineModeUsageRate: offlineUsageRate,
      ruralPatientRate
    },
    system: {
      uptimeSeconds: Math.floor(process.uptime()),
      uptimeHours: Number((process.uptime() / 3600).toFixed(2)),
      avgResponseTimeMs: Number((avgResponseAgg[0]?.avgDurationMs || 0).toFixed(1)),
      errorCount24h,
      recentLogs
    },
    pendingApprovals,
    complaints: complaintSummary.reduce((acc, entry) => {
      acc[entry._id] = entry.count;
      return acc;
    }, {})
  };
};

exports.getDashboardAnalytics = async (req, res) => {
  try {
    const analytics = await buildAnalyticsPayload();

    res.json({
      success: true,
      analytics
    });
  } catch (error) {
    console.error("[ADMIN] analytics failed", error);
    res.status(500).json({ message: "Failed to load admin analytics" });
  }
};

exports.getPendingApprovals = async (req, res) => {
  try {
    const users = await User.find({
      role: { $in: ["doctor", "pharmacist"] },
      is_approved: false
    })
      .sort({ createdAt: 1 })
      .select("full_name email role is_approved createdAt");

    res.json({
      success: true,
      users
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load pending approvals" });
  }
};

exports.getDoctorsDirectory = async (req, res) => {
  try {
    const [doctorUsers, doctorProfiles, consultationStats, prescriptionStats] = await Promise.all([
      User.find({ role: "doctor" })
        .select("full_name email phone is_active is_approved approved_at createdAt")
        .lean(),
      Doctor.find({})
        .select("user specialization hospitalName medicalLicense rating consultationFee experience qualification")
        .lean(),
      Consultation.aggregate([
        { $group: { _id: "$doctor", consultations: { $sum: 1 } } }
      ]),
      Prescription.aggregate([
        { $group: { _id: "$doctor", prescriptions: { $sum: 1 } } }
      ])
    ]);

    const profileMap = new Map(doctorProfiles.map((profile) => [String(profile.user), profile]));
    const consultationMap = new Map(consultationStats.map((item) => [String(item._id), item.consultations]));
    const prescriptionMap = new Map(prescriptionStats.map((item) => [String(item._id), item.prescriptions]));

    const doctors = doctorUsers.map((user) => {
      const profile = profileMap.get(String(user._id));
      return {
        userId: user._id,
        full_name: user.full_name,
        email: user.email,
        phone: user.phone,
        is_active: user.is_active,
        is_approved: user.is_approved,
        approved_at: user.approved_at,
        createdAt: user.createdAt,
        specialization: profile?.specialization || null,
        hospitalName: profile?.hospitalName || null,
        medicalLicense: profile?.medicalLicense || null,
        rating: profile?.rating || 0,
        consultationFee: profile?.consultationFee || 0,
        experience: profile?.experience || 0,
        qualification: profile?.qualification || null,
        totalConsultations: consultationMap.get(String(user._id)) || 0,
        totalPrescriptions: prescriptionMap.get(String(user._id)) || 0
      };
    });

    return res.json({
      success: true,
      doctors
    });
  } catch (error) {
    console.error("[ADMIN] doctors directory failed", error);
    return res.status(500).json({ message: "Failed to load doctors directory" });
  }
};

exports.getPharmaciesDirectory = async (req, res) => {
  try {
    const [pharmacyUsers, pharmacyProfiles, stockStats, prescriptionStats] = await Promise.all([
      User.find({ role: "pharmacist" })
        .select("full_name email phone is_active is_approved approved_at createdAt")
        .lean(),
      Pharmacy.find({})
        .select("user pharmacyName licenseNumber location distanceKm isJanAushadhi openTime closeTime phone")
        .lean(),
      PharmacyStock.aggregate([
        {
          $group: {
            _id: "$pharmacy",
            totalStockItems: { $sum: 1 },
            lowStockItems: {
              $sum: {
                $cond: [
                  {
                    $and: [
                      { $gt: ["$quantity", 0] },
                      { $lte: ["$quantity", "$lowStockThreshold"] }
                    ]
                  },
                  1,
                  0
                ]
              }
            },
            outOfStockItems: {
              $sum: {
                $cond: [{ $lte: ["$quantity", 0] }, 1, 0]
              }
            }
          }
        }
      ]),
      Prescription.aggregate([
        {
          $match: { assignedPharmacy: { $ne: null } }
        },
        {
          $group: {
            _id: "$assignedPharmacy",
            totalPrescriptions: { $sum: 1 },
            completedPrescriptions: {
              $sum: {
                $cond: [{ $eq: ["$fulfillmentStatus", "Completed"] }, 1, 0]
              }
            },
            readyPrescriptions: {
              $sum: {
                $cond: [{ $eq: ["$fulfillmentStatus", "Ready"] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const userMap = new Map(pharmacyUsers.map((user) => [String(user._id), user]));
    const stockMap = new Map(stockStats.map((item) => [String(item._id), item]));
    const prescriptionMap = new Map(prescriptionStats.map((item) => [String(item._id), item]));

    const pharmacies = pharmacyProfiles.map((profile) => {
      const user = userMap.get(String(profile.user));
      const stock = stockMap.get(String(profile._id));
      const prescription = prescriptionMap.get(String(profile._id));
      const totalPrescriptions = prescription?.totalPrescriptions || 0;
      const fulfillmentRate = totalPrescriptions
        ? Number((((prescription?.completedPrescriptions || 0) / totalPrescriptions) * 100).toFixed(1))
        : 0;

      return {
        pharmacyId: profile._id,
        userId: profile.user,
        full_name: user?.full_name || null,
        email: user?.email || null,
        phone: user?.phone || profile.phone || null,
        is_active: user?.is_active ?? true,
        is_approved: user?.is_approved ?? false,
        approved_at: user?.approved_at || null,
        createdAt: user?.createdAt || profile.createdAt,
        pharmacyName: profile.pharmacyName,
        licenseNumber: profile.licenseNumber,
        isJanAushadhi: profile.isJanAushadhi,
        location: profile.location || {},
        distanceKm: profile.distanceKm,
        operatingHours: [profile.openTime, profile.closeTime].filter(Boolean).join(" - ") || null,
        totalStockItems: stock?.totalStockItems || 0,
        lowStockItems: stock?.lowStockItems || 0,
        outOfStockItems: stock?.outOfStockItems || 0,
        totalPrescriptions,
        completedPrescriptions: prescription?.completedPrescriptions || 0,
        readyPrescriptions: prescription?.readyPrescriptions || 0,
        fulfillmentRate
      };
    });

    return res.json({
      success: true,
      pharmacies
    });
  } catch (error) {
    console.error("[ADMIN] pharmacies directory failed", error);
    return res.status(500).json({ message: "Failed to load pharmacies directory" });
  }
};

exports.getPatientsRegistry = async (req, res) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const monthStart = startOfMonth(now);
    const twoDaysAgo = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000);

    const patientUsers = await User.find({ role: "patient" })
      .select("full_name phone email is_active createdAt last_login_at")
      .sort({ createdAt: -1 })
      .lean();

    const patientIds = patientUsers.map((user) => user._id);

    const [
      patientProfiles,
      consultationStats,
      duplicatePrescriptionStats,
      complaintStats
    ] = await Promise.all([
      Patient.find({ user: { $in: patientIds } })
        .select("user address dob gender bloodGroup allergies chronicDiseases emergency_contact vitals")
        .lean(),
      Consultation.aggregate([
        { $match: { patient: { $in: patientIds } } },
        {
          $group: {
            _id: "$patient",
            totalConsultations: { $sum: 1 },
            monthConsultations: {
              $sum: {
                $cond: [{ $gte: ["$createdAt", monthStart] }, 1, 0]
              }
            }
          }
        }
      ]),
      Prescription.aggregate([
        { $match: { patient: { $in: patientIds }, createdAt: { $gte: twoDaysAgo } } },
        {
          $group: {
            _id: "$patient",
            duplicatePrescriptions2d: { $sum: 1 }
          }
        }
      ]),
      Complaint.aggregate([
        { $match: { againstUser: { $in: patientIds } } },
        {
          $group: {
            _id: "$againstUser",
            totalComplaints: { $sum: 1 },
            openComplaints: {
              $sum: {
                $cond: [{ $ne: ["$status", "Resolved"] }, 1, 0]
              }
            }
          }
        }
      ])
    ]);

    const profileMap = new Map(patientProfiles.map((profile) => [String(profile.user), profile]));
    const consultationMap = new Map(consultationStats.map((item) => [String(item._id), item]));
    const duplicateMap = new Map(duplicatePrescriptionStats.map((item) => [String(item._id), item.duplicatePrescriptions2d]));
    const complaintMap = new Map(complaintStats.map((item) => [String(item._id), item]));

    const conditionCounts = new Map();
    const stateCounts = new Map();
    let totalAge = 0;
    let ageCount = 0;
    let maleCount = 0;
    let femaleCount = 0;
    let ruralCount = 0;
    let profileCompleteCount = 0;

    const patients = patientUsers.map((user) => {
      const profile = profileMap.get(String(user._id)) || {};
      const location = parseLocation(profile.address);
      const age = getAgeFromDob(profile.dob);
      const completionPercentage = getCompletionPercentage(profile);
      const consultations = consultationMap.get(String(user._id)) || { totalConsultations: 0, monthConsultations: 0 };
      const duplicatePrescriptions2d = duplicateMap.get(String(user._id)) || 0;
      const complaintEntry = complaintMap.get(String(user._id)) || { totalComplaints: 0, openComplaints: 0 };
      const chronicDiseases = Array.isArray(profile.chronicDiseases) ? profile.chronicDiseases.filter(Boolean) : [];

      chronicDiseases.forEach((condition) => {
        conditionCounts.set(condition, (conditionCounts.get(condition) || 0) + 1);
      });

      if (location.state) {
        stateCounts.set(location.state, (stateCounts.get(location.state) || 0) + 1);
      }

      if (age !== null) {
        totalAge += age;
        ageCount += 1;
      }

      if (profile.gender === "Male") maleCount += 1;
      if (profile.gender === "Female") femaleCount += 1;
      if (isLikelyRuralAddress(profile.address)) ruralCount += 1;
      if (completionPercentage >= 70) profileCompleteCount += 1;

      return {
        userId: user._id,
        registryId: buildPatientRegistryId(user),
        full_name: user.full_name,
        email: user.email,
        phone: user.phone || "Not added",
        is_active: user.is_active,
        createdAt: user.createdAt,
        last_login_at: user.last_login_at,
        location,
        state: location.state || "Unknown",
        age,
        gender: profile.gender || "Unknown",
        chronicDiseases,
        completionPercentage,
        totalConsultations: consultations.totalConsultations || 0,
        monthConsultations: consultations.monthConsultations || 0,
        duplicatePrescriptions2d,
        totalComplaints: complaintEntry.totalComplaints || 0,
        openComplaints: complaintEntry.openComplaints || 0
      };
    });

    const activeThisMonth = patients.filter((patient) =>
      patient.monthConsultations > 0 || (patient.last_login_at && new Date(patient.last_login_at) >= monthStart)
    ).length;

    const flaggedAccounts = patients
      .map((patient) => {
        if (patient.duplicatePrescriptions2d >= 4) {
          return {
            registryId: patient.registryId,
            reason: `${patient.duplicatePrescriptions2d} prescriptions created in 2 days`,
            description: "Possible prescription abuse or automation. Review recommended.",
            risk: patient.duplicatePrescriptions2d >= 8 ? "High" : "Medium"
          };
        }

        if (patient.openComplaints >= 2) {
          return {
            registryId: patient.registryId,
            reason: `${patient.openComplaints} unresolved complaints`,
            description: "Multiple active complaints raised against this patient account.",
            risk: patient.openComplaints >= 3 ? "High" : "Medium"
          };
        }

        if (!patient.is_active) {
          return {
            registryId: patient.registryId,
            reason: "Inactive patient account",
            description: "Account is inactive and should be reviewed before reactivation.",
            risk: "Low"
          };
        }

        return null;
      })
      .filter(Boolean)
      .sort((a, b) => {
        const riskScore = { High: 3, Medium: 2, Low: 1 };
        return (riskScore[b.risk] || 0) - (riskScore[a.risk] || 0);
      })
      .slice(0, 8);

    const totalRegistered = patients.length;
    const totalWithGender = maleCount + femaleCount;
    const topConditions = Array.from(conditionCounts.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalRegistered ? Number(((count / totalRegistered) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const states = Array.from(stateCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return res.json({
      success: true,
      summary: {
        totalRegistered,
        registeredThisWeek: patients.filter((patient) => new Date(patient.createdAt) >= weekStart).length,
        profileCompleteCount,
        profileCompleteRate: totalRegistered ? Number(((profileCompleteCount / totalRegistered) * 100).toFixed(1)) : 0,
        activeThisMonth,
        activeRate: totalRegistered ? Number(((activeThisMonth / totalRegistered) * 100).toFixed(1)) : 0,
        flaggedAccounts: flaggedAccounts.length
      },
      demographics: {
        averageAge: ageCount ? Number((totalAge / ageCount).toFixed(1)) : 0,
        maleRate: totalWithGender ? Number(((maleCount / totalWithGender) * 100).toFixed(1)) : 0,
        femaleRate: totalWithGender ? Number(((femaleCount / totalWithGender) * 100).toFixed(1)) : 0,
        ruralRate: totalRegistered ? Number(((ruralCount / totalRegistered) * 100).toFixed(1)) : 0,
        urbanRate: totalRegistered ? Number((((totalRegistered - ruralCount) / totalRegistered) * 100).toFixed(1)) : 0,
        profileCompleteRate: totalRegistered ? Number(((profileCompleteCount / totalRegistered) * 100).toFixed(1)) : 0,
        averageConsultations: totalRegistered
          ? Number((patients.reduce((sum, patient) => sum + patient.totalConsultations, 0) / totalRegistered).toFixed(1))
          : 0
      },
      topConditions,
      flaggedAccounts,
      filters: {
        states: states.map((state) => state.name),
        conditions: topConditions.map((condition) => condition.name)
      },
      patients
    });
  } catch (error) {
    console.error("[ADMIN] patient registry failed", error);
    return res.status(500).json({ message: "Failed to load patient registry" });
  }
};

exports.getConsultationMonitor = async (req, res) => {
  try {
    const now = new Date();
    const dayStart = startOfDay(now);
    const yesterdayStart = new Date(dayStart.getTime() - 24 * 60 * 60 * 1000);
    const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

    const [
      liveConsultations,
      todayConsultations,
      yesterdayConsultations,
      completedToday,
      doctorProfiles,
      complaintsToday,
      complaintFeed,
      hourlyTrend
    ] = await Promise.all([
      Consultation.find({
        status: "Scheduled",
        appointmentDate: { $lte: now, $gte: new Date(now.getTime() - 60 * 60 * 1000) }
      })
        .populate("doctor", "full_name")
        .populate("patient", "full_name")
        .sort({ appointmentDate: -1 })
        .limit(12)
        .lean(),
      Consultation.find({ createdAt: { $gte: dayStart, $lt: dayEnd } })
        .populate("doctor", "full_name")
        .populate("patient", "full_name createdAt")
        .sort({ createdAt: -1 })
        .lean(),
      Consultation.countDocuments({ createdAt: { $gte: yesterdayStart, $lt: dayStart } }),
      Consultation.find({ status: { $in: ["Completed", "FollowUp"] }, updatedAt: { $gte: dayStart, $lt: dayEnd } })
        .select("doctor patient consultationMode status createdAt updatedAt followUpDate")
        .lean(),
      Doctor.find({}).select("user specialization rating").lean(),
      Complaint.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } }),
      Complaint.find({ createdAt: { $gte: dayStart, $lt: dayEnd } })
        .populate("raisedBy", "full_name role createdAt")
        .populate("againstUser", "full_name role")
        .sort({ createdAt: -1 })
        .limit(6)
        .lean(),
      Consultation.aggregate([
        { $match: { createdAt: { $gte: dayStart, $lt: dayEnd } } },
        {
          $group: {
            _id: { $hour: "$createdAt" },
            count: { $sum: 1 }
          }
        },
        { $sort: { _id: 1 } }
      ])
    ]);

    const doctorMap = new Map(doctorProfiles.map((profile) => [String(profile.user), profile]));
    const specializations = new Set(
      todayConsultations.map((consultation) => consultation.specialization).filter(Boolean)
    );
    const todayTotal = todayConsultations.length;
    const todayGrowth = yesterdayConsultations
      ? Number((((todayTotal - yesterdayConsultations) / yesterdayConsultations) * 100).toFixed(1))
      : todayTotal > 0 ? 100 : 0;

    const durations = completedToday.map((consultation) =>
      Math.max(
        0,
        (new Date(consultation.updatedAt).getTime() - new Date(consultation.createdAt).getTime()) / 60000
      )
    );
    const avgDurationMinutes = durations.length
      ? Number((durations.reduce((sum, duration) => sum + duration, 0) / durations.length).toFixed(1))
      : 0;

    const modeCounts = todayConsultations.reduce((acc, consultation) => {
      const mode = consultation.consultationMode || "video";
      acc[mode] = (acc[mode] || 0) + 1;
      return acc;
    }, {});
    const modePercent = (mode) =>
      todayTotal ? Number((((modeCounts[mode] || 0) / todayTotal) * 100).toFixed(1)) : 0;

    const liveFeed = liveConsultations.map((consultation) => {
      const hasComplaint = complaintFeed.some((complaint) =>
        String(complaint.againstUser?._id || "") === String(consultation.doctor?._id || "") ||
        String(complaint.raisedBy?._id || "") === String(consultation.patient?._id || "")
      );
      return {
        consultationId: consultation._id,
        doctorName: consultation.doctor?.full_name || "Doctor",
        patientName: consultation.patient?.full_name || "Patient",
        specialization: consultation.specialization || doctorMap.get(String(consultation.doctor?._id))?.specialization || "General",
        mode: consultation.consultationMode || "video",
        status: hasComplaint ? "FLAGGED" : formatLiveDuration(consultation.appointmentDate || consultation.createdAt),
        startedAt: consultation.appointmentDate || consultation.createdAt,
        flagged: hasComplaint
      };
    });

    const hourlyMap = new Map(hourlyTrend.map((entry) => [entry._id, entry.count]));
    const trend = Array.from({ length: 8 }, (_, index) => {
      const hour = 8 + index;
      return {
        label: `${String(hour).padStart(2, "0")}H`,
        count: hourlyMap.get(hour) || 0
      };
    });
    const peak = trend.reduce((best, item) => item.count > best.count ? item : best, { label: "Peak", count: 0 });
    trend.push({ label: "Peak", count: peak.count });

    const completedCount = completedToday.length;
    const prescriptionsToday = await Prescription.countDocuments({ createdAt: { $gte: dayStart, $lt: dayEnd } });
    const followUpsToday = completedToday.filter((consultation) => consultation.status === "FollowUp" || consultation.followUpDate).length;
    const insuranceAuthorized = await Complaint.countDocuments({
      createdAt: { $gte: dayStart, $lt: dayEnd },
      category: "payment",
      status: "Resolved"
    });
    const escalatedToday = complaintFeed.filter((complaint) => complaint.status !== "Resolved").length;
    const ratedDoctors = doctorProfiles.filter((profile) => Number(profile.rating || 0) > 0);
    const avgDoctorRating = ratedDoctors.length
      ? Number((ratedDoctors.reduce((sum, profile) => sum + Number(profile.rating || 0), 0) / ratedDoctors.length).toFixed(1))
      : 0;

    const complaints = complaintFeed.map((complaint) => ({
      id:
        complaint.raisedBy?.role === "patient"
          ? `Patient ${buildPatientRegistryId(complaint.raisedBy)}`
          : complaint.category || "Issue",
      reason: complaint.subject,
      details: `${complaint.againstUser?.full_name || "User"} • ${complaint.category || "other"} • ${complaint.status}`,
      severity: complaint.status === "Open" ? "high" : complaint.status === "In Review" ? "medium" : "low",
      createdAtLabel: formatMinutesAgo(complaint.createdAt)
    }));

    res.json({
      success: true,
      summary: {
        liveNow: liveFeed.length,
        specializations: specializations.size,
        todaySoFar: todayTotal,
        todayGrowth,
        avgDurationMinutes,
        complaintsToday
      },
      liveFeed,
      trend,
      modes: {
        video: modePercent("video"),
        audio: modePercent("audio"),
        chat: modePercent("chat")
      },
      outcomes: {
        prescriptionIssued: completedCount ? Number(((prescriptionsToday / completedCount) * 100).toFixed(1)) : 0,
        followUpScheduled: completedCount ? Number(((followUpsToday / completedCount) * 100).toFixed(1)) : 0,
        insuranceAuthorized: completedCount ? Number(((insuranceAuthorized / completedCount) * 100).toFixed(1)) : 0,
        deepRefConsultant: todayTotal ? Number(((escalatedToday / todayTotal) * 100).toFixed(1)) : 0,
        avgDoctorRating
      },
      complaints
    });
  } catch (error) {
    console.error("[ADMIN] consultation monitor failed", error);
    res.status(500).json({ message: "Failed to load consultation monitor" });
  }
};

exports.getRecordsOverview = async (req, res) => {
  try {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const totalCapacityBytes = 20 * 1024 * 1024 * 1024 * 1024;
    const unitCapacityBytes = 1.2 * 1024 * 1024 * 1024 * 1024;

    const [
      totalRecords,
      recordsThisWeek,
      typeBreakdown,
      storageAgg,
      pendingSync,
      latestSyncRecord,
      offlineCachedRecords,
      patientCount,
      patientsWithRecords,
      syncErrorLogs
    ] = await Promise.all([
      HealthRecord.countDocuments({}),
      HealthRecord.countDocuments({ createdAt: { $gte: weekStart } }),
      HealthRecord.aggregate([
        {
          $group: {
            _id: "$type",
            count: { $sum: 1 }
          }
        },
        { $sort: { count: -1 } }
      ]),
      HealthRecord.aggregate([
        {
          $group: {
            _id: null,
            totalBytes: { $sum: { $ifNull: ["$fileSizeBytes", 0] } }
          }
        }
      ]),
      HealthRecord.countDocuments({
        $or: [
          { lastSyncedAt: null },
          {
            $expr: {
              $gt: ["$updatedAt", { $ifNull: ["$lastSyncedAt", new Date(0)] }]
            }
          }
        ]
      }),
      HealthRecord.findOne({}).sort({ lastSyncedAt: -1 }).select("lastSyncedAt").lean(),
      HealthRecord.countDocuments({ isOfflineAvailable: true }),
      User.countDocuments({ role: "patient", is_active: true }),
      HealthRecord.distinct("patient"),
      SystemLog.countDocuments({
        createdAt: { $gte: thirtyDaysAgo },
        level: "error",
        path: { $regex: "/records|/prescriptions", $options: "i" }
      })
    ]);

    const recordLabelMap = {
      prescription: "Prescriptions",
      lab_report: "Lab reports",
      consultation_note: "Doctor notes",
      note: "Doctor notes",
      imaging: "Imaging (X-ray, etc.)",
      vaccination: "Vaccination records",
      vaccine: "Vaccination records"
    };

    const mergedBreakdownMap = new Map();
    typeBreakdown.forEach((entry) => {
      const label = recordLabelMap[entry._id] || "Other records";
      mergedBreakdownMap.set(label, (mergedBreakdownMap.get(label) || 0) + entry.count);
    });

    const breakdown = Array.from(mergedBreakdownMap.entries())
      .map(([name, count]) => ({
        name,
        count,
        percentage: totalRecords ? Number(((count / totalRecords) * 100).toFixed(1)) : 0
      }))
      .sort((a, b) => b.count - a.count);

    const storageUsedBytes = storageAgg[0]?.totalBytes || 0;
    const storageUsedTb = Number((storageUsedBytes / (1024 ** 4)).toFixed(2));
    const storageUsedPercent = Number(((storageUsedBytes / totalCapacityBytes) * 100).toFixed(1));
    const linkedCoverageRate = patientCount ? Number(((patientsWithRecords.length / patientCount) * 100).toFixed(1)) : 0;
    const dataLossRate = totalRecords ? Number(((syncErrorLogs / Math.max(totalRecords, 1)) * 100).toFixed(5)) : 0;

    res.json({
      success: true,
      summary: {
        totalRecords,
        recordsThisWeek,
        storageUsedTb,
        storageUsedPercent,
        pendingSync,
        lastFullSyncAt: latestSyncRecord?.lastSyncedAt || null,
        syncStatusLabel: pendingSync ? `${pendingSync} pending sync` : "All nodes synced"
      },
      breakdown,
      highlights: {
        linkedCoverageRate,
        offlineCachedRecords
      },
      health: {
        unitCapacityTb: Number((unitCapacityBytes / (1024 ** 4)).toFixed(1)),
        dataLossRate,
        autoBackup: "Daily 3:00 AM",
        pendingSyncIssues: pendingSync,
        retentionPolicy: "7 years (NHM)",
        encryption: "AES-256 bit",
        linkedCoverageRate,
        offlineCachedRecords
      }
    });
  } catch (error) {
    console.error("[ADMIN] records overview failed", error);
    res.status(500).json({ message: "Failed to load records overview" });
  }
};

exports.getFinancialOverview = async (req, res) => {
  try {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const previousMonthStart = addMonthsUtc(monthStart, -1);
    const sixMonthsStart = addMonthsUtc(monthStart, -5);
    const twentyDaysFromNow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 2, 20));

    const [
      completedConsultationsMonth,
      completedConsultationsPreviousMonth,
      completedConsultationSeries,
      doctorProfiles,
      approvedDoctors,
      prescriptionsMonth,
      prescriptionsPreviousMonth,
      paymentComplaints,
      flaggedDoctors,
      recentConsultations
    ] = await Promise.all([
      Consultation.find({
        status: { $in: ["Completed", "FollowUp"] },
        updatedAt: { $gte: monthStart }
      })
        .select("doctor updatedAt createdAt")
        .lean(),
      Consultation.find({
        status: { $in: ["Completed", "FollowUp"] },
        updatedAt: { $gte: previousMonthStart, $lt: monthStart }
      })
        .select("doctor updatedAt")
        .lean(),
      Consultation.aggregate([
        {
          $match: {
            status: { $in: ["Completed", "FollowUp"] },
            updatedAt: { $gte: sixMonthsStart }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$updatedAt" },
              month: { $month: "$updatedAt" }
            },
            consultations: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]),
      Doctor.find({}).select("user consultationFee rating").lean(),
      User.countDocuments({ role: "doctor", is_active: true, is_approved: true }),
      Prescription.find({ createdAt: { $gte: monthStart } })
        .select("doctor createdAt")
        .lean(),
      Prescription.find({ createdAt: { $gte: previousMonthStart, $lt: monthStart } })
        .select("doctor createdAt")
        .lean(),
      Complaint.find({ category: "payment" })
        .populate("againstUser", "full_name role is_active")
        .sort({ createdAt: -1 })
        .limit(20)
        .lean(),
      User.find({ role: "doctor", is_active: false }).select("full_name").lean(),
      Consultation.find({
        status: { $in: ["Completed", "FollowUp"] },
        updatedAt: { $gte: addMonthsUtc(monthStart, -1) }
      })
        .populate("doctor", "full_name")
        .sort({ updatedAt: -1 })
        .limit(50)
        .lean()
    ]);

    const doctorProfileMap = new Map(doctorProfiles.map((profile) => [String(profile.user), profile]));
    const flaggedDoctorIds = new Set(flaggedDoctors.map((doctor) => String(doctor._id)));

    const consultationRevenue = completedConsultationsMonth.reduce((sum, consultation) => {
      const fee = Number(doctorProfileMap.get(String(consultation.doctor))?.consultationFee || 0);
      return sum + fee;
    }, 0);
    const previousConsultationRevenue = completedConsultationsPreviousMonth.reduce((sum, consultation) => {
      const fee = Number(doctorProfileMap.get(String(consultation.doctor))?.consultationFee || 0);
      return sum + fee;
    }, 0);

    const prescriptionFeePerIssue = 75;
    const pharmacyCommissionPerIssue = 50;
    const prescriptionRevenue = prescriptionsMonth.length * prescriptionFeePerIssue;
    const pharmacyCommissionRevenue = prescriptionsMonth.length * pharmacyCommissionPerIssue;
    const totalRevenue = consultationRevenue + prescriptionRevenue + pharmacyCommissionRevenue;
    const previousTotalRevenue =
      previousConsultationRevenue +
      (prescriptionsPreviousMonth.length * prescriptionFeePerIssue) +
      (prescriptionsPreviousMonth.length * pharmacyCommissionPerIssue);

    const doctorPayouts = Number((consultationRevenue * 0.7).toFixed(0));
    const platformFees = Number((consultationRevenue * 0.2 + prescriptionRevenue).toFixed(0));
    const gstCollected = Number((platformFees * 0.18).toFixed(0));
    const taxableTurnover = platformFees + pharmacyCommissionRevenue;
    const cgst = Number((gstCollected / 2).toFixed(0));
    const sgst = gstCollected - cgst;
    const revenueGrowthRate = previousTotalRevenue
      ? Number((((totalRevenue - previousTotalRevenue) / previousTotalRevenue) * 100).toFixed(1))
      : totalRevenue > 0 ? 100 : 0;
    const platformFeeGrowthRate = previousConsultationRevenue
      ? Number((((platformFees - (previousConsultationRevenue * 0.2 + prescriptionsPreviousMonth.length * prescriptionFeePerIssue)) / Math.max(previousConsultationRevenue * 0.2 + prescriptionsPreviousMonth.length * prescriptionFeePerIssue, 1)) * 100).toFixed(1))
      : platformFees > 0 ? 100 : 0;

    const monthLabels = Array.from({ length: 6 }, (_, index) => addMonthsUtc(sixMonthsStart, index));
    const consultationSeriesMap = new Map(
      completedConsultationSeries.map((item) => [
        `${item._id.year}-${String(item._id.month).padStart(2, "0")}`,
        item.consultations
      ])
    );
    const revenueGrowth = monthLabels.map((date) => {
      const key = toMonthKey(date);
      const consultations = consultationSeriesMap.get(key) || 0;
      const avgFee =
        approvedDoctors && doctorProfiles.length
          ? doctorProfiles.reduce((sum, profile) => sum + Number(profile.consultationFee || 0), 0) / Math.max(doctorProfiles.length, 1)
          : 0;
      const monthRevenue = consultations * avgFee;
      return {
        label: formatMonthLabel(date),
        revenue: Number(monthRevenue.toFixed(0))
      };
    });

    const recentPayouts = recentConsultations.slice(0, 5).map((consultation) => {
      const doctorId = String(consultation.doctor?._id || "");
      const consultationFee = Number(doctorProfileMap.get(doctorId)?.consultationFee || 0);
      const payoutAmount = Number((consultationFee * 0.7).toFixed(0));
      const isFlagged = flaggedDoctorIds.has(doctorId) || paymentComplaints.some((complaint) => String(complaint.againstUser?._id || "") === doctorId && complaint.status !== "Resolved");
      const hasPendingPaymentIssue = paymentComplaints.some((complaint) => String(complaint.againstUser?._id || "") === doctorId && complaint.status === "Open");

      return {
        doctorName: consultation.doctor?.full_name || "Doctor",
        dateLabel: new Date(consultation.updatedAt || consultation.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short" }),
        method: "NEFT Payout",
        amount: payoutAmount,
        status: isFlagged ? "Flagged" : hasPendingPaymentIssue ? "Pending" : "Paid"
      };
    });

    const activePaymentAlerts = paymentComplaints.filter((complaint) => complaint.status !== "Resolved");
    const totalAlertValue = activePaymentAlerts.length
      ? activePaymentAlerts.length * 60000
      : 0;
    const topAlert = activePaymentAlerts[0];

    const revenueBreakdown = [
      { label: "Consultation fees", value: consultationRevenue },
      { label: "Prescription fees", value: prescriptionRevenue },
      { label: "Pharmacy commissions", value: pharmacyCommissionRevenue }
    ];
    const maxRevenuePart = Math.max(1, ...revenueBreakdown.map((item) => item.value));

    res.json({
      success: true,
      alerts: {
        count: activePaymentAlerts.length,
        totalAmount: totalAlertValue,
        message: topAlert
          ? `${topAlert.subject} - ${topAlert.againstUser?.full_name || "Partner"}`
          : "No active payout alerts"
      },
      summary: {
        revenueMonth: totalRevenue,
        revenueGrowthRate,
        doctorPayouts,
        approvedDoctors,
        platformFees,
        platformFeeGrowthRate,
        gstCollected
      },
      revenueGrowth,
      recentPayouts,
      gst: {
        taxableTurnover,
        cgst,
        sgst,
        dueDate: twentyDaysFromNow.toISOString()
      },
      revenueBreakdown: revenueBreakdown.map((item) => ({
        ...item,
        percentage: Number(((item.value / maxRevenuePart) * 100).toFixed(1))
      })),
      insight: {
        topSource: revenueBreakdown.sort((a, b) => b.value - a.value)[0]?.label || "Consultation fees",
        topSourceShare: totalRevenue ? Number(((Math.max(...revenueBreakdown.map((item) => item.value)) / totalRevenue) * 100).toFixed(1)) : 0
      }
    });
  } catch (error) {
    console.error("[ADMIN] financial overview failed", error);
    res.status(500).json({ message: "Failed to load financial overview" });
  }
};

exports.approveUser = async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.params.id,
      role: { $in: ["doctor", "pharmacist"] }
    });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.is_approved = true;
    user.approved_at = new Date();
    await user.save();

    res.json({
      success: true,
      message: "User approved successfully",
      user
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to approve user" });
  }
};

exports.getComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find({})
      .populate("raisedBy", "full_name email role")
      .populate("againstUser", "full_name email role")
      .populate("resolvedBy", "full_name email role")
      .sort({ createdAt: -1 });

    res.json({
      success: true,
      complaints
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load complaints" });
  }
};

exports.createComplaint = async (req, res) => {
  try {
    const { againstUser, category, subject, description } = req.body;

    if (!subject || !description) {
      return res.status(400).json({ message: "Subject and description are required" });
    }

    const complaint = await Complaint.create({
      raisedBy: req.user?._id || null,
      againstUser: againstUser || null,
      category: category || "other",
      subject,
      description
    });

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to create complaint" });
  }
};

exports.resolveComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    complaint.status = "Resolved";
    complaint.resolutionNotes = req.body.resolutionNotes || "Resolved by admin";
    complaint.resolvedBy = req.user._id;
    complaint.resolvedAt = new Date();
    await complaint.save();

    res.json({
      success: true,
      message: "Complaint resolved",
      complaint
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to resolve complaint" });
  }
};

exports.getSystemLogs = async (req, res) => {
  try {
    const limit = Math.min(Number.parseInt(req.query.limit || "50", 10) || 50, 200);
    const level = req.query.level;
    const query = level ? { level } : {};

    const logs = await SystemLog.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    res.json({
      success: true,
      logs
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load system logs" });
  }
};

exports.exportReport = async (req, res) => {
  try {
    const type = req.query.type || "overview";

    if (type === "overview") {
      const analytics = await buildAnalyticsPayload();
      const rows = [
        ["metric", "value"],
        ["consultations_today", analytics.consultations.today],
        ["consultations_week", analytics.consultations.week],
        ["consultations_month", analytics.consultations.month],
        ["active_patients", analytics.activeUsers.patients],
        ["active_doctors", analytics.activeUsers.doctors],
        ["active_pharmacists", analytics.activeUsers.pharmacists],
        ["pharmacy_fulfillment_rate", analytics.pharmacyFulfillment.rate],
        ["avg_consultation_duration_minutes", analytics.averageConsultationDurationMinutes],
        ["system_uptime_hours", analytics.system.uptimeHours],
        ["avg_response_time_ms", analytics.system.avgResponseTimeMs],
        ["error_count_24h", analytics.system.errorCount24h]
      ];

      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=\"admin-overview-report.csv\"`);
      return res.send(csv);
    }

    if (type === "complaints") {
      const complaints = await Complaint.find({}).sort({ createdAt: -1 }).lean();
      const rows = [
        ["subject", "category", "status", "createdAt", "resolvedAt"],
        ...complaints.map((complaint) => [
          complaint.subject,
          complaint.category,
          complaint.status,
          complaint.createdAt,
          complaint.resolvedAt || ""
        ])
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", `attachment; filename=\"admin-complaints-report.csv\"`);
      return res.send(csv);
    }

    if (type === "patients") {
      const patientUsers = await User.find({ role: "patient" })
        .select("full_name email phone is_active createdAt")
        .sort({ createdAt: -1 })
        .lean();
      const patientProfiles = await Patient.find({ user: { $in: patientUsers.map((user) => user._id) } })
        .select("user address dob gender chronicDiseases")
        .lean();
      const profileMap = new Map(patientProfiles.map((profile) => [String(profile.user), profile]));
      const rows = [
        ["registry_id", "full_name", "email", "phone", "active", "state", "city", "gender", "conditions", "created_at"],
        ...patientUsers.map((user) => {
          const profile = profileMap.get(String(user._id)) || {};
          const location = parseLocation(profile.address);
          return [
            buildPatientRegistryId(user),
            user.full_name,
            user.email,
            user.phone || "",
            user.is_active ? "yes" : "no",
            location.state || "",
            location.city || "",
            profile.gender || "",
            Array.isArray(profile.chronicDiseases) ? profile.chronicDiseases.join("; ") : "",
            user.createdAt
          ];
        })
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="admin-patients-report.csv"');
      return res.send(csv);
    }

    if (type === "consultations") {
      const consultations = await Consultation.find({})
        .populate("doctor", "full_name")
        .populate("patient", "full_name")
        .sort({ createdAt: -1 })
        .limit(500)
        .lean();
      const rows = [
        ["consultation_id", "doctor", "patient", "specialization", "mode", "status", "appointment_date", "created_at"],
        ...consultations.map((consultation) => [
          consultation._id,
          consultation.doctor?.full_name || "",
          consultation.patient?.full_name || "",
          consultation.specialization || "",
          consultation.consultationMode || "",
          consultation.status || "",
          consultation.appointmentDate || "",
          consultation.createdAt || ""
        ])
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="admin-consultations-report.csv"');
      return res.send(csv);
    }

    if (type === "records") {
      const records = await HealthRecord.find({})
        .populate("patient", "full_name")
        .populate("doctor", "full_name")
        .sort({ createdAt: -1 })
        .limit(1000)
        .lean();
      const rows = [
        ["record_id", "type", "title", "patient", "doctor", "offline_available", "file_size_bytes", "last_synced_at", "created_at"],
        ...records.map((record) => [
          record._id,
          record.type || "",
          record.title || "",
          record.patient?.full_name || "",
          record.doctor?.full_name || "",
          record.isOfflineAvailable ? "yes" : "no",
          record.fileSizeBytes || 0,
          record.lastSyncedAt || "",
          record.createdAt || ""
        ])
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="admin-records-report.csv"');
      return res.send(csv);
    }

    if (type === "financials") {
      const monthStart = startOfMonth(new Date());
      const consultations = await Consultation.find({
        status: { $in: ["Completed", "FollowUp"] },
        updatedAt: { $gte: monthStart }
      })
        .populate("doctor", "full_name")
        .sort({ updatedAt: -1 })
        .limit(1000)
        .lean();
      const doctorProfiles = await Doctor.find({}).select("user consultationFee").lean();
      const doctorProfileMap = new Map(doctorProfiles.map((profile) => [String(profile.user), profile]));
      const rows = [
        ["doctor", "consultation_date", "consultation_fee", "estimated_payout", "status"],
        ...consultations.map((consultation) => {
          const fee = Number(doctorProfileMap.get(String(consultation.doctor?._id || consultation.doctor))?.consultationFee || 0);
          return [
            consultation.doctor?.full_name || "",
            consultation.updatedAt || consultation.createdAt || "",
            fee,
            Number((fee * 0.7).toFixed(0)),
            consultation.status || ""
          ];
        })
      ];
      const csv = rows.map((row) => row.map(csvEscape).join(",")).join("\n");
      res.setHeader("Content-Type", "text/csv");
      res.setHeader("Content-Disposition", 'attachment; filename="admin-financials-report.csv"');
      return res.send(csv);
    }

    return res.status(400).json({ message: "Unsupported report type" });
  } catch (error) {
    console.error("[ADMIN] export failed", error);
    res.status(500).json({ message: "Failed to export report" });
  }
};

exports.getGlobalSettings = async (req, res) => {
  try {
    const settingsList = await GlobalSetting.find({});
    const settingsObj = settingsList.reduce((acc, s) => {
      acc[s.key] = s.value;
      return acc;
    }, {});
    
    const defaults = {
      doctorVerification: true,
      openRegistration: true,
      newPharmacyEnrollment: true,
      twoFactor: false,
      autoBackup: true,
      globalLanguage: 'en',
      minConsultationFee: 100
    };

    res.json({
      success: true,
      settings: { ...defaults, ...settingsObj }
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to load global settings" });
  }
};

exports.updateGlobalSettings = async (req, res) => {
  try {
    const { settings } = req.body;
    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({ message: "Invalid settings payload" });
    }

    const updatePromises = Object.entries(settings).map(([key, value]) => {
      return GlobalSetting.findOneAndUpdate(
        { key },
        { key, value, updatedBy: req.user._id, category: 'general' },
        { upsert: true, new: true }
      );
    });

    await Promise.all(updatePromises);

    res.json({
      success: true,
      message: "Global settings updated successfully",
      settings
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update global settings" });
  }
};
