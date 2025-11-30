// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { backendUrl, currency } from "../App";

const Order = ({ token }) => {
  const [orders, setOrders] = useState([]);
  const [loadingActionId, setLoadingActionId] = useState(null);

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
        reason =
          window.prompt(
            "Optional reason for rejection (this will be saved on the order):",
            ""
          ) || "";
      }

      const cleanId = String(orderId).trim();
      const cleanAction = String(action).trim();

      setLoadingActionId(cleanId);

      // 👇 match your backend adminUpdatePayment controller
      await axios.post(
        `${backendUrl}/api/order/admin/confirm-payment`,
        { orderId: cleanId, action: cleanAction, reason },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Order updated");
      await fetchOrders();
    } catch (err) {
      console.error(err);
      const msg = err?.response?.data?.message || "Update failed";
      toast.error(msg);
    } finally {
      setLoadingActionId(null);
    }
  };

  if (!token)
    return <p className="p-4">Please login as admin to view orders.</p>;

  return (
    <div className="p-4">
      <h2 className="text-xl md:text-2xl font-bold mb-4 md:mb-6">
        Orders (Stripe)
      </h2>

      {orders.length === 0 ? (
        <p className="text-gray-500">No orders found.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((o) => (
            <div
              key={o._id}
              className="bg-white p-4 rounded-lg border shadow-sm space-y-4"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row justify-between items-start gap-2">
                <div>
                  <h3 className="font-semibold text-base md:text-lg">
                    Order: {o._id}
                  </h3>
                  <p className="text-xs md:text-sm text-gray-600">
                    Placed: {new Date(o.createdAt).toLocaleString()}
                  </p>
                </div>
                <div className="space-y-1 text-right">
                  <span
                    className={`inline-flex px-3 py-1 rounded-full text-xs md:text-sm ${
                      o.paymentStatus === "Paid"
                        ? "bg-green-100 text-green-800"
                        : o.paymentStatus === "Pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {o.paymentStatus || "Pending"}
                  </span>
                  {o.paymentMethod && (
                    <div className="text-[11px] text-gray-500">
                      Method: {String(o.paymentMethod).toUpperCase()}
                    </div>
                  )}
                </div>
              </div>

              {/* Customer */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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
                    <strong>Address:</strong> {o.address}, {o.city},{" "}
                    {o.state}
                  </p>
                  {o.note && (
                    <p>
                      <strong>Note:</strong> {o.note}
                    </p>
                  )}
                </div>
              </div>

              {/* Items */}
              <div className="mt-2">
                <p className="font-medium text-sm md:text-base">Items</p>
                <ul className="list-disc pl-4 md:pl-6 mt-1 space-y-1">
                  {(o.items || []).map((it, idx) => {
                    const colorText =
                      it.variantColor ||
                      it.variant ||
                      (it.key?.split("_")[1] || "");
                    const fullName = `${(it.engravingFirstName || "").trim()} ${(it.engravingLastName || "").trim()}`.trim();

                    return (
                      <li
                        key={idx}
                        className="text-sm flex flex-wrap items-center gap-2"
                      >
                        <span>
                          {it.name} × {it.quantity} = {currency} {it.total}
                        </span>

                        {colorText && (
                          <span className="ml-1 inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded-full bg-gray-100">
                            <span
                              className="inline-block w-3 h-3 rounded-full border"
                              style={{ background: colorText }}
                            />
                            <span>Color: {colorText}</span>
                          </span>
                        )}

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

              {/* Totals */}
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
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
                </div>
              </div>

              {/* Stripe info (optional) */}
              {o.paymentInstructions?.stripe?.sessionId && (
                <div className="mt-2 text-[11px] text-gray-500">
                  <strong>Stripe Session:</strong>{" "}
                  {o.paymentInstructions.stripe.sessionId}
                </div>
              )}

              {/* Admin actions – Stripe only: confirm / reject */}
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  onClick={() => handleAction(o._id, "confirm")}
                  className="px-3 py-2 bg-green-600 text-white rounded text-sm disabled:opacity-60"
                  disabled={loadingActionId === o._id}
                >
                  {loadingActionId === o._id
                    ? "Processing..."
                    : "Mark as Paid"}
                </button>

                <button
                  onClick={() => handleAction(o._id, "reject")}
                  className="px-3 py-2 bg-red-600 text-white rounded text-sm disabled:opacity-60"
                  disabled={loadingActionId === o._id}
                >
                  {loadingActionId === o._id
                    ? "Processing..."
                    : "Mark as Rejected"}
                </button>
              </div>

              {/* History */}
              {o.actionsHistory && o.actionsHistory.length > 0 && (
                <div className="mt-3 text-xs text-gray-600">
                  <strong>History:</strong>
                  <ul className="mt-1 space-y-1">
                    {o.actionsHistory.map((h, i) => (
                      <li key={i}>
                        {new Date(h.at).toLocaleString()} —{" "}
                        {h.adminName || h.adminId || "admin"} — {h.action}
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
