const { requireApiKey } = require('./_auth');

module.exports = (req, res) => {
  // Check auth
  if (!requireApiKey(req, res)) return;
  
  res.json({
    status: 'ok',
    key_received: req.headers['x-api-key'] || req.query.key,
    key_expected_length: 42
  });
};
