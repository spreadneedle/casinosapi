const https = require('https');
const crypto = require('crypto');

const GITHUB_REPO = 'philipwallenius/grokcasino.online';
const GITHUB_BRANCH = 'submissions';
const GITHUB_TOKEN = process.env.GH_PAT;

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

// GitHub API helper
function githubApi(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'api.github.com',
      path: `/repos/${GITHUB_REPO}${path}`,
      method,
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'CasinosAPI-Submission-Bot',
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(jsonData);
    }
    
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(json);
          } else {
            reject(new Error(`GitHub API ${res.statusCode}: ${json.message || body}`));
          }
        } catch {
          reject(new Error(`GitHub API ${res.statusCode}: ${body}`));
        }
      });
    });
    
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function getFileSha(path, branch) {
  try {
    const data = await githubApi(`/contents/${path}?ref=${branch}`);
    return data.sha;
  } catch {
    return null; // File doesn't exist
  }
}

async function commitSubmissionToGitHub(submission) {
  const filename = `submissions/pending/${submission.id}.json`;
  const content = Buffer.from(JSON.stringify(submission, null, 2)).toString('base64');
  const message = `[submission] ${submission.type}: ${submission.casino_name} (${submission.risk_level} risk)`;
  
  try {
    // Check if file already exists
    const sha = await getFileSha(filename, GITHUB_BRANCH);
    
    // Create or update file
    const data = {
      message,
      content,
      branch: GITHUB_BRANCH
    };
    if (sha) data.sha = sha;
    
    await githubApi(`/contents/${filename}`, 'PUT', data);
    
    return { success: true, filename };
  } catch (e) {
    console.error('GitHub commit error:', e.message);
    return { success: false, error: e.message };
  }
}

module.exports = async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  
  if (!GITHUB_TOKEN) {
    return res.status(500).json({ error: 'GitHub token not configured' });
  }
  
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
    
    // All submissions require manual review - no auto-approval
    const autoApprove = false;
    
    // Commit to GitHub
    const commitResult = await commitSubmissionToGitHub(submission);
    
    if (!commitResult.success) {
      return res.status(500).json({ 
        error: 'Failed to save submission',
        details: commitResult.error
      });
    }
    
    res.status(201).json({
      success: true,
      submission: {
        id: submission.id,
        status: submission.status,
        risk_level: riskLevel,
        domain_match: domainMatch,
        auto_approved: autoApprove,
        message: '⏳ Submission received. Pending manual review.'
      }
    });
    
  } catch (e) {
    console.error('Submission error:', e);
    res.status(500).json({ error: 'Internal server error', details: e.message });
  }
};
