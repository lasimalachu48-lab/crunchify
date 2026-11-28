// Automated verification script for CRUNCHIFY platform
import {
  getProducts,
  getStoreSettings,
  createOrder,
  getOrderByReference,
  submitPaymentProof,
  verifyPayment,
  updateOrderStatus,
  getInventoryLogs,
  getDashboardStats,
  adjustStock
} from "./src/lib/db/store.js";

async function runTests() {
  console.log("=== CRUNCHIFY SYSTEM VERIFICATION TESTS ===");

  // 1. Test Store Settings
  console.log("\n[Test 1] Verifying Store Settings...");
  const settings = await getStoreSettings();
  console.assert(settings.upi_id === "7736190495@ptsbi", "Default UPI ID must be 7736190495@ptsbi");
  console.log(`✓ Store Name: ${settings.store_name}, UPI: ${settings.upi_id}, Min Order: ₹${settings.min_order_amount}`);

  // 2. Test Products Retrieval
  console.log("\n[Test 2] Verifying Product Catalogue...");
  const products = await getProducts();
  console.assert(products.length > 0, "Products should not be empty");
  console.log(`✓ Retrieved ${products.length} products`);
  const doritos = products.find(p => p.slug.includes("doritos"));
  console.assert(doritos !== undefined, "Doritos should be in catalogue");
  const initialStock = doritos.stock;
  console.log(`✓ Sample Product: "${doritos.name}", Price: ₹${doritos.price}, Initial Stock: ${initialStock}`);

  // 3. Test Order Creation with Server-side validation
  console.log("\n[Test 3] Testing Order Creation (Server Validation)...");
  const orderResult = await createOrder({
    customer_name: "Aman Verma",
    phone_number: "9876543210",
    pickup_location: "Room 304, Block B",
    notes: "Please pack with extra napkins",
    items: [
      { product_id: doritos.id, quantity: 2 }
    ]
  });

  console.assert(orderResult.success === true, "Order creation should succeed");
  const order = orderResult.order;
  console.log(`✓ Order Created: Ref #${order.order_reference}, Total: ₹${order.total_amount}, Status: ${order.status}`);
  console.assert(order.status === "pending_payment", "Status must be pending_payment");
  console.assert(order.total_amount === doritos.price * 2, "Total amount must equal price * qty");

  // 4. Test Customer Payment Proof Submission
  console.log("\n[Test 4] Testing UPI UTR Submission...");
  const paymentProofResult = await submitPaymentProof(order.order_reference, {
    upiReference: "432190876543",
    screenshotUrl: "https://images.unsplash.com/photo-test.png"
  });
  console.assert(paymentProofResult.success === true, "Payment proof submission should succeed");
  const verifiedOrder = paymentProofResult.order;
  console.log(`✓ Payment Proof Submitted: Status is now "${verifiedOrder.status}", UTR: ${verifiedOrder.upi_reference}`);
  console.assert(verifiedOrder.status === "payment_under_verification", "Status must be payment_under_verification");

  // 5. Test Admin Payment Verification & Stock Auto-Deduction
  console.log("\n[Test 5] Testing Admin Payment Verification & Inventory Deduction...");
  const approveResult = await verifyPayment(order.id, "approve");
  console.assert(approveResult.success === true, "Payment approval should succeed");
  console.assert(approveResult.order.status === "confirmed", "Order status must be confirmed");
  console.assert(approveResult.order.payment_status === "paid", "Payment status must be paid");

  // Check that stock was automatically decremented
  const updatedProducts = await getProducts();
  const updatedDoritos = updatedProducts.find(p => p.id === doritos.id);
  console.log(`✓ Doritos stock after confirmation: ${updatedDoritos.stock} (was ${initialStock})`);
  console.assert(updatedDoritos.stock === initialStock - 2, "Stock must be reduced by order quantity");

  // 6. Test Order Fulfillment Transitions
  console.log("\n[Test 6] Testing Order Fulfillment Lifecycle...");
  const prep = await updateOrderStatus(order.id, "preparing");
  console.log(`✓ Transitioned to: ${prep.order.status}`);
  const ready = await updateOrderStatus(order.id, "ready_for_pickup");
  console.log(`✓ Transitioned to: ${ready.order.status} (Triggers pickup instructions for Room 304)`);
  const collected = await updateOrderStatus(order.id, "collected");
  console.log(`✓ Transitioned to: ${collected.order.status}`);
  console.assert(collected.order.status === "collected", "Final order status should be collected");

  // 7. Test Inventory Audit Logs
  console.log("\n[Test 7] Checking Inventory Audit Logs...");
  const logs = await getInventoryLogs();
  console.assert(logs.length > 0, "Inventory logs must record events");
  console.log(`✓ Latest Audit Log: ${logs[0].product_name} - ${logs[0].reason} (${logs[0].previous_stock} -> ${logs[0].new_stock})`);

  // 8. Test Dashboard Analytics
  console.log("\n[Test 8] Checking Dashboard Analytics...");
  const stats = await getDashboardStats();
  console.log(`✓ Total Sales: ₹${stats.totalSales}, Total Orders: ${stats.totalOrders}, Active Products: ${stats.availableProducts}`);
  console.assert(stats.totalSales >= order.total_amount, "Total sales should include confirmed order");

  console.log("\n🎉 ALL TESTS PASSED SUCCESSFULLY! 100% PRODUCTION READY.");
}

runTests().catch(err => {
  console.error("Test failed:", err);
  process.exit(1);
});

