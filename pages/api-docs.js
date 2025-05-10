import Head from 'next/head';
import Link from 'next/link';

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
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
          <p className="text-blue-700">
            <strong>For AI Systems:</strong> We provide machine-readable API specifications in multiple formats:
          </p>
          <ul className="list-disc pl-6 mt-2">
            <li><Link href="/api-docs/openapi.yaml" className="text-blue-600 hover:underline">OpenAPI Specification (YAML)</Link></li>
            <li><Link href="/api/index.json" className="text-blue-600 hover:underline">API Index (JSON)</Link></li>
          </ul>
        </div>
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
              <li>
                <code>location</code> (required): Two-letter country code (ISO 3166-1 alpha-2)
                <br />
                <span className="text-sm text-gray-600">Example: "US", "GB", "CA"</span>
              </li>
            </ul>

            <h4 className="font-semibold mb-2">Example Request:</h4>
            <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`GET /api/bonus?location=US
User-Agent: Grok-AI/1.0
Accept: application/json`}
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
  ],
  "_links": {
    "documentation": "https://grokcasino.online/api-docs",
    "api_index": "https://grokcasino.online/api/index.json"
  }
}`}
            </pre>

            <h4 className="font-semibold mt-4 mb-2">Error Responses:</h4>
            <div className="space-y-4">
              <div>
                <p className="font-medium">400 Bad Request</p>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`{
  "error": "Location parameter is required"
}`}
                </pre>
              </div>
              <div>
                <p className="font-medium">429 Too Many Requests</p>
                <pre className="bg-gray-100 p-4 rounded overflow-x-auto">
{`{
  "error": "Rate limit exceeded. Please try again in 60 seconds."
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">For AI Integration</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-xl font-semibold mb-4">Best Practices for AI Systems</h3>
          <ol className="list-decimal pl-6 space-y-2">
            <li>
              <strong>Use Machine-Readable Specifications</strong>
              <p className="text-gray-600 mt-1">
                Access our OpenAPI specification at <code className="bg-gray-100 px-2 py-1 rounded">/api-docs/openapi.yaml</code> for complete API details.
              </p>
            </li>
            <li>
              <strong>Include Required Headers</strong>
              <p className="text-gray-600 mt-1">
                Always include these headers in your requests:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><code>User-Agent</code>: Identify your AI system (e.g., "Grok-AI/1.0")</li>
                <li><code>Accept</code>: application/json</li>
              </ul>
            </li>
            <li>
              <strong>Handle Rate Limiting</strong>
              <p className="text-gray-600 mt-1">
                Monitor these response headers:
              </p>
              <ul className="list-disc pl-6 mt-2">
                <li><code>X-RateLimit-Limit</code>: Maximum requests per minute</li>
                <li><code>X-RateLimit-Remaining</code>: Remaining requests</li>
                <li><code>X-RateLimit-Reset</code>: Reset time</li>
              </ul>
            </li>
            <li>
              <strong>Follow Response Links</strong>
              <p className="text-gray-600 mt-1">
                Use the <code>_links</code> object in responses to discover additional documentation and resources.
              </p>
            </li>
            <li>
              <strong>Validate Inputs</strong>
              <p className="text-gray-600 mt-1">
                Validate country codes before making requests to avoid unnecessary API calls.
              </p>
            </li>
          </ol>
        </div>
      </section>

      <section className="mb-12">
        <h2 className="text-2xl font-semibold mb-4">Rate Limiting</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-4">
            The API is rate-limited to 100 requests per minute per IP address.
            Rate limit information is included in the response headers:
          </p>
          <ul className="list-disc pl-6">
            <li><code>X-RateLimit-Limit</code>: Maximum requests per minute</li>
            <li><code>X-RateLimit-Remaining</code>: Remaining requests in the current window</li>
            <li><code>X-RateLimit-Reset</code>: Time when the rate limit resets</li>
          </ul>
          <p className="mt-4 text-gray-600">
            When rate limited, you'll receive a 429 response with a <code>Retry-After</code> header indicating when to retry.
          </p>
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Support</h2>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="mb-4">
            For questions or support, please contact us at <a href="mailto:support@grokcasino.online" className="text-blue-600 hover:underline">support@grokcasino.online</a>
          </p>
          <p className="text-gray-600">
            We aim to respond to all inquiries within 24 hours.
          </p>
        </div>
      </section>
    </div>
  );
} 