const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const SUBMISSIONS_DIR = '/tmp/submissions';
const GITHUB_REPO = 'philipwallenius/grokcasino.online';

function getPendingSubmissions() {
  const pending = [];
  const pendingDir = path.join(SUBMISSIONS_DIR, 'pending');
  
  if (!fs.existsSync(pendingDir)) return pending;
  
  const files = fs.readdirSync(pendingDir).filter(f => f.endsWith('.json'));
  for (const file of files) {
    try {
      const data = JSON.parse(fs.readFileSync(path.join(pendingDir, file), 'utf8'));
      pending.push(data);
    } catch (e) {
      console.error(`Error reading ${file}:`, e.message);
    }
  }
  return pending.sort((a, b) => new Date(b.submitted_at) - new Date(a.submitted_at));
}

function getSubmissionById(id) {
  const file = path.join(SUBMISSIONS_DIR, 'pending', `${id}.json`);
  if (!fs.existsSync(file)) return null;
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function updateSubmission(id, updates) {
  const file = path.join(SUBMISSIONS_DIR, 'pending', `${id}.json`);
  if (!fs.existsSync(file)) return false;
  
  const sub = JSON.parse(fs.readFileSync(file, 'utf8'));
  Object.assign(sub, updates);
  fs.writeFileSync(file, JSON.stringify(sub, null, 2));
  
  // If approved, move to approved dir
  if (updates.status === 'approved' || updates.status === 'auto_approved') {
    const approvedDir = path.join(SUBMISSIONS_DIR, 'approved');
    fs.mkdirSync(approvedDir, { recursive: true });
    fs.renameSync(file, path.join(approvedDir, `${id}.json`));
  }
  
  return true;
}

function formatSubmission(sub) {
  const riskEmoji = sub.risk_level === 'low' ? '🟢' : sub.risk_level === 'medium' ? '🟡' : '🔴';
  const domainEmoji = sub.domain_match ? '✅' : '⚠️';
  
  let text = `📋 *Submission ${sub.id}*\n`;
  text += `Type: ${sub.type.toUpperCase()}\n`;
  text += `Casino: ${sub.casino_name}\n`;
  text += `From: ${sub.submitter_email} ${domainEmoji}\n`;
  text += `Risk: ${riskEmoji} ${sub.risk_level.toUpperCase()} (${sub.risk_score}/10)\n`;
  
  if (sub.changes && Object.keys(sub.changes).length > 0) {
    text += `\n*Changes:*\n`;
    for (const [field, change] of Object.entries(sub.changes)) {
      text += `• ${field}: ${change.old} → ${change.new}\n`;
    }
  }
  
  if (sub.proof_url) {
    text += `\nProof: ${sub.proof_url}\n`;
  }
  
  if (sub.notes) {
    text += `\nNotes: ${sub.notes}\n`;
  }
  
  text += `\nSubmitted: ${new Date(sub.submitted_at).toLocaleString()}\n`;
  
  if (sub.status === 'pending') {
    text += `\n/approve_${sub.id} or /reject_${sub.id} [reason]`;
  } else {
    text += `\nStatus: ${sub.status.toUpperCase()}`;
  }
  
  return text;
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  
  try {
    const { action, id, reason, reviewer } = req.query || req.body || {};
    
    // List pending submissions
    if (!action || action === 'list') {
      const pending = getPendingSubmissions().filter(s => s.status === 'pending');
      
      if (pending.length === 0) {
        return res.status(200).json({ message: 'No pending submissions.', count: 0 });
      }
      
      return res.status(200).json({
        count: pending.length,
        submissions: pending.map(s => ({
          id: s.id,
          type: s.type,
          casino_name: s.casino_name,
          submitter_email: s.submitter_email,
          risk_level: s.risk_level,
          domain_match: s.domain_match,
          submitted_at: s.submitted_at
        }))
      });
    }
    
    // Get single submission
    if (action === 'get' && id) {
      const sub = getSubmissionById(id);
      if (!sub) return res.status(404).json({ error: 'Submission not found' });
      
      return res.status(200).json({
        submission: sub,
        formatted: formatSubmission(sub)
      });
    }
    
    // Approve submission
    if (action === 'approve' && id) {
      const sub = getSubmissionById(id);
      if (!sub) return res.status(404).json({ error: 'Submission not found' });
      if (sub.status !== 'pending') return res.status(400).json({ error: `Already ${sub.status}` });
      
      updateSubmission(id, {
        status: 'approved',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer || 'admin',
        review_notes: reason || null
      });
      
      return res.status(200).json({
        success: true,
        message: `Approved ${id} for ${sub.casino_name}`
      });
    }
    
    // Reject submission
    if (action === 'reject' && id) {
      const sub = getSubmissionById(id);
      if (!sub) return res.status(404).json({ error: 'Submission not found' });
      if (sub.status !== 'pending') return res.status(400).json({ error: `Already ${sub.status}` });
      
      updateSubmission(id, {
        status: 'rejected',
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewer || 'admin',
        review_notes: reason || 'No reason provided'
      });
      
      return res.status(200).json({
        success: true,
        message: `Rejected ${id} for ${sub.casino_name}`
      });
    }
    
    res.status(400).json({ error: 'Invalid action' });
    
  } catch (e) {
    console.error('Review error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
