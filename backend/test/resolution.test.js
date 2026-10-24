const test = require('node:test');
const assert = require('node:assert/strict');
const { haversineMeters } = require('../src/utils/geo');
const { validateResolutionCaptures } = require('../src/utils/validateResolutionCaptures');

const issueLocation = { latitude: 0, longitude: 0 };
const valid = { lat: 0, lng: 0, accuracy: 5, capturedAt: '2026-01-01T00:00:00.000Z' };

test('haversine returns zero for the same coordinates', () => assert.equal(haversineMeters(0, 0, 0, 0), 0));
test('haversine matches a known one degree equatorial distance', () => assert.ok(Math.abs(haversineMeters(0, 0, 0, 1) - 111195) < 10));
test('capture validation accepts valid metadata', () => assert.equal(validateResolutionCaptures({ captureMeta: [valid], fileCount: 1, issueLocation }).captures.length, 1));
test('capture validation rejects wrong array length', () => assert.ok(validateResolutionCaptures({ captureMeta: [], fileCount: 1, issueLocation }).error));
test('capture validation rejects out-of-range coordinates', () => assert.ok(validateResolutionCaptures({ captureMeta: [{ ...valid, lat: 91 }], fileCount: 1, issueLocation }).error));
test('capture validation allows accuracy up to 100 m', () => assert.equal(validateResolutionCaptures({ captureMeta: [{ ...valid, accuracy: 100 }], fileCount: 1, issueLocation }).captures.length, 1));
test('capture validation rejects accuracy over 100 m', () => assert.equal(validateResolutionCaptures({ captureMeta: [{ ...valid, accuracy: 101 }], fileCount: 1, issueLocation }).status, 422));
test('capture validation rejects captures too far away', () => assert.equal(validateResolutionCaptures({ captureMeta: [{ ...valid, lng: 0.001 }], fileCount: 1, issueLocation }).status, 422));
