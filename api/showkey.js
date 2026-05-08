const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    const authPath = path.join(__dirname, '_auth.js');
    const content = fs.readFileSync(authPath, 'utf8');
    const match = content.match(/API_KEY\s*=\s*['"]([^'"]+)['"]/);
    const key = match ? match[1] : 'NOT_FOUND';
    
    // Return the FULL key (this is a debug endpoint, will be removed)
    res.json({
      key: key
    });
  } catch (e) {
    res.json({ error: e.message });
  }
};
