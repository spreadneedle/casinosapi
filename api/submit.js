const { execSync } = require('child_process');
const crypto = require('crypto');

const GITHUB_REPO = 'philipwallenius/grokcasino.online';
const GITHUB_BRANCH = 'submissions';

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
  if (emailDomain === casinoDomain) return true;
  if (casinoDomain.endsWith('.' + emailDomain)) return true;
  if (emailDomain.endsWith('.' + casinoDomain)) return true;
  
  // Trusted operator domains
  const TRUSTED_DOMAINS = ['ll-europe.com', 'rootz.com', 'hero-gaming.com', 'whitehatgaming.com', 'bayton.com'];
  if (TRUSTED_DOMAINS.includes(emailDomain)) return true;
  
  return false;
}

function calculateRiskScore(submission) {
  let score = 0;
  if (submission.domain_match) score -= 2;
  else score += 3;
  if (submission.proof_url) score -= 1;
  const changeCount = Object.keys(submission.changes || {}).length;
  if (changeCount > 3) score += 2;
  if (changeCount > 5) score += 2;
  return Math.max(0, Math.min(10, score));
}

function getRiskLevel(score) {
  if (score <= 2) return 'low';
  if (score <= 5) return 'medium';
  return 'high';
}

function createSubmissionFile(submission) {
  const filename = `submissions/pending/${submission.id}.json`;
  const content = JSON.stringify(submission, null, 2);
  
  try {
    // Create directory if needed
    execSync('mkdir -p submissions/pending submissions/approved', { cwd: '/tmp' });
    
    // Write file
    const filepath = `/tmp/${filename}`;
    require('fs').writeFileSync(filepath, content);
    
    // Git operations
    const git = (cmd) => execSync(cmd, { cwd: '/tmp', encoding: 'utf8' });
    
    try {
      git('git init');
      git(`git remote add origin https://github.com/${GITHUB_REPO}.git 2>/dev/null || true`);
      git(`git config user.email "submissions@casinosapi.com"`);
      git(`git config user.name "CasinosAPI Bot"`);
      
      // Try to fetch and checkout branch
      try {
        git(`git fetch origin ${GITHUB_BRANCH}`);
        git(`git checkout ${GITHUB_BRANCH}`);
      } catch {
        git(`git checkout -b ${GITHUB_BRANCH}`);
      }
      
      git('git add .');
      git(`git commit -m "[submission] ${submission.type}: ${submission.casino_name} (${submission.risk_level} risk)"`);
      
      // Note: Push would need auth token - we'll handle this via GitHub Actions or manual
      return { success: true, filename, filepath };
    } catch (gitErr) {
      console.log('Git error (expected in serverless):', gitErr.message);
      return { success: true, filename, filepath, gitError: true };
    }
  } catch (e) {
    console.error('File creation error:', e);
    return { success: false, error: e.message };
  }
}

module.exports = function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  try {
    const body = req.body || {};
    const { casino_name, casino_url, submitter_email, submitter_role, change_type, changes, proof_url, notes } = body;
    
    if (!casino_name || !submitter_email || !change_type) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    if (!['new', 'correction', 'amendment', 'removal'].includes(change_type)) {
      return res.status(400).json({ error: 'Invalid change_type' });
    }
    
    const domainMatch = casino_url ? checkDomainMatch(submitter_email, casino_url) : false;
    const riskScore = calculateRiskScore({ domain_match: domainMatch, proof_url, changes });
    const riskLevel = getRiskLevel(riskScore);
    
    const submission = {
      id: generateId(),
      type: change_type,
      casino_name,
      casino_url: casino_url || null,
      submitter_email,
      submitter_role: submitter_role || null,
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
    
    // Create file (in /tmp for now)
    const fileResult = createSubmissionFile(submission);
    
    // Auto-approve low risk + domain match
    const autoApprove = riskLevel === 'low' && domainMatch;
    if (autoApprove) {
      submission.status = 'auto_approved';
      submission.reviewed_at = new Date().toISOString();
      submission.reviewed_by = 'system';
      submission.review_notes = 'Auto-approved: low risk + domain match';
    }
    
    // TODO: Send Telegram notification
    // TODO: If auto-approved, queue for merge into dataset
    
    res.status(201).json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        risk_level: riskLevel,
        domain_match: domainMatch,
        auto_approved: autoApprove,
        message: autoApprove 
          ? '✅ Auto-approved! Your submission will be merged shortly.'
          : domainMatch 
            ? '⏳ Submission received. Under review (domain verified).'
            : '⏳ Submission received. Additional verification required.'
      }
    });
    
  } catch (e) {
    console.error('Submission error:', e);
    res.status(500).json({ error: 'Internal server error' });
  }
};
