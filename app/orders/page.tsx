"use client";
import * as React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import AdminLayout from "../adminLayout/adminLayout";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { useEffect } from "react";
import { fetchOrders } from "@/store/orderSlice";
import Link from "next/link";

// Enums
export enum OrderStatus {
  Preparation = "preparation",
  Ontheway = "ontheway",
  Delivered = "delivered",
  Pending = "pending",
  Cancelled = "cancelled",
}

export enum PaymentMethod {
  Khalti = "khalti",
  Esewa = "esewa",
  COD = "cod",
}

export enum PaymentStatus {
  Paid = "paid",
  Unpaid = "unpaid",
}

// Interfaces



export default function Orders() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((store) => store.orders);

  useEffect(() => {
    dispatch(fetchOrders());
  }, [dispatch]);

  const statusBadgeMap: Record<OrderStatus, React.JSX.Element> = {
    [OrderStatus.Preparation]: <Badge className="bg-blue-500">Preparation</Badge>,
    [OrderStatus.Ontheway]: <Badge className="bg-yellow-500">On the way</Badge>,
    [OrderStatus.Delivered]: <Badge className="bg-green-500">Delivered</Badge>,
    [OrderStatus.Cancelled]: <Badge variant="destructive">Cancelled</Badge>,
    [OrderStatus.Pending]: <Badge variant="outline">Pending</Badge>,
  };

  const paymentMethodMap: Record<PaymentMethod, string> = {
    [PaymentMethod.Khalti]: "Khalti",
    [PaymentMethod.Esewa]: "Esewa",
    [PaymentMethod.COD]: "COD",
  };

  const paymentStatusMap: Record<PaymentStatus, React.JSX.Element> = {
    [PaymentStatus.Paid]: <Badge className="bg-green-500">Paid</Badge>,
    [PaymentStatus.Unpaid]: <Badge variant="destructive">Unpaid</Badge>,
  };

  const getStatusBadge = (status: string) => {
    return statusBadgeMap[status as OrderStatus] ?? <Badge variant="outline">Pending</Badge>;
  };

  const getPaymentStatus = (status: string) => {
    return paymentStatusMap[status as PaymentStatus] ?? (
      <Badge variant="destructive">Unpaid</Badge>
    );
  };

  if (status === "loading") {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Loading orders...</p>
        </div>
      </AdminLayout>
    );
  }

  if (status === "error") {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <p>Error loading orders</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <Card>
        <CardHeader className="px-7">
          <CardTitle>Orders</CardTitle>
          <CardDescription>Recent orders from your store.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Items</TableHead>
                <TableHead>Payment Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Payment Status</TableHead>
                <TableHead className="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...items]
                .sort(
                  (a, b) =>
                    new Date(b?.createdAt).getTime() -
                    new Date(a?.createdAt).getTime()
                )
                .map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">
                      <Link href={`/orders/${order.id}`}>{order.id}</Link>
                    </TableCell>
                    <TableCell>{order?.OrderDetails[0].quantity || 0} items</TableCell>
                    <TableCell>
                      {paymentMethodMap[order.Payment?.paymentMethod] || "Unknown"}
                    </TableCell>
                    <TableCell>{getStatusBadge(order?.orderStatus)}</TableCell>
                    <TableCell>{getPaymentStatus(order?.Payment?.paymentStatus)}</TableCell>
                    <TableCell className="text-right">
                      ${order?.totalPrice.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </AdminLayout>
  );
}
