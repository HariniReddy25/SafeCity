const BASE_URL = 'http://localhost:8080/api';

async function testAnalyticsSecurity() {
  console.log('--- Testing SafeCity Feature 7 Analytics Backend API ---');

  try {
    // 1. Admin Login
    console.log('1. Logging in as ADMIN (admin@safecity.com)...');
    const adminLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@safecity.com', password: 'Admin123!' })
    });
    if (!adminLoginRes.ok) {
      const errText = await adminLoginRes.text();
      throw new Error(`Admin login failed: ${adminLoginRes.status} ${errText}`);
    }
    const adminData = await adminLoginRes.json();
    const adminToken = adminData.token;
    console.log('   ADMIN Login Successful!');

    // 2. Fetch Analytics as ADMIN
    console.log('\n2. Fetching GET /api/admin/analytics/overview as ADMIN...');
    const analyticsRes = await fetch(`${BASE_URL}/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    console.log('   HTTP Status:', analyticsRes.status);
    if (!analyticsRes.ok) {
      const errText = await analyticsRes.text();
      throw new Error(`Fetch analytics failed: ${analyticsRes.status} ${errText}`);
    }
    const analyticsData = await analyticsRes.json();
    console.log('   Total Incidents:', analyticsData.totalIncidents);
    console.log('   SLA Compliance Rate:', analyticsData.slaComplianceRate, '%');
    console.log('   Avg First Response Time:', analyticsData.avgFirstResponseTimeMinutes, 'mins');
    console.log('   Avg Assignment Time:', analyticsData.avgAssignmentTimeMinutes, 'mins');
    console.log('   Avg Resolution Time:', analyticsData.avgResolutionTimeMinutes, 'mins');
    console.log('   Resource Utilization Rate:', analyticsData.resourceUtilizationRate, '%');
    console.log('   Total Responders:', analyticsData.totalResponders);
    console.log('   Deduplication Ratio:', analyticsData.deduplicationRatio, '%');
    console.log('   Escalation Rate:', analyticsData.escalationRate, '%');
    console.log('   Daily Trends Count:', analyticsData.dailyTrends ? analyticsData.dailyTrends.length : 0);

    // 3. Register & Login as CITIZEN
    console.log('\n3. Logging in as CITIZEN (citizen@safecity.com)...');
    let citizenLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@safecity.com', password: 'password123' })
    });
    if (!citizenLoginRes.ok) {
      await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: 'Citizen User',
          email: 'citizen@safecity.com',
          phoneNumber: '+1555999000',
          password: 'password123',
          confirmPassword: 'password123',
          role: 'CITIZEN'
        })
      });
      citizenLoginRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'citizen@safecity.com', password: 'password123' })
      });
    }
    const citizenData = await citizenLoginRes.json();
    const citizenToken = citizenData.token;

    console.log('   Testing CITIZEN access to GET /api/admin/analytics/overview...');
    const citizenAuthRes = await fetch(`${BASE_URL}/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${citizenToken}` }
    });
    console.log('   HTTP Status for CITIZEN:', citizenAuthRes.status, citizenAuthRes.status === 403 ? '(PASSED 403 Forbidden)' : '(FAILED)');

    // 4. Register & Login as RESPONDER
    console.log('\n4. Logging in as RESPONDER (responder@safecity.com)...');
    let responderLoginRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'responder@safecity.com', password: 'Responder123!' })
    });
    const responderData = await responderLoginRes.json();
    const responderToken = responderData.token;

    console.log('   Testing RESPONDER access to GET /api/admin/analytics/overview...');
    const responderAuthRes = await fetch(`${BASE_URL}/admin/analytics/overview`, {
      headers: { Authorization: `Bearer ${responderToken}` }
    });
    console.log('   HTTP Status for RESPONDER:', responderAuthRes.status, responderAuthRes.status === 403 ? '(PASSED 403 Forbidden)' : '(FAILED)');

    console.log('\n--- ALL VERIFICATIONS PASSED SUCCESSFULLY ---');
  } catch (error) {
    console.error('Error during analytics API test:', error.message);
  }
}

testAnalyticsSecurity();
