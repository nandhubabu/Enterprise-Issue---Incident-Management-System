const http = require('http');

function post(path, body, token) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
      }
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path, token) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: 'GET',
      headers: {}
    };
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }

    const req = http.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function run() {
  console.log('====================================================');
  console.log('  NEON POSTGRESQL END-TO-END VERIFICATION SUITE');
  console.log('====================================================');

  console.log('\n--- 1. Testing Actuator Health & DB Connectivity ---');
  const health = await get('/actuator/health');
  console.log('Actuator Health HTTP Status:', health.status);
  console.log('Overall Status:', health.data?.status);
  console.log('Database Component Status:', health.data?.components?.db?.status);
  console.log('Database Details:', health.data?.components?.db?.details);

  if (health.data?.components?.db?.status !== 'UP') {
    throw new Error('Database is not reported as UP by Spring Boot Actuator!');
  }

  console.log('\n--- 2. Testing Authentication (Neon DB User Credentials) ---');
  const loginRes = await post('/api/auth/login', { username: 'admin', password: 'admin123' });
  console.log('Login HTTP Status:', loginRes.status);
  
  if (!loginRes.data || !loginRes.data.token) {
    console.error('Login failed:', loginRes);
    throw new Error('Failed to obtain JWT token from Neon DB user');
  }
  const token = loginRes.data.token;
  console.log('JWT Token successfully issued!');
  console.log('User Profile:', loginRes.data.user);

  console.log('\n--- 3. Testing Incidents Query (Fetched Live from Neon) ---');
  const incidentsRes = await get('/api/incidents', token);
  console.log('Incidents Query HTTP Status:', incidentsRes.status);
  const incidents = incidentsRes.data?.content || [];
  console.log(`Retrieved ${incidents.length} incident(s) from Neon PostgreSQL:`);
  incidents.forEach(inc => {
    console.log(`  • [#${inc.id}] [${inc.severity}] ${inc.title} - Priority: ${inc.priority}, Status: ${inc.status}`);
  });

  console.log('\n--- 4. Testing Write Operation to Neon (Creating New Incident) ---');
  const testIncidentPayload = {
    title: 'Neon Serverless Cloud DB Live Verification',
    description: 'Autonomous end-to-end verification proving reads and writes succeed on Neon PostgreSQL.',
    priority: 'HIGH',
    severity: 'S2'
  };
  const createRes = await post('/api/incidents', testIncidentPayload, token);
  console.log('Create Incident HTTP Status:', createRes.status);
  console.log('Created Incident Details:', createRes.data);

  if (createRes.status !== 201) {
    throw new Error(`Incident creation failed with status ${createRes.status}`);
  }

  console.log('\n--- 5. Verifying Neon DB Persistence (Re-query Incidents) ---');
  const verifyRes = await get('/api/incidents', token);
  const updatedIncidents = verifyRes.data?.content || [];
  console.log(`Updated incident count in Neon: ${updatedIncidents.length}`);
  const persistedIncident = updatedIncidents.find(i => i.id === createRes.data.id);

  if (!persistedIncident) {
    throw new Error('Created incident was not found in subsequent query to Neon DB!');
  }

  console.log('SUCCESS! Verified newly created incident persisted in Neon DB:');
  console.log(`  • ID: ${persistedIncident.id}`);
  console.log(`  • Title: ${persistedIncident.title}`);
  console.log(`  • Severity: ${persistedIncident.severity}`);
  console.log(`  • Priority: ${persistedIncident.priority}`);
  console.log(`  • Status: ${persistedIncident.status}`);
  console.log(`  • Created By: ${persistedIncident.createdBy?.username || persistedIncident.createdByName}`);

  console.log('\n====================================================');
  console.log('  ALL NEON POSTGRESQL E2E TESTS PASSED SUCCESSFULLY! ');
  console.log('====================================================');
}

run().catch(err => {
  console.error('\nE2E VERIFICATION FAILED:', err);
  process.exit(1);
});
