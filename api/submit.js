const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const SUBMISSIONS_FILE = path.join(__dirname, '..', 'submissions.json');
const RATE_LIMIT_MINUTES = 60;
const MAX_SUBMISSIONS_PER_EMAIL_PER_MONTH = 5;

// Known operator domains that can submit for multiple casinos
const TRUSTED_DOMAINS = [
  'll-europe.com',
  'rootz.com',
  'hero-gaming.com',
  'whitehatgaming.com',
  'bayton.com',
  'netent.com',
  'evolution.com'
];

function loadSubmissions() {
  try {
    if (fs.existsSync(SUBMISSIONS_FILE)) {
      return JSON.parse(fs.readFileSync(SUBMISSIONS_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('Error loading submissions:', e);
  }
  return { submissions: [], lastId: 0 };
}

function saveSubmissions(data) {
  fs.writeFileSync(SUBMISSIONS_FILE, JSON.stringify(data, null, 2));
}

function generateId() {
  return 'sub_' + crypto.randomBytes(8).toString('hex');
}

function getDomain(email) {
  const match = email.match(/@(.+)$/);
  return match ? match[1].toLowerCase() : null;
}

function getCasinoDomain(url) {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.replace('www.', '').toLowerCase();
  } catch {
    return null;
  }
}

function checkDomainMatch(email, casinoUrl) {
  const emailDomain = getDomain(email);
  const casinoDomain = getCasinoDomain(casinoUrl);
  
  if (!emailDomain || !casinoDomain) return false;
  
  // Direct match
  if (emailDomain === casinoDomain) return true;
  
  // Subdomain match (e.g., marketing@boostcasino.net matches boostcasino.net)
  if (casinoDomain.endsWith('.' + emailDomain)) return true;
  if (emailDomain.endsWith('.' + casinoDomain)) return true;
  
  // Trusted operator domains
  if (TRUSTED_DOMAINS.includes(emailDomain)) return true;
  
  return false;
}

function calculateRiskScore(submission, history) {
  let score = 0;
  
  // Email domain match
  if (submission.domain_match) score -= 2;
  else score += 3;
  
  // Submission history
  const approvedCount = history.filter(h => h.status === 'approved').length;
  const rejectedCount = history.filter(h => h.status === 'rejected').length;
  
  if (approvedCount > 2) score -= 2;
  if (approvedCount > 0) score -= 1;
  if (rejectedCount > 2) score += 3;
  if (rejectedCount > 0) score += 1;
  
  // Change magnitude
  const changes = submission.changes || {};
  const changeCount = Object.keys(changes).length;
  if (changeCount > 3) score += 2;
  if (changeCount > 5) score += 2;
  
  // Has proof URL
  if (submission.proof_url) score -= 1;
  
  // First-time submitter
  if (history.length === 0) score += 1;
  
  return Math.max(0, Math.min(10, score));
}

function getRiskLevel(score) {
  if (score <= 2) return 'low';
  if (score <= 5) return 'medium';
  return 'high';
}

function checkRateLimit(email, submissions) {
  const now = new Date();
  const oneHourAgo = new Date(now - RATE_LIMIT_MINUTES * 60 * 1000);
  
  const recentSubmissions = submissions.filter(s => 
    s.submitter_email === email && 
    new Date(s.submitted_at) > oneHourAgo
  );
  
  if (recentSubmissions.length > 0) {
    return { allowed: false, reason: 'Rate limit: max 1 submission per hour' };
  }
  
  // Monthly limit
  const oneMonthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000);
  const monthlySubmissions = submissions.filter(s => 
    s.submitter_email === email && 
    new Date(s.submitted_at) > oneMonthAgo
  );
  
  if (monthlySubmissions.length >= MAX_SUBMISSIONS_PER_EMAIL_PER_MONTH) {
    return { allowed: false, reason: 'Monthly limit reached (max 5 submissions per month)' };
  }
  
  return { allowed: true };
}

module.exports = function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }
  
  try {
    const body = req.body || {};
    const { 
      casino_name, 
      casino_url, 
      submitter_email, 
      submitter_role,
      change_type, // 'new' | 'correction' | 'amendment' | 'removal'
      changes,
      proof_url,
      notes 
    } = body;
    
    // Validation
    if (!casino_name || !submitter_email || !change_type) {
      return res.status(400).json({ 
        error: 'Missing required fields: casino_name, submitter_email, change_type' 
      });
    }
    
    if (!submitter_email.includes('@')) {
      return res.status(400).json({ error: 'Invalid email address' });
    }
    
    if (!['new', 'correction', 'amendment', 'removal'].includes(change_type)) {
      return res.status(400).json({ error: 'Invalid change_type' });
    }
    
    const data = loadSubmissions();
    
    // Rate limiting
    const rateCheck = checkRateLimit(submitter_email, data.submissions);
    if (!rateCheck.allowed) {
      return res.status(429).json({ error: rateCheck.reason });
    }
    
    // Domain verification
    const domainMatch = casino_url ? checkDomainMatch(submitter_email, casino_url) : false;
    
    // Get submission history for this email
    const history = data.submissions.filter(s => s.submitter_email === submitter_email);
    
    // Calculate risk score
    const submission = {
      casino_name,
      casino_url,
      submitter_email,
      domain_match: domainMatch
    };
    const riskScore = calculateRiskScore(submission, history);
    const riskLevel = getRiskLevel(riskScore);
    
    // Create submission
    const newSubmission = {
      id: generateId(),
      type: change_type,
      casino_name,
      casino_url: casino_url || null,
      submitter_email,
      submitter_role: submitter_role || null,
      submitter_domain: getDomain(submitter_email),
      domain_match: domainMatch,
      changes: changes || {},
      proof_url: proof_url || null,
      notes: notes || null,
      risk_score: riskScore,
      risk_level: riskLevel,
      status: 'pending',
      submitted_at: new Date().toISOString(),
      reviewed_at: null,
      reviewed_by: null,
      review_notes: null
    };
    
    data.submissions.push(newSubmission);
    data.lastId++;
    saveSubmissions(data);
    
    // Return response
    res.status(201).json({
      success: true,
      submission: {
        id: newSubmission.id,
        status: newSubmission.status,
        risk_level: newSubmission.risk_level,
        domain_match: newSubmission.domain_match,
        message: domainMatch 
          ? 'Submission received. Your email domain matches the casino domain — this will be reviewed shortly.'
          : 'Submission received. Additional verification may be required since your email domain does not match the casino domain.'
      }
    });
    
  } catch (e) {
    console.error('Submission error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
