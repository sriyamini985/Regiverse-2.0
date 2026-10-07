import Participant from "../models/Participant.js";
import { getIO } from "../socket.js";
import xlsx from "xlsx";
import { verifyConferenceAccess } from "../utils/authHelper.js";

export const getDashboardStats = async (req, res) => {
  try {
    const conferenceId = req.params.conferenceId || req.query.conferenceId;
    if (!conferenceId) {
      return res.status(400).json({ success: false, message: "Conference ID is required." });
    }

    const authResult = await verifyConferenceAccess(conferenceId, req);
    if (!authResult.authorized) {
      return res.status(authResult.status).json({ success: false, message: authResult.message });
    }

    const targetConference = authResult.conference;
    const confIdStr = targetConference._id.toString();
    const confName = targetConference.name || targetConference.title || "";
    const confSlug = targetConference.slug || "";

    // Query participants strictly isolated to this conference
    const participants = await Participant.find({
      $or: [
        { conferenceId: confIdStr },
        { conferenceId: confSlug },
        { conferenceName: confName }
      ].filter(Boolean)
    });

    const totalDelegates = participants.length;
    const badgesIssued = participants.filter(p => p.printed === true || p.isBadgePrinted === true).length;
    const certificatesIssued = participants.filter(p => p.certificateGiven === true).length;
    const kitbagsDelivered = participants.filter(p => p.kitbagCollected === true).length;
    const checkedIn = participants.filter(p => p.isCheckedIn === true).length;

    // Meals per day (Day 1 through Day 5)
    const meals = {};
    for (let d = 1; d <= 5; d++) {
      const dKey = `Day ${d}`;
      let bCount = 0;
      let lCount = 0;
      let dCount = 0;

      participants.forEach(p => {
        const logs = p.foodLogs instanceof Map ? Object.fromEntries(p.foodLogs) : (p.foodLogs || {});
        if (logs[`day${d}-breakfast`] || logs[`day${d}Breakfast`]) bCount++;
        if (logs[`day${d}-lunch`] || logs[`day${d}Lunch`]) lCount++;
        if (logs[`day${d}-dinner`] || logs[`day${d}Dinner`]) dCount++;
      });

      meals[dKey] = {
        breakfast: bCount,
        lunch: lCount,
        dinner: dCount
      };
    }

    return res.json({
      success: true,
      conference: {
        _id: targetConference._id,
        name: targetConference.name,
        slug: targetConference.slug,
        isActive: targetConference.isActive
      },
      stats: {
        totalDelegates,
        badgesIssued,
        certificatesIssued,
        kitbagsDelivered,
        checkedIn,
        meals
      }
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const importExcel = async (req, res) => {
  try {
    const { conferenceId } = req.body;

    if (!req.file) {
      return res.status(400).json({ success: false, msg: "No file was received by the server." });
    }

    if (!conferenceId) {
      return res.status(400).json({ success: false, msg: "Missing conference ID." });
    }

    const authResult = await verifyConferenceAccess(conferenceId, req);
    if (!authResult.authorized) {
      return res.status(authResult.status).json({ success: false, msg: authResult.message });
    }

    const targetConference = authResult.conference;
    const cleanConferenceId = targetConference._id.toString();
    const cleanConferenceName = targetConference.name || targetConference.title;

    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];
    const rawRows = xlsx.utils.sheet_to_json(workbook.Sheets[firstSheetName]);

    if (!rawRows || rawRows.length === 0) {
      return res.status(400).json({ success: false, msg: "The uploaded sheet is empty." });
    }

    const processedParticipants = rawRows.map((row) => ({
      name: row.Name || row.name || row.NAME || "Unknown Delegate",
      email: row.Email || row.email || row.EMAIL || "",
      company: row.Company || row.company || row.COMPANY || "",
      phone: String(row.Phone || row.phone || row.PHONE || ""),
      regId: String(row.RegId || row.regId || row.id || ""),
      qrCode: String(row.QrCode || row.qrcode || row.RegId || row.regId || ""),
      
      status: "pending",
      conferenceId: cleanConferenceId,
      conferenceName: cleanConferenceName,
      isCheckedIn: false,
      printed: false,
      kitbagCollected: false,
      certificateGiven: false,
      foodLogs: {}
    }));

    const insertedRecords = await Participant.insertMany(processedParticipants);

    getIO().to(cleanConferenceId).emit("conferenceDataUpdated", { conferenceId: cleanConferenceId });

    return res.json({ 
      success: true, 
      inserted: insertedRecords.length, 
      msg: "Data imported successfully!" 
    });

  } catch (err) {
    console.error("EXCEL IMPORT CRASH:", err);
    return res.status(500).json({ success: false, message: err.message });
  }
};