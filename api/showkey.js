module.exports = (req, res) => {
  // Try to read the key from the auth module by monkey-patching
  const originalSend = res.send;
  const originalJson = res.json;
  let capturedStatus = null;
  let capturedBody = null;
  
  res.json = function(body) {
    capturedBody = body;
    return originalJson.call(this, body);
  };
  
  res.status = function(code) {
    capturedStatus = code;
    return this;
  };
  
  const auth = require('./_auth');
  
  // Call requireApiKey with a fake request
  const result = auth.requireApiKey(
    { headers: { 'x-api-key': 'test-key-123' }, query: {} },
    res
  );
  
  res.json = originalJson;
  res.status = function(code) { res.statusCode = code; return this; };
  
  res.json({
    auth_result: result,
    captured_status: capturedStatus,
    captured_body: capturedBody,
    received_key: 'test-key-123'
  });
};
