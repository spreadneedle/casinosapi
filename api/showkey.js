const crypto = require('crypto');
const { API_KEY } = require('./_auth');

module.exports = (req, res) => {
  res.json({
    key_hash: crypto.createHash('sha256').update(API_KEY).digest('hex').substring(0, 16),
    key_length: API_KEY.length,
    key_prefix: API_KEY.substring(0, 10)
  });
};
