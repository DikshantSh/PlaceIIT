/**
 * Data Transformation Script
 * Converts raw company_details.json → clean roles.json for the frontend
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const RAW_PATH = join(__dirname, '..', '..', 'company_details.json');
const OUT_PATH = join(__dirname, '..', 'src', 'data', 'roles.json');

// Approximate exchange rates (static, for display purposes)
const EXCHANGE_RATES = {
  INR: 1,
  USD: 85,
  JPY: 0.57,
  EUR: 93,
  GBP: 108,
};

// Clean garbled Unicode characters from ERP text fields
function cleanText(text) {
  if (!text) return '';
  return text
    // Windows-1252 bullet variants → proper bullet
    .replace(/[\uf0b7\uf0d8\uf0a7\u0095\u25cf\u25aa\u25cb\u25e6]/g, '•')
    // Windows-1252 dashes → proper em/en dash
    .replace(/\u0096/g, '–')
    .replace(/\u0097/g, '—')
    // Windows-1252 smart quotes → proper quotes
    .replace(/\u0091/g, '\u2018')  // left single quote
    .replace(/\u0092/g, '\u2019')  // right single quote (apostrophe)
    .replace(/\u0093/g, '\u201C')  // left double quote
    .replace(/\u0094/g, '\u201D')  // right double quote
    // Normalize line breaks
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    // Remove control characters (except \n and \t)
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F-\x9F]/g, '')
    .trim();
}

function parseCTC(ctcRaw) {
  if (!ctcRaw) return { ctc: 0, currency: 'INR' };
  const currencyMatch = ctcRaw.match(/(INR|USD|JPY|EUR|GBP)/i);
  const currency = currencyMatch ? currencyMatch[1].toUpperCase() : 'INR';
  const numMatch = ctcRaw.match(/[\d,]+\.?\d*/);
  const num = numMatch ? parseFloat(numMatch[0].replace(/,/g, '')) : 0;
  return { ctc: num, currency };
}

function parseNumber(val) {
  if (!val || val === 'NA' || val === 'na') return 0;
  const cleaned = String(val).replace(/,/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
}

function parseSkills(raw) {
  if (!raw || raw === 'NA' || raw === 'na') return [];
  // Filter out unhelpful values
  const junk = ['mentioned in the jd', 'refer jd', 'pfa', 'na', 'mentioned in jd', 'refer to jd', 'as per jd', 'bechelor degree'];
  if (junk.includes(raw.toLowerCase().trim())) return [];
  
  // Split by common delimiters
  const skills = raw
    .split(/[,;\u2022\u0095\uf0b7\uf0d8\u25aa\u25cf•·|]/)
    .map(s => s.replace(/\\r\\n|\\n|\\r/g, ' ').trim())
    .filter(s => s.length > 1 && s.length < 80)
    .map(s => s.replace(/^\d+\)\s*/, '').replace(/^-\s*/, '').trim())
    .filter(s => s.length > 1);
  
  return [...new Set(skills)].slice(0, 15);
}

function parseBool(val) {
  if (!val) return null;
  const v = val.toLowerCase().trim();
  if (['yes', 'true'].includes(v)) return true;
  if (['no', 'false', 'no backlog', 'no backlogs', 'none'].includes(v)) return false;
  return null;
}

function classifyRole(ctcINR) {
  if (ctcINR >= 2500000) return 'super-dream';
  if (ctcINR >= 1500000) return 'dream';
  if (ctcINR >= 800000) return 'core';
  return 'standard';
}

function toSlug(key) {
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function normalizeCGPA(val) {
  if (!val || val === 'NA' || val === 'na' || val === '') return null;
  const num = parseFloat(val);
  if (isNaN(num)) return null;
  // Values > 10 are likely percentages (e.g., 60 = 60%)
  if (num > 10) return Math.round((num / 10) * 10) / 10; // rough conversion
  if (num === 0) return null; // 0 means no real criteria
  return num;
}

// Main transform
const raw = JSON.parse(readFileSync(RAW_PATH, 'utf-8'));
const roles = [];

for (const [key, val] of Object.entries(raw)) {
  const { ctc, currency } = parseCTC(val['Cost to Company per year']);
  const ctcINR = Math.round(ctc * (EXCHANGE_RATES[currency] || 1));
  
  const role = {
    id: toSlug(key),
    company: cleanText(val['Company Name']),
    designation: cleanText(val['Designation']),
    ctc,
    ctcINR,
    currency,
    ctcRaw: val['Cost to Company per year'] || '',
    ctcBreakup: cleanText(val['CTC Breakup']),
    baseSalary: parseNumber(val['Base Salary']),
    gross: parseNumber(val['Gross (per Annum)']),
    fixedTakeHome: parseNumber(val['Fixed Take Home Salary (per Annum)']),
    firstYearCTC: parseNumber(val['1st Year CTC']),
    joiningBonus: parseNumber(val['Joining Bonus, if any']),
    retentionBonus: parseNumber(val['Retention Bonus, if any']),
    relocationBonus: parseNumber(val['Relocation Bonus, if any']),
    perks: cleanText(val['Any other perks/ benefits/ components']),
    jobDescription: cleanText(val['Job Description']),
    skills: parseSkills(val['Required Skill Set']),
    cgpaRequired: normalizeCGPA(val['If Yes, minimum CGPA required']),
    hasCGPACriteria: val['Is there a CGPA Criteria?']?.toLowerCase().trim() === 'yes',
    backlogEligible: parseBool(val['Backlog Eligibility']),
    hasBond: val['Bonds']?.toLowerCase().trim() === 'yes',
    bondDuration: cleanText(val['Bond Duration']),
    bondAmount: parseNumber(val['Bond Amount']),
    additionalInfo: cleanText(val['Additional Information, if any (provide details below)']),
    roleTag: classifyRole(ctcINR),
  };
  
  roles.push(role);
}

// Sort by CTC descending by default
roles.sort((a, b) => b.ctcINR - a.ctcINR);

// Ensure output directory exists
mkdirSync(dirname(OUT_PATH), { recursive: true });
writeFileSync(OUT_PATH, JSON.stringify(roles, null, 2), 'utf-8');

console.log(`✅ Transformed ${roles.length} roles → ${OUT_PATH}`);
console.log(`   Companies: ${new Set(roles.map(r => r.company)).size}`);
console.log(`   Tags: ${JSON.stringify(roles.reduce((acc, r) => { acc[r.roleTag] = (acc[r.roleTag]||0)+1; return acc; }, {}))}`);
console.log(`   Currencies: ${JSON.stringify([...new Set(roles.map(r => r.currency))])}`);
