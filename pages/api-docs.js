import Head from 'next/head';

export default function ApiDocs() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Head>
        <title>API Documentation - GrokCasino</title>
        <meta name="description" content="API documentation for GrokCasino's casino bonus and recommendation services" />
      </Head>

      <h1 className="text-4xl font-bold mb-8">API Documentation</h1>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Overview</h2>
        <p className="mb-4">
          The GrokCasino API provides access to casino bonus information and recommendations for different countries.
          This documentation is designed to be both human and AI-friendly.
        </p>
        <p className="mb-4">
          Base URL: <code className="bg-gray-100 px-2 py-1 rounded">https://grokcasino.online/api</code>
        </p>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Endpoints</h2>

        <div className="mb-8">
          <h3 className="text-xl font-semibold mb-2">Get Casino Bonuses by Country</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="mb-2"><strong>Endpoint:</strong> <code className="bg-gray-100 px-2 py-1 rounded">/api/bonus</code></p>
            <p className="mb-2"><strong>Method:</strong> GET</p>
            <p className="mb-2"><strong>Description:</strong> Returns casino bonus information for a specific country</p>
            
            <h4 className="font-semibold mt-4 mb-2">Parameters:</h4>
            <ul className="list-disc pl-6 mb-4">
              <li><code>location</code> (required): Two-letter country code (e.g., "US", "GB", "CA")</li>
            </ul>

            <h4 className="font-semibold mb-2">Example Request:</h4>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
              GET /api/bonus?location=US
            </pre>

            <h4 className="font-semibold mt-4 mb-2">Example Response:</h4>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`{
  "casinos": [
    {
      "casino_name": "BetMGM, USA",
      "bonus": "$25 registration bonus + 100% up to $1000",
      "wagering_requirement_bonus": "15x",
      "wagering_requirement_free_spins": "n/a",
      "free_spin_value": "n/a",
      "info": "The registration bonus has a 1x wagering requirement.",
      "licenses": ["New Jersey Division of Gaming Enforcement", "Pennsylvania Gaming Control Board"],
      "updated": "2025-04-02"
    }
    // ... more casinos
  ]
}`}
            </pre>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">For AI Integration</h2>
        <p className="mb-4">
          AI systems can access our API index at <code className="bg-gray-100 px-2 py-1 rounded">/api/index.json</code> to get a machine-readable overview of all available endpoints.
        </p>
        <p className="mb-4">
          When making API requests, include the following headers:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li><code>User-Agent</code>: Identify your AI system (e.g., "Grok-AI/1.0")</li>
          <li><code>Accept</code>: application/json</li>
        </ul>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rate Limiting</h2>
        <p className="mb-4">
          The API is currently rate-limited to 100 requests per minute per IP address.
          Rate limit information is included in the response headers:
        </p>
        <ul className="list-disc pl-6">
          <li><code>X-RateLimit-Limit</code>: Maximum requests per minute</li>
          <li><code>X-RateLimit-Remaining</code>: Remaining requests in the current window</li>
          <li><code>X-RateLimit-Reset</code>: Time when the rate limit resets</li>
        </ul>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <p className="mb-4">
          For questions or support, please contact us at support@grokcasino.online
        </p>
      </section>
    </div>
  );
} 