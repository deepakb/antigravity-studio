# SKILL: Performance Testing

## Overview
Automated performance and load testing patterns for Node.js APIs and Next.js applications using **k6** (load testing) and **Lighthouse CI** (frontend perf).

## API Load Testing with k6
**k6** by Grafana is an open-source load testing tool written in Go, using JavaScript scripts.

### 1. Installation
```bash
# Mac (Homebrew)
brew install k6

# Linux (Debian/Ubuntu)
sudo gpg -k
sudo gpg --no-default-keyring --keyring /usr/share/keyrings/k6-archive-keyring.gpg --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update && sudo apt-get install k6
```

### 2. k6 Script Pattern
```javascript
// load-tests/api.js (Note: k6 runs pure ES6, not Node APIs)
import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metric to track error rate
const errorRate = new Rate('errors');

export const options = {
  // Define success criteria for CI/CD
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    errors: ['rate<0.01'],            // Error rate must be < 1%
  },
  // Load phases: Ramp up → Hold → Ramp down
  stages: [
    { duration: '30s', target: 50 },  // simulate ramp-up of traffic from 1 to 50 users
    { duration: '1m', target: 50 },   // stay at 50 users
    { duration: '30s', target: 0 },   // ramp-down
  ],
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // 1. Fetch posts list
  const res = http.get(`${BASE_URL}/api/posts`);
  
  const success = check(res, {
    'status is 200': (r) => r.status === 200,
    'body has data array': (r) => r.json('data') !== undefined,
  });
  
  errorRate.add(!success);

  // Think time (simulates real user reading the screen before clicking again)
  sleep(1);
}
```

### 3. Running k6
```bash
# Run locally against dev server
k6 run load-tests/api.js

# Override environment variables
k6 run -e TARGET_URL=https://staging.myapp.com load-tests/api.js

# Output to JSON for CI parsing
k6 run --out json=results.json load-tests/api.js
```

## Frontend Performance with Lighthouse CI (LHCI)
Automate Core Web Vitals checks on every Pull Request.

### 1. Installation
```bash
npm install -D @lhci/cli
```

### 2. Configuration (lighthouserc.js)
```javascript
module.exports = {
  ci: {
    collect: {
      url: ['http://localhost:3000/'], // Pages to test
      startServerCommand: 'npm run start', // Requires a built app (npm run build)
      startServerReadyPattern: 'Ready in', // Text to wait for before testing
      numberOfRuns: 3, // Lighthouse varies; average of 3 runs is more accurate
    },
    assert: {
      preset: 'lighthouse:recommended',
      assertions: {
        // Enforce strict Performance budgets (fail PR if not met)
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 1.0 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        
        // Critical Core Web Vitals
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['warn', { maxNumericValue: 0.1 }],
      },
    },
    upload: {
      target: 'temporary-public-storage', // Free public upload of report for PRs
    },
  },
};
```

### 3. Usage
```bash
npm run build
npx lhci autorun
```

## GitHub Actions Integration (Performance Gates)
```yaml
# .github/workflows/perf.yml
name: Performance Tests

on:
  pull_request:

jobs:
  load-test-api:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      # Start local API background...
      - name: Run k6 load test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: load-tests/api.js

  lighthouse-ci:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with: { node-version: 22 }
      - run: npm ci && npm run build
      - name: Run Lighthouse CI
        run: npm run lhci:autorun
        # Will fail the job if assertions in lighthouserc.js are not met
```

## Node.js Profiling (Finding CPU Bottlenecks)
```bash
# 1. Run Node.js with built-in profiler
node --prof dist/server.js

# 2. Run k6 load test to generate traffic
k6 run load-tests/api.js

# 3. Process the log file
node --prof-process isolate-0xnnnnnnnnnnnn-v8.log > processed.txt

# Look for high "% ticks" under "JavaScript" section in processed.txt
```
