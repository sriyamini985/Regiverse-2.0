import express from "express";
import multer from "multer";
import Conference from "../models/Conference.js";
import Participant from "../models/Participant.js";
import { importExcel } from "../controllers/conferenceController.js";

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// 1. Excel Batch Roster Upload Route
router.post("/import-excel", upload.single("file"), importExcel);

// 2a. GET CONFERENCES ACCESSIBLE TO LOGGED-IN CLIENT
router.get("/client", async (req, res) => {
  try {
    const clientEmail = (
      req.headers["x-client-email"] ||
      req.query.clientEmail ||
      ""
    ).trim().toLowerCase();
    const clientRole = (
      req.headers["x-client-role"] ||
      req.query.role ||
      ""
    ).trim().toLowerCase();

    const allConferences = await Conference.find().sort({ createdAt: -1 });

    // Filter conferences by client authorization
    const authorizedConferences = allConferences.filter((c) => {
      if (clientRole === "admin") return true;
      if (Array.isArray(c.authorizedClients) && c.authorizedClients.length > 0) {
        const normalized = c.authorizedClients.map((a) => String(a).trim().toLowerCase());
        return clientEmail && normalized.includes(clientEmail);
      }
      // If no explicit restrictions defined, accessible by default to authenticated clients
      return true;
    });

    const formatted = await Promise.all(
      authorizedConferences.map(async (c) => {
        const conferenceName = c.name || c.title || "";
        const delegates = await Participant.countDocuments({
          $or: [
            { conferenceId: c._id.toString() },
            { conferenceName: conferenceName },
          ],
        });

        return {
          _id: c._id,
          name: conferenceName,
          title: conferenceName,
          slug: c.slug,
          delegates,
          isActive: c.isActive,
          createdAt: c.createdAt,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 2b. GET ALL CONFERENCES (with dynamic delegate count calculation)
router.get("/", async (req, res) => {
  try {
    const conferences = await Conference.find().sort({ createdAt: -1 });

    const formatted = await Promise.all(
      conferences.map(async (c) => {
        const conferenceName = c.name || c.title || "";
        const delegates = await Participant.countDocuments({
          $or: [
            { conferenceId: c._id.toString() },
            { conferenceName: conferenceName },
          ],
        });

        return {
          _id: c._id,
          name: conferenceName,
          title: conferenceName,
          slug: c.slug,
          delegates,
          isActive: c.isActive,
          createdAt: c.createdAt,
        };
      })
    );

    return res.status(200).json(formatted);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// 3. CREATE A NEW CONFERENCE
router.post("/", async (req, res) => {
  try {
    const { title, name, slug, authorizedClients, clientEmail } = req.body;
    const newConference = await Conference.create({
      name: title || name,
      slug,
      isActive: false,
      authorizedClients: Array.isArray(authorizedClients) ? authorizedClients : [],
      clientEmail: clientEmail || "",
    });
    res.status(201).json(newConference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 4. TOGGLE WORKSPACE ACTIVE STATUS
router.patch("/:id/activate", async (req, res) => {
  try {
    const { id } = req.params;
    const conference = await Conference.findById(id);
    if (!conference) {
      return res.status(404).json({ error: "Conference workspace profile not found" });
    }
    conference.isActive = !conference.isActive;
    await conference.save();
    res.json(conference);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;