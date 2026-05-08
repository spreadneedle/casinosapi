module.exports = (req, res) => {
  try {
    const data = require('./bonus_enhanced');
    res.json({
      success: true,
      exports: Object.keys(data),
      hasDefault: !!data.default,
      defaultLength: data.default ? data.default.length : 0
    });
  } catch (e) {
    res.json({
      success: false,
      error: e.message,
      stack: e.stack.split('\n').slice(0, 5)
    });
  }
};
