const fs = require('fs');
const path = require('path');

const SUBMISSIONS_DIR = path.join(__dirname, '..', 'submissions-branch', 'submissions', 'pending');
const DATA_FILE = path.join(__dirname, '..', 'api', 'bonus_enhanced.js');

function loadSubmissions() {
  const submissions = [];
  if (!fs.existsSync(SUBMISSIONS_DIR)) return submissions;
  
  const files = fs.readdirSync(SUBMISSIONS_DIR).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(SUBMISSIONS_DIR, file), 'utf8'));
      submissions.push(data);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
  return submissions;
}

function loadCasinoData() {
  const content = fs.readFileSync(DATA_FILE, 'utf8');
  const start = content.indexOf('[');
  const end = content.rfind(']') + 1;
  return JSON.parse(content.slice(start, end));
}

function saveCasinoData(casinos) {
  const output = `// Enhanced CasinosAPI API - AI-Optimized Data
// Generated: ${new Date().toISOString()}
// Casinos: ${casinos.length}

const casinoDataEnhanced = ${JSON.stringify(casinos, null, 2)};

module.exports = { default: casinoDataEnhanced };
module.exports.default = casinoDataEnhanced;
`;
  fs.writeFileSync(DATA_FILE, output);
}

function applyChanges(casino, changes) {
  for (const [field, change] of Object.entries(changes)) {
    if (change.new === null || change.new === undefined) {
      delete casino[field];
    } else {
      casino[field] = change.new;
    }
  }
  return casino;
}

function mergeSubmissions() {
  const submissions = loadSubmissions();
  if (submissions.length === 0) {
    console.log('No pending submissions to process.');
    return;
  }
  
  console.log(`Processing ${submissions.length} submissions...`);
  
  const casinos = loadCasinoData();
  let merged = 0;
  let rejected = 0;
  
  for (const sub of submissions) {
    // Only process approved or auto_approved
    if (sub.status !== 'approved' && sub.status !== 'auto_approved') {
      console.log(`Skipping ${sub.id}: status=${sub.status}`);
      continue;
    }
    
    try {
      if (sub.type === 'new') {
        // Add new casino
        const newCasino = {
          casino_name: sub.casino_name,
          slug: sub.casino_name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''),
          bonus: sub.changes.bonus?.new || 'Contact for bonus',
          bonus_structure: sub.changes.bonus_structure?.new || {},
          wagering: sub.changes.wagering?.new || {},
          license: sub.changes.license?.new || ['Curacao'],
          info: sub.changes.info?.new || '',
          ai_summary: sub.changes.ai_summary?.new || '',
          url: sub.casino_url,
          last_updated: new Date().toISOString().split('T')[0],
          health_status: { status: 'unknown', last_check: new Date().toISOString() }
        };
        casinos.push(newCasino);
        console.log(`Added new casino: ${sub.casino_name}`);
        merged++;
        
      } else if (sub.type === 'correction' || sub.type === 'amendment') {
        // Find and update existing casino
        const idx = casinos.findIndex(c => 
          c.casino_name.toLowerCase() === sub.casino_name.toLowerCase() ||
          c.slug === sub.casino_name.toLowerCase().replace(/[^a-z0-9]+/g, '-')
        );
        
        if (idx === -1) {
          console.log(`Casino not found: ${sub.casino_name}`);
          rejected++;
          continue;
        }
        
        casinos[idx] = applyChanges(casinos[idx], sub.changes);
        casinos[idx].last_updated = new Date().toISOString().split('T')[0];
        console.log(`Updated casino: ${sub.casino_name}`);
        merged++;
        
      } else if (sub.type === 'removal') {
        // Remove casino
        const idx = casinos.findIndex(c => 
          c.casino_name.toLowerCase() === sub.casino_name.toLowerCase()
        );
        
        if (idx !== -1) {
          casinos.splice(idx, 1);
          console.log(`Removed casino: ${sub.casino_name}`);
          merged++;
        } else {
          console.log(`Casino not found for removal: ${sub.casino_name}`);
          rejected++;
        }
      }
    } catch (e) {
      console.error(`Error processing ${sub.id}:`, e.message);
      rejected++;
    }
  }
  
  saveCasinoData(casinos);
  console.log(`\nDone: ${merged} merged, ${rejected} rejected`);
}

mergeSubmissions();
