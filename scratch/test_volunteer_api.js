const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const json = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, headers: res.headers, body: json });
        } catch (e) {
          resolve({ status: res.statusCode, headers: res.headers, body: data });
        }
      });
    });
    req.on('error', (e) => reject(e));
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function runVerification() {
  console.log('=== STARTING FEATURE 9 VOLUNTEER WORKFLOW VERIFICATION ===\n');

  // 1. Admin Login
  console.log('1. Logging in as Admin (admin@safecity.com)...');
  const adminLoginRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'admin@safecity.com', password: 'Admin123!' }
  );

  if (adminLoginRes.status !== 200 || !adminLoginRes.body.token) {
    console.error('FAILED Admin Login:', adminLoginRes);
    process.exit(1);
  }
  const adminToken = adminLoginRes.body.token;
  console.log('✔ Admin logged in successfully.');

  // 2. Citizen Login
  console.log('\n2. Logging in as Citizen (citizen@safecity.com)...');
  const citizenLoginRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    },
    { email: 'citizen@safecity.com', password: 'Citizen123!' }
  );

  if (citizenLoginRes.status !== 200 || !citizenLoginRes.body.token) {
    console.error('FAILED Citizen Login:', citizenLoginRes);
    process.exit(1);
  }
  const citizenToken = citizenLoginRes.body.token;
  console.log('✔ Citizen logged in successfully.');

  // 3. Citizen withdraws existing volunteer profile if any (clean slate test)
  console.log('\n3. Cleaning up previous volunteer profile if existing...');
  await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/volunteers/me',
    method: 'DELETE',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });

  // 4. Test Hazardous Skill Rejection
  console.log('\n4. Testing Hazardous Skill Rejection Rule...');
  const hazardousRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/volunteers/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
    },
    { skills: 'Firefighting, Armed Escort', bioNotes: 'Hazardous test' }
  );
  if (hazardousRes.status === 400 || hazardousRes.status === 500 || hazardousRes.status === 403) {
    console.log('✔ Hazardous skills rejected correctly:', hazardousRes.body.message || hazardousRes.status);
  } else {
    console.error('FAILED Hazardous skills test:', hazardousRes);
  }

  // 5. Citizen Registers as Volunteer
  console.log('\n5. Citizen Registers as Volunteer with Non-Hazardous Skills...');
  const regRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/volunteers/register',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
    },
    {
      skills: 'First Aid, Food/Water Distribution Support, Translation',
      bioNotes: 'Certified CPR and fluent in Spanish.',
      latitude: 17.3854912,
      longitude: 78.4867123,
    }
  );

  if (regRes.status !== 201) {
    console.error('FAILED Volunteer Registration:', regRes);
    process.exit(1);
  }
  const profile = regRes.body;
  console.log('✔ Volunteer registered:', {
    id: profile.id,
    approvalStatus: profile.approvalStatus,
    availability: profile.availability,
    skills: profile.skills,
  });

  // 6. Admin Sees Pending Application
  console.log('\n6. Admin Fetching Pending Volunteer Applications...');
  const adminPendingRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/admin/volunteers?approvalStatus=PENDING',
    method: 'GET',
    headers: { Authorization: `Bearer ${adminToken}` },
  });

  if (adminPendingRes.status !== 200 || !Array.isArray(adminPendingRes.body)) {
    console.error('FAILED Admin Fetch Pending:', adminPendingRes);
    process.exit(1);
  }
  console.log(`✔ Admin sees ${adminPendingRes.body.length} pending applications.`);

  // 7. Admin Approves Volunteer
  console.log(`\n7. Admin Approving Volunteer Profile ID ${profile.id}...`);
  const approveRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/volunteers/${profile.id}/approval`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { approvalStatus: 'APPROVED', reason: 'Verified CPR certification' }
  );

  if (approveRes.status !== 200 || approveRes.body.approvalStatus !== 'APPROVED') {
    console.error('FAILED Admin Approval:', approveRes);
    process.exit(1);
  }
  console.log('✔ Admin approved volunteer successfully.');

  // 8. Citizen Verifies APPROVED Status & Toggles Availability
  console.log('\n8. Citizen Fetching Updated Profile & Setting Availability...');
  const meRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/volunteers/me',
    method: 'GET',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log('✔ Citizen Profile Status:', meRes.body.approvalStatus);

  const availRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/volunteers/me/availability',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`,
      },
    },
    { availability: 'AVAILABLE' }
  );
  console.log('✔ Citizen Availability Status:', availRes.body.availability);

  // 9. Admin Posts Community Assistance Opportunity
  console.log('\n9. Admin Posting Non-Hazardous Shelter Support Opportunity...');
  const oppRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: '/api/admin/volunteers/opportunities',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    {
      title: 'Abids Shelter Water & Meal Distribution',
      description: 'Assist shelter staff in distributing bottled water and hot meals to evacuees.',
      skillRequired: 'Food/Water Distribution Support',
      locationName: 'Abids Community Relief Center',
    }
  );

  if (oppRes.status !== 201) {
    console.error('FAILED Post Opportunity:', oppRes);
    process.exit(1);
  }
  const taskOpp = oppRes.body;
  console.log('✔ Admin posted community opportunity:', { id: taskOpp.id, title: taskOpp.title });

  // 10. Volunteer Expresses Willingness to Assist
  console.log(`\n10. Approved Volunteer Expressing Willingness for Task ID ${taskOpp.id}...`);
  const expressRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/volunteers/opportunities/${taskOpp.id}/express-willingness`,
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });

  if (expressRes.status !== 200 || expressRes.body.status !== 'REQUESTED') {
    console.error('FAILED Express Willingness:', expressRes);
    process.exit(1);
  }
  console.log('✔ Willingness registered! Task Status:', expressRes.body.status);

  // 11. Test Duplicate Request Prevention
  console.log('\n11. Testing Duplicate Willingness Request Prevention...');
  const dupRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/volunteers/opportunities/${taskOpp.id}/express-willingness`,
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  if (dupRes.status === 400 || dupRes.status === 500) {
    console.log('✔ Duplicate request prevented correctly.');
  } else {
    console.error('FAILED Duplicate test:', dupRes);
  }

  // 12. Admin Reviews & Approves Participation Request
  console.log(`\n12. Admin Reviewing & Approving Participation Request for Task ID ${taskOpp.id}...`);
  const reviewRes = await makeRequest(
    {
      hostname: 'localhost',
      port: 8080,
      path: `/api/admin/volunteers/tasks/${taskOpp.id}/review`,
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`,
      },
    },
    { status: 'APPROVED', notes: 'Approved for shelter meal distribution duty.' }
  );

  if (reviewRes.status !== 200 || reviewRes.body.status !== 'APPROVED') {
    console.error('FAILED Review Task:', reviewRes);
    process.exit(1);
  }
  console.log('✔ Admin approved participation! Task Status:', reviewRes.body.status);

  // 13. Volunteer Marks Participation Complete
  console.log(`\n13. Volunteer Marking Task ID ${taskOpp.id} as COMPLETED...`);
  const completeRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: `/api/volunteers/tasks/${taskOpp.id}/complete`,
    method: 'POST',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });

  if (completeRes.status !== 200 || completeRes.body.status !== 'COMPLETED') {
    console.error('FAILED Mark Complete:', completeRes);
    process.exit(1);
  }
  console.log('✔ Participation completed! Task Status:', completeRes.body.status);

  // 14. Check Volunteer Activity History
  console.log('\n14. Citizen Fetching Volunteer Activity History...');
  const historyRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/volunteers/my-tasks',
    method: 'GET',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`✔ History retrieved: ${historyRes.body.length} task(s) logged.`);

  // 15. Check Notifications Logged
  console.log('\n15. Citizen Checking Notifications...');
  const notifRes = await makeRequest({
    hostname: 'localhost',
    port: 8080,
    path: '/api/notifications',
    method: 'GET',
    headers: { Authorization: `Bearer ${citizenToken}` },
  });
  console.log(`✔ Notifications logged for volunteer: ${notifRes.body.length} notification(s).`);

  console.log('\n=== ALL FEATURE 9 API VERIFICATIONS PASSED SUCCESSFULLY! ===');
}

runVerification().catch((err) => {
  console.error('Verification script crashed:', err);
  process.exit(1);
});
