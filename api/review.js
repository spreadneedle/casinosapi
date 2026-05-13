const fs = require('fs');
const path = require('path');

const SUBMISSIONS_FILE = path.join('/tmp', 'submissions.json');

function loadSubmissions() {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading submissions:', e);
  }
  return { submissions: [] };
}

function saveSubmissions(data) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
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
  text += `\n/approve_${sub.id} or /reject_${sub.id} [reason]`;
  
  return text;
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  try {
    const data = loadSubmissions();
    const { action, id, reason, reviewer } = req.query || req.body || {};
    
    // List pending submissions
    if (!action || action === 'list') {
      const pending = data.submissions.filter(s => s.status === 'pending');
      
      if (pending.length === 0) {
        return res.status(200).json({ 
          message: 'No pending submissions.',
          count: 0 
        });
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
      const sub = data.submissions.find(s => s.id === id);
      if (!sub) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      return res.status(200).json({
        submission: sub,
        formatted: formatSubmission(sub)
      });
    }
    
    // Approve submission
    if (action === 'approve' && id) {
      const sub = data.submissions.find(s => s.id === id);
      if (!sub) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      if (sub.status !== 'pending') {
        return res.status(400).json({ error: `Already ${sub.status}` });
      }
      
      sub.status = 'approved';
      sub.reviewed_at = new Date().toISOString();
      sub.reviewed_by = reviewer || 'admin';
      sub.review_notes = reason || null;
      
      saveSubmissions(data);
      
      return res.status(200).json({
        success: true,
        message: `Approved ${sub.id} for ${sub.casino_name}`,
        submission: sub
      });
    }
    
    // Reject submission
    if (action === 'reject' && id) {
      const sub = data.submissions.find(s => s.id === id);
      if (!sub) {
        return res.status(404).json({ error: 'Submission not found' });
      }
      
      if (sub.status !== 'pending') {
        return res.status(400).json({ error: `Already ${sub.status}` });
      }
      
      sub.status = 'rejected';
      sub.reviewed_at = new Date().toISOString();
      sub.reviewed_by = reviewer || 'admin';
      sub.review_notes = reason || 'No reason provided';
      
      saveSubmissions(data);
      
      return res.status(200).json({
        success: true,
        message: `Rejected ${sub.id} for ${sub.casino_name}`,
        submission: sub
      });
    }
    
    res.status(400).json({ error: 'Invalid action' });
    
  } catch (e) {
    console.error('Review error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
