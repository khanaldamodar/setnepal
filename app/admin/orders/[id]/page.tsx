"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { ArrowLeft, User, ShoppingCart, Tag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Cookies from "js-cookie";

interface OrderItem {
  id: number;
  productId: number | null;
  packageId: number | null;
  price: number;
  quantity: number;
  product?: {
    id: number;
    name: string;
  } | null;
  package?: {
    id: number;
    name: string;
  } | null;
}

interface OrderData {
  id: number;
  user: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
  items: OrderItem[];
  shippingAddress?: string;
}

export default function ViewOrderPage() {
  const { id } = useParams();
  const router = useRouter();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!id) return;
    fetchOrder();
  }, [id]);

  const fetchOrder = async () => {
    try {
      setLoading(true);

      const token = Cookies.get("token");
      if (!token) {
        toast.error("You must be logged in to view this order.");
        router.push("/login");
        return;
      }

      const res = await axios.get(`/api/orders/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setOrder(res.data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load order");
    } finally {
      setLoading(false);
    }
  };

  const saveChanges = async () => {
    if (!order) return;

    try {
      setSaving(true);
      const token = Cookies.get("token");

      await axios.put(
        `/api/orders/${order.id}`,
        {
          status: order.status,
          paymentStatus: order.paymentStatus,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      toast.success("Order updated successfully!");
      fetchOrder();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update order");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <p className="text-gray-500 p-6 text-center">Loading order details...</p>
    );

  if (!order)
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500 mb-4">Order not found</p>
        <Button onClick={() => router.back()}>Go Back</Button>
      </div>
    );

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5 mr-2" /> Back
        </Button>
        <h1 className="text-2xl font-semibold">Order #{order.id}</h1>
      </div>

      {/* Customer Info */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <User className="w-5 h-5" /> Customer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {order.user.name}
          </p>
          <p>
            <strong>Email:</strong> {order.user.email}
          </p>
        </CardContent>
      </Card>

      {/* Order Info */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <Tag className="w-5 h-5" /> Order Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Total:</strong> Rs. {order.total}
          </p>

          <div>
            <strong>Status:</strong>
            <select
              className="ml-3 border rounded px-2 py-1"
              value={order.status}
              onChange={(e) => setOrder({ ...order, status: e.target.value })}
            >
              <option value="PENDING">PENDING</option>
              <option value="PROCESSING">PROCESSING</option>
              <option value="SHIPPED">SHIPPED</option>
              <option value="DELIVERED">DELIVERED</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div>
            <strong>Payment Status:</strong>
            <select
              className="ml-3 border rounded px-2 py-1"
              value={order.paymentStatus}
              onChange={(e) =>
                setOrder({ ...order, paymentStatus: e.target.value })
              }
            >
              <option value="PENDING">PENDING</option>
              <option value="PAID">PAID</option>
              <option value="FAILED">FAILED</option>
              <option value="REFUNDED">REFUNDED</option>
            </select>
          </div>

          <p>
            <strong>Payment Method:</strong> {order.paymentMethod}
          </p>

          <p>
            <strong>Created At:</strong>{" "}
            {new Date(order.createdAt).toLocaleString()}
          </p>

          {order.shippingAddress && (
            <p>
              <strong>Shipping Address:</strong> {order.shippingAddress}
            </p>
          )}

          <Button disabled={saving} onClick={saveChanges}>
            {saving ? "Saving..." : "Save Changes"}
          </Button>
        </CardContent>
      </Card>

      {/* Products Table */}
      <Card className="shadow-sm rounded-2xl border">
        <CardHeader>
          <CardTitle className="text-xl flex items-center gap-2">
            <ShoppingCart className="w-5 h-5" /> Products in this Order
          </CardTitle>
        </CardHeader>
        <CardContent>
          {order.items.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-200 text-sm">
                <thead className="bg-gray-100">
                  <tr>
                    <th className="px-4 py-2 text-left">Order ID</th>
                    <th className="px-4 py-2 text-left">Product Name</th>
                    <th className="px-4 py-2 text-left">Price</th>
                    <th className="px-4 py-2 text-left">Quantity</th>
                    <th className="px-4 py-2 text-left">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item) => (
                    <tr key={item.id} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2">{item.id}</td>
                      <td className="px-4 py-2">
                        {item.product?.name ||
                          item.package?.name ||
                          "Unknown Item"}
                      </td>
                      <td className="px-4 py-2">Rs. {item.price}</td>
                      <td className="px-4 py-2">{item.quantity}</td>
                      <td className="px-4 py-2">
                        Rs. {item.price * item.quantity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-500 italic">No products in this order</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
