import mongoose from "mongoose";
import Conference from "../models/Conference.js";

/**
 * Validates that an authenticated client or admin has permission to access a specific conference/event.
 * 
 * Rules:
 * - Admins (role === 'admin') have access to all conferences.
 * - If clientEmail is provided and the conference has explicit `authorizedClients` defined:
 *   The clientEmail MUST be in the conference's authorizedClients list.
 * - If the conference has no restrictions (authorizedClients is empty), authorized clients (e.g. client@gmail.com)
 *   have default access.
 * - If clientEmail is restricted or unauthorized, access is denied (403 Forbidden).
 */
export const verifyConferenceAccess = async (conferenceId, req) => {
  if (!conferenceId || String(conferenceId).trim() === "") {
    return {
      authorized: false,
      status: 400,
      message: "Conference / Event ID is required.",
    };
  }

  const cleanId = String(conferenceId).trim();
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

  // Admin role has unrestricted access
  if (clientRole === "admin") {
    const conf = await Conference.findOne({
      $or: [
        { _id: mongoose.Types.ObjectId.isValid(cleanId) ? cleanId : null },
        { slug: cleanId },
        { name: cleanId },
      ].filter(Boolean),
    });
    return { authorized: true, conference: conf };
  }

  // Find target conference
  const conference = await Conference.findOne({
    $or: [
      { _id: mongoose.Types.ObjectId.isValid(cleanId) ? cleanId : null },
      { slug: cleanId },
      { name: cleanId },
    ].filter(Boolean),
  });

  if (!conference) {
    return {
      authorized: false,
      status: 404,
      message: `Conference not found for identifier: ${cleanId}`,
    };
  }

  // Security Check: If the conference explicitly specifies authorized clients
  if (Array.isArray(conference.authorizedClients) && conference.authorizedClients.length > 0) {
    const normalizedAuthorized = conference.authorizedClients.map((c) =>
      String(c).trim().toLowerCase()
    );
    if (!clientEmail || !normalizedAuthorized.includes(clientEmail)) {
      return {
        authorized: false,
        status: 403,
        message: `Unauthorized: Client '${clientEmail || "anonymous"}' is not authorized to access event '${conference.name}'.`,
      };
    }
  }

  return { authorized: true, conference };
};
