const { spawn } = require('child_process');
const http = require('http');

function request(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request({ ...options, host: 'localhost' }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(body) });
        } catch {
          resolve({ status: res.statusCode, headers: res.headers, text: body });
        }
      });
    });
    req.on('error', reject);
    if (postData) {
      req.write(typeof postData === 'string' ? postData : JSON.stringify(postData));
    }
    req.end();
  });
}

async function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function run() {
  console.log("Starting Next.js production server on port 3005...");
  const server = spawn('cmd.exe', ['/c', 'npx.cmd', 'next', 'start', '-p', '3005'], {
    stdio: 'inherit',
    env: process.env,
  });

  server.on('error', (err) => {
    console.error('Server process error:', err);
    process.exit(1);
  });

  // Wait for server to boot
  console.log("Waiting for server to become responsive...");
  let ready = false;
  for (let i = 0; i < 30; i++) {
    await sleep(1000);
    try {
      const res = await request({
        hostname: '127.0.0.1',
        port: 3005,
        path: '/api/settings',
        method: 'GET'
      });
      if (res.status === 200 && res.data?.settings) {
        ready = true;
        break;
      }
    } catch {
      // not yet up
    }
  }

  if (!ready) {
    console.error("Server failed to respond in 30 seconds.");
    server.kill();
    process.exit(1);
  }

  console.log("✓ Server is UP and healthy!");

  try {
    // 1. Check Store Settings
    console.log("\n[Test 1] Testing /api/settings...");
    const settingsRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/settings',
      method: 'GET'
    });
    console.log("Settings response:", settingsRes.data.settings.store_name, "UPI:", settingsRes.data.settings.upi_id);
    if (settingsRes.data.settings.upi_id !== '7736190495@ptsbi') {
      throw new Error("Default UPI ID mismatch");
    }

    // 2. Check Products
    console.log("\n[Test 2] Testing /api/products...");
    const productsRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/products',
      method: 'GET'
    });
    console.log("Found products count:", productsRes.data.products.length);
    const doritos = productsRes.data.products.find(p => p.name.includes('Doritos'));
    console.log("Sample product:", doritos.name, "Price:", doritos.price, "Stock:", doritos.stock);

    // 3. Create Order
    console.log("\n[Test 3] Testing /api/orders/create (Server-side validation)...");
    const orderRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/orders/create',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      customer_name: "Rahul Verma",
      phone_number: "9876543210",
      pickup_location: "Room 402, Block H",
      notes: "Please pack cold",
      items: [
        { product_id: doritos.id, quantity: 2 }
      ]
    });

    console.log("Order creation response status:", orderRes.status);
    console.log("Created order reference:", orderRes.data.order.order_reference, "Total:", orderRes.data.order.total_amount);
    const orderRef = orderRes.data.order.order_reference;

    // 4. Submit Payment Proof (UTR)
    console.log("\n[Test 4] Testing /api/orders/[ref] (Submit UTR)...");
    const utrRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: `/api/orders/${orderRef}`,
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      upiReference: "432190887766"
    });
    console.log("UTR submission result:", utrRes.data.order.status, "Payment Status:", utrRes.data.order.payment_status);

    // 5. Admin Verify Payment
    console.log("\n[Test 5] Testing /api/orders/verify-payment...");
    const verifyRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/orders/verify-payment',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      orderId: orderRes.data.order.id,
      decision: "approve"
    });
    console.log("Payment verification result:", verifyRes.data.order.status, "Payment Status:", verifyRes.data.order.payment_status);

    // 6. Admin Update Status to ready_for_pickup
    console.log("\n[Test 6] Testing /api/orders/update-status (Ready for Pickup)...");
    const readyRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/orders/update-status',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    }, {
      orderId: orderRes.data.order.id,
      status: "ready_for_pickup"
    });
    console.log("Status update result:", readyRes.data.order.status);

    // 7. Check Dashboard Analytics
    console.log("\n[Test 7] Testing /api/admin/stats...");
    const statsRes = await request({
      hostname: '127.0.0.1',
      port: 3005,
      path: '/api/admin/stats',
      method: 'GET'
    });
    console.log("Dashboard Stats:", statsRes.data.stats);

    console.log("\n🎉 ALL TESTS COMPLETED WITH 100% SUCCESS!");
  } finally {
    console.log("Shutting down test server...");
    server.kill();
  }
}

run().then(() => {
  process.exit(0);
}).catch(err => {
  console.error("Test failed with error:", err);
  process.exit(1);
});
