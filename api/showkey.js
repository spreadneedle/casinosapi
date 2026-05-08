const fs = require('fs');
const path = require('path');

module.exports = (req, res) => {
  try {
    // Read the _auth.js file directly
    const authPath = path.join(__dirname, '_auth.js');
    const content = fs.readFileSync(authPath, 'utf8');
    
    // Extract the key using regex
    const match = content.match(/API_KEY\s*=\s*['"]([^'"]+)['"]/);
    const key = match ? match[1] : 'NOT_FOUND';
    
    res.json({
      key_found: !!match,
      key_length: key.length,
      key_prefix: key.substring(0, 15),
      key_suffix: key.substring(key.length - 6)
    });
  } catch (e) {
    res.json({
      error: e.message,
      files_in_dir: fs.readdirSync(__dirname)
    });
  }
};
