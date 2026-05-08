module.exports = (req, res) => {
  try {
    const auth = require('./_auth');
    res.json({
      exports: Object.keys(auth),
      hasApiKey: 'API_KEY' in auth,
      hasRequireApiKey: 'requireApiKey' in auth
    });
  } catch (e) {
    res.json({
      error: e.message,
      stack: e.stack.split('\n').slice(0, 3)
    });
  }
};
