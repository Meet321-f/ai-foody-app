import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:5001/api';

/**
 * TEST CONFIG:
 * In development, we use 'x-ratelimit-bypass: foody-dev-bypass' to skip actual limit checks
 * OR we can use it to test if the rate limiter blocks when the header is MISSING.
 */
const BYPASS_HEADER = { 'x-ratelimit-bypass': 'foody-dev-bypass' };
const MOCK_AUTH = { 'Authorization': 'Bearer MOCK_TOKEN' }; // Replace with a valid Clerk session token for real test

const testRateLimit = async (endpoint, limit, testBurst = false) => {
  console.log(`\n🚀 Testing Rate Limit for: ${endpoint}`);
  console.log(`Window Limit: ${limit}`);
  
  const iterations = testBurst ? 7 : limit + 5;
  const requests = [];
  
  for (let i = 0; i < iterations; i++) {
    requests.push(
      fetch(`${BASE_URL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...MOCK_AUTH
          // Note: NOT sending BYPASS_HEADER here because we WANT to test the limiter
        },
        body: JSON.stringify({ prompt: 'Test prompt', title: 'Test Recipe' })
      })
    );
  }

  const results = await Promise.all(requests);
  const statuses = results.map(r => r.status);
  
  const success = statuses.filter(s => s === 200 || s === 201).length;
  const blocked = statuses.filter(s => s === 429).length;
  const authError = statuses.filter(s => s === 401).length;

  console.log(`📊 Results: Success=${success}, Blocked=${blocked}, AuthError=${authError}`);
  
  if (blocked > 0) {
    const firstBlocked = results.find(r => r.status === 429);
    const errorBody = await firstBlocked.json();
    console.log('📄 429 Error Response:', JSON.stringify(errorBody, null, 2));
    console.log('🏁 Retry-After Header:', firstBlocked.headers.get('retry-after'));
  }

  if (authError > 0) {
    console.log('⚠️  Note: Test requires a valid Clerk token to pass the auth check before rate limiting.');
  }
};

/**
 * QUICK TEST RUN:
 * Run this with: node src/testRateLimit.js
 */
// 1. Test Burst (Limit 5 per min)
// testRateLimit('/ai/suggestions', 5, true); 

// 2. Test Daily (Limit 10 per day)
// testRateLimit('/ai/generate-full-recipe', 10);
