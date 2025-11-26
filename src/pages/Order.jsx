// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App"; // or import VITE_BACKEND_URL

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loadingActionId, setLoadingActionId] = useState(null);

  const apiOrigin = backendUrl.replace(/\/api\/?$/, "");


const isImg = (s = "") => /\.(png|jpe?g|webp|gif|bmp|avif)$/i.test(s);

// normalize absolute vs relative proof URLs
const toUrl = (u) => (u?.startsWith("http") ? u : `${apiOrigin}${u || ""}`);

  const fetchOrders = async () => {
    try {
      const res = await axios.get(`${backendUrl}/api/order/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setOrders(res.data.orders || []);
    } catch (err) {
      console.error(err);
      toast.error("Failed to fetch orders");
    }
  };

  useEffect(() => {
    if (!token) return;
    fetchOrders();
  }, [token]);

const handleAction = async (orderId, action) => {
  try {
    let reason = "";
    if (action === "reject") {
      reason = window.prompt(
        "Optional reason for rejection (this will be sent to the customer):",
        ""
      ) || "";
    }

    const cleanId = String(orderId).trim();       // ⬅️ sanitize here
    const cleanAction = String(action).trim();

  

    setLoadingActionId(cleanId);





     
    await axios.post(
      `${backendUrl}/api/order/admin/confirm-payment`,
      { orderId: cleanId, action: cleanAction, reason },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    toast.success("Order updated");
    await fetchOrders();
  } catch (err) {
    console.error(err);
    // show server message if available
    const msg = err?.response?.data?.message || "Update failed";
    toast.error(msg);
  } finally {
    setLoadingActionId(null);
  }
};


const handleRequestProof = async (orderId) => {
    try {
      const cleanId = String(orderId).trim();
      setLoadingActionId(cleanId);

      const res = await axios.post(
        `${backendUrl}/api/order/admin/request-proof`,
        { orderId: cleanId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Email sent to customer to re-upload proof");
      console.log("Upload link:", res?.data?.uploadLink);
    } catch (err) {
      console.error(err);
      toast.error(err?.response?.data?.message || "Failed to send request");
    } finally {
      setLoadingActionId(null);
    }
  };


  if (!token) return <p className="p-4">Please login as admin to view orders.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">Orders</h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div key={o._id} className="bg-white p-4 rounded-lg border shadow-sm">
              {/* Order Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2 mb-3">
                <div>
                  <h3 className="font-semibold text-base md:text-lg">Order: {o._id}</h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Placed: {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div>
                  <span
                    className={`px-2 py-1 md:px-3 md:py-1 rounded-full text-xs md:text-sm ${
                      o.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : o.paymentStatus === "Half Paid"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {o.paymentStatus}
                  </span>
                </div>
              </div>

              {/* Customer Info */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <div>
                  <p>
                    <strong>Name:</strong> {o.name}
                  </p>
                  <p>
                    <strong>Phone:</strong> {o.phone}
                  </p>
                  <p>
                    <strong>Email:</strong> {o.email}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Address:</strong> {o.address}, {o.city}, {o.state}
                  </p>
                  {o.note && (
                    <p>
                      <strong>Note:</strong> {o.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Order Items */}
              {/* Order Items */}
<div className="mt-4">
  <p className="font-medium text-sm md:text-base">Items</p>
  <ul className="list-disc pl-4 md:pl-6 mt-1 space-y-1">
    {(o.items || []).map((it, idx) => {
      const colorText =
        it.variantColor || it.variant || (it.key?.split("_")[1] || "");
      const fullName = `${(it.engravingFirstName || "").trim()} ${(it.engravingLastName || "").trim()}`.trim();

      return (
        <li key={idx} className="text-sm flex flex-wrap items-center gap-2">
          <span>
            {it.name} × {it.quantity} = {currency} {it.total}
          </span>

          {/* Color chip (existing) */}
          {colorText && (
            <span className="ml-2 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100">
              <span
                className="inline-block w-3 h-3 rounded-full border"
                style={{ background: colorText }}
              />
              <span>Color: {colorText}</span>
            </span>
          )}

          {/* NEW: Engraved Name chip */}
          {fullName && (
            <span className="inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="currentColor"
              >
                <path d="M12 2C6.48 2 2 5.58 2 10c0 2.38 1.28 4.51 3.29 6l-1.02 3.67a1 1 0 0 0 1.3 1.22L9 19.9c.95.22 1.96.34 3 .34 5.52 0 10-3.58 10-8s-4.48-8-10-8Zm-3 9h6a1 1 0 1 1 0 2H9a1 1 0 1 1 0-2Z" />
              </svg>
              <span>Name: {fullName}</span>
            </span>
          )}
        </li>
      );
    })}
  </ul>
</div>


              {/* Order Summary */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div>
                  <p>
                    <strong>Subtotal:</strong> {currency} {o.subtotal}
                  </p>
                  <p>
                    <strong>Shipping:</strong> {currency} {o.shipping}
                  </p>
                </div>
                <div>
                  <p>
                    <strong>Total:</strong> {currency} {o.total}
                  </p>
                  <p>
                    <strong>Advance Required:</strong> {currency} {o.advanceRequired}
                  </p>
                </div>
              </div>

              {/* Payment Info */}
              <div className="mt-4 text-sm">
                <p>
                  <strong>Payment Method:</strong> {String(o.paymentMethod || "").toUpperCase()}
                </p>
                {o.transactionRef && (
                  <p>
                    <strong>Txn Ref:</strong> {o.transactionRef}
                  </p>
                )}
                {o.senderLast4 && (
                  <p>
                    <strong>Sender Last 4:</strong> {o.senderLast4}
                  </p>
                )}
              </div>

              {/* Payment Proofs */}
             {/* Payment Proofs */}
{/* Payment Proofs */}
<div className="mt-4">
  <p className="font-medium text-sm md:text-base">Proofs</p>

  <div className="flex flex-col gap-2 mt-2">
    {o.paymentProofs?.length ? (
      o.paymentProofs.map((pf, i) => {
        const name = pf.filename || pf.url || `proof-${i}`;
        const url  = toUrl(pf.url);

        return (
          <div key={`${name}-${i}`} className="border rounded p-2">
            {/* Thumbnail (if image); falls back to nothing if not image */}
            {isImg(name) && (
              <img
                src={url}
                alt="payment proof"
                className="h-28 w-40 object-contain mb-2"
                loading="lazy"
                onError={(e) => {
                  // keep the URL link visible even if image fails
                  e.currentTarget.style.display = "none";
                }}
              />
            )}

            {/* Always show the URL as a link so you can verify it */}
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline text-sm break-all"
              title={name}
            >
              {url}
            </a>

            {/* Small filename note */}
            <div className="text-[10px] text-gray-500 mt-1 truncate">{name}</div>
          </div>
        );
      })
    ) : (
      <p className="text-sm text-gray-500">No proof uploaded</p>
    )}
  </div>
</div>


              {/* Action Buttons */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction(o._id, "confirm")}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-60"
                  disabled={loadingActionId === o._id}
                >
                  {loadingActionId === o._id ? "Processing..." : "Confirm Payment"}
                </button>

                <button
                  onClick={() => handleAction(o._id, "mark-half")}
                  className="px-3 py-2 bg-yellow-600 text-white rounded text-sm disabled:opacity-60"
                  disabled={loadingActionId === o._id}
                >
                  {loadingActionId === o._id ? "Processing..." : "Mark Half Paid"}
                </button>

                <button
                  onClick={() => handleAction(o._id, "reject")}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-60"
                  disabled={loadingActionId === o._id}
                >
                  {loadingActionId === o._id ? "Processing..." : "Reject"}
                </button>

                <button
  onClick={() => handleRequestProof(o._id)}
  className="px-3 py-2 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
  disabled={loadingActionId === o._id}
>
  {loadingActionId === o._id ? "Sending..." : "Request Proof Again"}
</button>

              </div>

              {/* Optional: Action history (if your model has it) */}
              {o.actionsHistory && o.actionsHistory.length > 0 && (
                <div className="mt-4 text-xs text-gray-600">
                  <strong>History:</strong>
                  <ul className="mt-1 space-y-1">
                    {o.actionsHistory.map((h, i) => (
                      <li key={i}>
                        {new Date(h.at).toLocaleString()} — {h.adminName || h.adminId || "admin"} — {h.action}
                        {h.reason ? ` — ${h.reason}` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Order;
