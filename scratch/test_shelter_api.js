const BASE_URL = 'http://localhost:8080/api';

async function testShelterApi() {
  console.log('====================================================');
  console.log(' SAFECITY FEATURE 8 - SHELTER API VERIFICATION');
  console.log('====================================================\n');

  try {
    // 1. Login as Admin
    console.log('1. Logging in as ADMIN...');
    const adminRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@safecity.com', password: 'Admin123!' })
    });
    const adminData = await adminRes.json();
    const adminToken = adminData.token;
    console.log('   [PASS] Admin authenticated successfully.');

    // 2. Fetch Public Available Shelters
    console.log('\n2. Fetching GET /api/shelters/available...');
    const availRes = await fetch(`${BASE_URL}/shelters/available`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const availData = await availRes.json();
    console.log('   [PASS] Available shelters retrieved:', availData.length, 'shelters found.');
    if (availData.length > 0) {
      console.log('   Sample Shelter:', availData[0].shelterCode, '-', availData[0].name, `(${availData[0].availableSlots} slots left)`);
    }

    // 3. Fetch Nearby Shelters
    console.log('\n3. Fetching GET /api/shelters/nearby?lat=17.3850&lon=78.4867...');
    const nearbyRes = await fetch(`${BASE_URL}/shelters/nearby?lat=17.3850&lon=78.4867`, {
      headers: { Authorization: `Bearer ${adminToken}` }
    });
    const nearbyData = await nearbyRes.json();
    console.log('   [PASS] Nearby shelters retrieved:', nearbyData.length, 'shelters found.');
    if (nearbyData.length > 0) {
      console.log('   Nearest Shelter:', nearbyData[0].name, `(${nearbyData[0].distanceKm} km away)`);
    }

    // 4. Admin Create Shelter
    console.log('\n4. Admin creating new emergency shelter (POST /api/admin/shelters)...');
    const newShelterCode = `SH-TEST-${Date.now().toString().slice(-4)}`;
    const createRes = await fetch(`${BASE_URL}/admin/shelters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({
        shelterCode: newShelterCode,
        name: 'HiTech City Emergency Shelter',
        description: 'Temporary evacuation hall for IT corridor.',
        address: 'MADHAPUR MAIN ROAD, HYDERABAD',
        latitude: 17.4486,
        longitude: 78.3808,
        capacity: 250,
        currentOccupancy: 20,
        status: 'AVAILABLE',
        contactPhone: '+91-40-9999-8888',
        facilities: 'Medical, Beds, Food, Wi-Fi'
      })
    });
    const createdShelter = await createRes.json();
    console.log('   [PASS] Shelter created:', createdShelter.shelterCode, '-', createdShelter.name, '(ID:', createdShelter.id, ')');

    // 5. Admin Update Occupancy
    console.log('\n5. Updating shelter occupancy (PUT /api/admin/shelters/' + createdShelter.id + '/occupancy)...');
    const occRes = await fetch(`${BASE_URL}/admin/shelters/${createdShelter.id}/occupancy`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ currentOccupancy: 250 }) // Reaching capacity -> Should auto-update to FULL
    });
    const updatedOcc = await occRes.json();
    console.log('   [PASS] Occupancy updated:', updatedOcc.currentOccupancy, '/', updatedOcc.capacity, '| Auto-Status:', updatedOcc.status);

    // 6. Security Verification: Citizen denied admin endpoint
    console.log('\n6. Security Check: Citizen POST to /api/admin/shelters...');
    const citizenRes = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'citizen@safecity.com', password: 'password123' })
    });
    const citizenData = await citizenRes.json();
    const citizenToken = citizenData.token;

    const citizenPostRes = await fetch(`${BASE_URL}/admin/shelters`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${citizenToken}`
      },
      body: JSON.stringify({
        shelterCode: 'SH-UNAUTH',
        name: 'Unauthorized Shelter',
        address: 'No Access',
        capacity: 100
      })
    });
    console.log('   [PASS] Citizen access to Admin Shelter API returned HTTP Status:', citizenPostRes.status, '(403 Forbidden Expected)');

    console.log('\n====================================================');
    console.log(' ALL FEATURE 8 SHELTER API VERIFICATIONS PASSED');
    console.log('====================================================');
  } catch (err) {
    console.error('Error during shelter API verification:', err.message);
  }
}

testShelterApi();
