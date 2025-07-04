"use client";

import AdminLayout from "@/app/adminLayout/adminLayout";
import { socket } from "@/app/app";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { fetchAdminOrderDetails } from "@/store/orderSlice";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

// Simple function to delay fetching (like pressing a button slowly)
function delayFetch(func, wait) {
  let timer;
  return (...args) => {
    clearTimeout(timer); // Cancel any previous timer
    timer = setTimeout(() => func(...args), wait); // Wait before running
  };
}

function AdminOrderDetail() {
  const dispatch = useAppDispatch(); // For sending actions to Redux
  const { id } = useParams(); // Get order ID from the URL
  const { orderDetails } = useAppSelector((store) => store.orders); // Get order data from Redux
  const [orderStatus, setOrderStatus] = useState(""); // Local state for order status
  const [paymentStatus, setPaymentStatus] = useState(""); // Local state for payment status
  const [isMyUpdate, setIsMyUpdate] = useState(false); // Track if I made the update
  const CLOUDINARY_VERSION = "v1750340657"; // For image URLs

  // Slow down fetching to once every second
  const slowFetchOrder = delayFetch((orderId) => {
    console.log("Fetching order details for ID:", orderId);
    dispatch(fetchAdminOrderDetails(orderId));
  }, 1000);

  // Update dropdowns when order data changes
  useEffect(() => {
    if (orderDetails[0]?.Order) {
      const newOrderStatus = orderDetails[0].Order.orderStatus || "pending";
      const newPaymentStatus = orderDetails[0].Order.Payment?.paymentStatus || "unpaid";
      // Only update if different to avoid extra re-renders
      if (newOrderStatus !== orderStatus) setOrderStatus(newOrderStatus);
      if (newPaymentStatus !== paymentStatus) setPaymentStatus(newPaymentStatus);
    }
  }, [orderDetails, orderStatus, paymentStatus]);

  // Fetch order details when the page loads
  useEffect(() => {
    if (id) {
      console.log("Loading order details for ID:", id);
      dispatch(fetchAdminOrderDetails(id));
    }
  }, [id, dispatch]);

  // Listen for server updates
  useEffect(() => {
    // When the server says the order status changed
    socket.on("orderStatusUpdated", (data) => {
      console.log("Server sent order status update:", data);
      // Only fetch if it’s for this order and not my own update
      if (data.orderId === id && !isMyUpdate) {
        slowFetchOrder(id);
      }
    });

    // When the server says the payment status changed
    socket.on("paymentStatusUpdated", (data) => {
      console.log("Server sent payment status update:", data);
      // Only fetch if it’s for this order and not my own update
      if (data.orderId === id && !isMyUpdate) {
        slowFetchOrder(id);
      }
    });

    // Clean up listeners when the page closes
    return () => {
      socket.off("orderStatusUpdated");
      socket.off("paymentStatusUpdated");
    };
  }, [id, dispatch, isMyUpdate]);

  // When I change the order status dropdown
  const handleOrderStatusChange = (event) => {
    const newStatus = event.target.value;
    setOrderStatus(newStatus); // Update dropdown immediately
    setIsMyUpdate(true); // Mark as my update
    if (id && orderDetails.length > 0) {
      console.log("Sending new order status to server:", {
        status: newStatus,
        orderId: id,
      });
      socket.emit("updateOrderStatus", {
        status: newStatus,
        orderId: id,
        userId: orderDetails[0].Order.userId,
      });
      // Allow server updates again after 1 second
      setTimeout(() => setIsMyUpdate(false), 1000);
    }
  };

  // When I change the payment status dropdown
  const handlePaymentStatusChange = (event) => {
    const newStatus = event.target.value;
    setPaymentStatus(newStatus); // Update dropdown immediately
    setIsMyUpdate(true); // Mark as my update
    if (id && orderDetails.length > 0) {
      console.log("Sending new payment status to server:", {
        paymentStatus: newStatus,
        orderId: id,
      });
      socket.emit("updatePaymentStatus", {
        paymentStatus: newStatus,
        paymentId: orderDetails[0]?.Order?.Payment?.id,
        orderId: id,
        userId: orderDetails[0]?.Order?.userId,
      });
      // Allow server updates again after 1 second
      setTimeout(() => setIsMyUpdate(false), 1000);
    }
  };

  // Show loading screen if no order data yet
  if (!orderDetails[0]?.Order) {
    return <AdminLayout>Loading...</AdminLayout>;
  }

  return (
    <AdminLayout>
      <div className="py-10 px-4 md:px-6 2xl:px-20 2xl:container 2xl:mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-semibold text-gray-800 dark:text-white">
            Order #{orderDetails[0]?.orderId}
          </h1>
          <p className="text-sm md:text-base text-gray-600 dark:text-gray-300">
            {new Date(orderDetails[0]?.createdAt).toLocaleDateString()}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Order Status: <span className="font-medium">{orderStatus}</span>
          </p>
        </div>

        <div className="mt-8 flex flex-col gap-6 xl:flex-row xl:items-start">
          <div className="w-full space-y-6">
            <div className="bg-gray-50 dark:bg-gray-800 rounded-md shadow-md p-4 md:p-6 xl:p-8">
              <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-white mb-4">
                Customer’s Cart
              </h2>
              {orderDetails.map((od) => {
                const imageUrl = od.Product.image[0]
                  ? `https://res.cloudinary.com/dxpe7jikz/image/upload/${CLOUDINARY_VERSION}${od.Product.image[0].replace(
                      "/uploads",
                      ""
                    )}`
                  : "https://via.placeholder.com/300x300?text=No+Image";
                return (
                  <div
                    key={od.id}
                    className="flex flex-col sm:flex-row gap-4 border-b pb-4 mb-4"
                  >
                    <div className="w-full sm:w-32 h-32 flex-shrink-0">
                      <img
                        src={imageUrl}
                        alt={od?.Product?.name || "Product Image"}
                        className="w-full h-full object-cover rounded-md border shadow-sm"
                      />
                    </div>
                    <div className="flex flex-col justify-between flex-grow space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                          {od?.Product?.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          Category: {od?.Product?.Category?.categoryName}
                        </p>
                      </div>
                      <div className="flex justify-between text-sm font-medium text-gray-800 dark:text-white">
                        <p>Price: Rs.{od.Product.price}</p>
                        <p>Qty: {od.quantity}</p>
                        <p>Total: Rs.{od.quantity * od.Product.price}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex flex-col md:flex-row gap-6">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md shadow-md p-4 md:p-6 xl:p-8 w-full">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Summary
                </h3>
                <div className="flex justify-between text-sm font-medium text-gray-800 dark:text-white">
                  <p>Total</p>
                  <p>Rs. {orderDetails[0]?.Order?.totalPrice}</p>
                </div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-md shadow-md p-4 md:p-6 xl:p-8 w-full">
                <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
                  Shipping
                </h3>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <img
                      src="https://i.ibb.co/L8KSdNQ/image-3.png"
                      alt="logo"
                      className="w-8 h-8"
                    />
                    <p className="text-sm text-gray-800 dark:text-white">
                      DPD Delivery <br />
                      <span className="text-xs font-normal">
                        Delivery within 24 Hours
                      </span>
                    </p>
                  </div>
                  <p className="text-sm font-medium text-gray-800 dark:text-white">
                    Rs. 100.00
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="w-full xl:w-96 bg-gray-50 dark:bg-gray-800 rounded-md shadow-md p-4 md:p-6 xl:p-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
              Customer
            </h3>
            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-2 mb-6">
              <p>
                Full Name: {orderDetails[0]?.Order?.firstName}{" "}
                {orderDetails[0]?.Order?.lastName}
              </p>
              <p>Phone No: {orderDetails[0]?.Order?.phoneNumber}</p>
              <p>
                Shipping Address: {orderDetails[0]?.Order?.addressLine},{" "}
                {orderDetails[0]?.Order?.city}, {orderDetails[0]?.Order?.state}
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                  Change Payment Status
                </label>
                <select
                  className="w-full border rounded-md px-2 py-1 dark:bg-gray-700 dark:text-white"
                  value={paymentStatus}
                  onChange={handlePaymentStatusChange}
                >
                  <option value="paid">Paid</option>
                  <option value="unpaid">Unpaid</option>
                </select>
              </div>
              {orderStatus !== "cancelled" && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-white mb-1">
                    Change Order Status
                  </label>
                  <select
                    onChange={handleOrderStatusChange}
                    className="w-full border rounded-md px-2 py-1 dark:bg-gray-700 dark:text-white"
                    value={orderStatus}
                  >
                    <option value="pending">Pending</option>
                    <option value="delivered">Delivered</option>
                    <option value="ontheway">On The Way</option>
                    <option value="preparation">Preparation</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

export default AdminOrderDetail;