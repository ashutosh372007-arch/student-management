import assert from 'node:assert';
import test from 'node:test';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import { calculateRiskLevel, calculatePlacementScore } from '../controllers/studentController';

dotenv.config();

test('0-Level Unit Test Suite - Environment Variables', () => {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;
  assert.ok(uri, 'MongoDB connection URI should be defined in env');
  assert.ok(uri.includes('mongodb+srv://'), 'MongoDB URI should be Atlas mongodb+srv format');
  assert.ok(uri.includes('ashutosh372007_db_user'), 'URI should contain database username');
});

test('0-Level Unit Test Suite - Student Risk Level Calculation', () => {
  // Test Low Risk
  const lowRisk = calculateRiskLevel(90, 85, 0);
  assert.strictEqual(lowRisk.riskLevel, 'LOW RISK');
  assert.strictEqual(lowRisk.riskReasons.length, 0);

  // Test Medium Risk (low attendance)
  const medRisk = calculateRiskLevel(70, 80, 0);
  assert.strictEqual(medRisk.riskLevel, 'MEDIUM RISK');
  assert.ok(medRisk.riskReasons.includes('Low attendance'));

  // Test High Risk (very low attendance < 65%)
  const highRisk = calculateRiskLevel(60, 80, 0);
  assert.strictEqual(highRisk.riskLevel, 'HIGH RISK');

  // Test High Risk (poor marks < 40%)
  const highRiskMarks = calculateRiskLevel(80, 35, 0);
  assert.strictEqual(highRiskMarks.riskLevel, 'HIGH RISK');
});

test('0-Level Unit Test Suite - Student Placement Score Calculation', () => {
  // Academic 100% (30 pts) + Advanced Skill (5 pts) + 2 Projects (14 pts) + 1 Cert (5 pts) + Aptitude 80% (8 pts) + Comm 80% (4 pts)
  const score = calculatePlacementScore(
    100,
    [{ level: 'Advanced' }],
    [{ name: 'P1' }, { name: 'P2' }],
    [{ name: 'C1' }],
    80,
    80
  );
  assert.strictEqual(score, 30 + 5 + 14 + 5 + 8 + 4); // 66

  // Zero score test
  const zeroScore = calculatePlacementScore(0, [], [], [], 0, 0);
  assert.strictEqual(zeroScore, 0);
});

test('0-Level Unit Test Suite - JWT Auth Token Sign and Verification', () => {
  const secret = process.env.JWT_SECRET || 'student-mgmt-secret-key-2024';
  const payload = { id: 'user123', role: 'admin' };
  const token = jwt.sign(payload, secret, { expiresIn: '1h' });

  assert.ok(token, 'Token should be generated');

  const decoded = jwt.verify(token, secret) as { id: string; role: string };
  assert.strictEqual(decoded.id, 'user123');
  assert.strictEqual(decoded.role, 'admin');
});
