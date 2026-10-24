const { haversineMeters } = require('./geo');
const { RESOLUTION_MAX_DISTANCE_M, RESOLUTION_MAX_ACCURACY_M } = require('../constants/resolution');

const validateResolutionCaptures = ({ captureMeta, fileCount, issueLocation }) => {
  let captures;
  try { captures = typeof captureMeta === 'string' ? JSON.parse(captureMeta) : captureMeta; }
  catch { return { error: 'captureMeta must be valid JSON.' }; }
  if (!Array.isArray(captures) || captures.length !== fileCount) return { error: 'captureMeta must contain one entry per uploaded resolution photo.' };
  const hasIssueGps = Number.isFinite(issueLocation?.latitude) && Number.isFinite(issueLocation?.longitude);
  const validated = [];
  for (const capture of captures) {
    const lat = Number(capture?.lat); const lng = Number(capture?.lng); const accuracy = Number(capture?.accuracy);
    const capturedAt = new Date(capture?.capturedAt);
    if (!Number.isFinite(lat) || lat < -90 || lat > 90 || !Number.isFinite(lng) || lng < -180 || lng > 180 || !Number.isFinite(accuracy) || accuracy < 0 || !capture?.capturedAt || Number.isNaN(capturedAt.getTime())) return { error: 'Each capture must include valid coordinates, accuracy, and capturedAt.' };
    if (capture.source !== undefined && !['live', 'device'].includes(capture.source)) return { error: 'Capture source must be live or device.' };
    if (accuracy > RESOLUTION_MAX_ACCURACY_M) return { status: 422, error: `GPS accuracy ${Math.round(accuracy)} m exceeds the ${RESOLUTION_MAX_ACCURACY_M} m limit.` };
    const distanceFromIssueM = hasIssueGps ? haversineMeters(lat, lng, Number(issueLocation.latitude), Number(issueLocation.longitude)) : null;
    if (distanceFromIssueM !== null && distanceFromIssueM > RESOLUTION_MAX_DISTANCE_M) return { status: 422, error: `Capture is ${Math.round(distanceFromIssueM)} m from the issue location; maximum allowed distance is ${RESOLUTION_MAX_DISTANCE_M} m.` };
    validated.push({ lat, lng, accuracy, distanceFromIssueM, capturedAt, source: capture.source || 'live' });
  }
  return { captures: validated, locationCheck: hasIssueGps ? 'passed' : 'skipped_no_issue_gps' };
};

module.exports = { validateResolutionCaptures };
