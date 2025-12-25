"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/hooks/use-cart";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, isLoaded, subtotal, tax, total } = useCart();

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    zipCode: "",
    province: "",
    district: "",
    municipality: "",
    ward: "",
  });

  const [locations, setLocations] = useState<any>({});
  const [districts, setDistricts] = useState<string[]>([]);
  const [municipalities, setMunicipalities] = useState<string[]>([]);
  const [wards, setWards] = useState<string[]>([]);

  useEffect(() => {
    fetch(
      "https://raw.githubusercontent.com/rukh-debug/location-np/main/english.json"
    )
      .then((res) => res.json())
      .then((data) => setLocations(data))
      .catch((err) => console.error(err));
  }, []);

  const [sameAsBilling, setSameAsBilling] = useState(true);
  const [billingData, setBillingData] = useState(formData);

  if (!isLoaded) {
    return (
      <main className="min-h-screen font-poppins">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </main>
    );
  }

  if (cart.length === 0) {
    return (
      <main className="min-h-screen font-poppins">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <div className="flex h-96 items-center justify-center rounded-lg border border-border bg-card">
            <div className="text-center">
              <p className="text-lg font-medium text-foreground">
                Your cart is empty
              </p>
              <Link href="/products">
                <Button className="mt-4">Continue Shopping</Button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    );
  }

  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const province = e.target.value;
    setFormData({
      ...formData,
      province,
      district: "",
      municipality: "",
      ward: "",
    });
    setDistricts(Object.keys(locations[province] || {}));
    setMunicipalities([]);
    setWards([]);
  };

  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const district = e.target.value;
    setFormData({ ...formData, district, municipality: "", ward: "" });
    setMunicipalities(
      Object.keys(locations[formData.province][district] || {})
    );
    setWards([]);
  };

  const handleMunicipalityChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const municipality = e.target.value;
    setFormData({ ...formData, municipality, ward: "" });
    setWards(
      locations[formData.province][formData.district][municipality] || []
    );
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData({ ...formData, ward: e.target.value });
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (sameAsBilling) {
      setBillingData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBillingChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setBillingData((prev) => ({ ...prev, [name]: value }));
  };

  const handleContinue = () => {
    // Validate form
    if (
      !formData.fullName ||
      !formData.phone ||
      !formData.province ||
      !formData.municipality ||
      !formData.district ||
      !formData.ward
    ) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Store checkout data in sessionStorage for next step
    sessionStorage.setItem(
      "checkoutData",
      JSON.stringify({
        shippingAddress: formData,
        billingAddress: sameAsBilling ? formData : billingData,
      })
    );

    router.push("/payment");
  };

  return (
    <main className="min-h-screen font-poppins">
      <ToastContainer />
      <div className="mx-auto max-w-7xl px-4 py-30 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Checkout</h1>
          <div className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
            <span>Cart</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Shipping</span>
            <ChevronRight className="h-4 w-4" />
            <span>Payment</span>
            <ChevronRight className="h-4 w-4" />
            <span>Confirmation</span>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Address */}
            <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Shipping Address
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="fullName">Full Name *</Label>
                  <Input
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    placeholder="John Doe"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="+977 9800000000"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="province">Province *</Label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleProvinceChange}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select Province</option>
                    {Object.keys(locations).map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="district">District *</Label>
                  <select
                    name="district"
                    value={formData.district}
                    onChange={handleDistrictChange}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!formData.province}
                  >
                    <option value="">Select District</option>
                    {districts.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="municipality">Municipality *</Label>
                  <select
                    name="municipality"
                    value={formData.municipality}
                    onChange={handleMunicipalityChange}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!formData.district}
                  >
                    <option value="">Select Municipality</option>
                    {municipalities.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="ward">Ward *</Label>
                  <select
                    name="ward"
                    value={formData.ward}
                    onChange={handleWardChange}
                    className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    disabled={!formData.municipality}
                  >
                    <option value="">Select Ward</option>
                    {wards.map((w) => (
                      <option key={w} value={w}>
                        {w}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <Label htmlFor="zipCode">ZIP/Postal Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleInputChange}
                    placeholder="10001"
                    className="mt-2"
                  />
                </div>
              </div>
            </Card>

            {/* Billing Address */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-3">
                <input
                  type="checkbox"
                  id="sameAsBilling"
                  checked={sameAsBilling}
                  onChange={(e) => setSameAsBilling(e.target.checked)}
                  className="h-4 w-4 rounded border-input"
                />
                <Label
                  htmlFor="sameAsBilling"
                  className="font-medium cursor-pointer"
                >
                  Billing address same as shipping
                </Label>
              </div>

              {!sameAsBilling && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <Label htmlFor="billingFullName">Full Name *</Label>
                    <Input
                      id="billingFullName"
                      name="fullName"
                      value={billingData.fullName}
                      onChange={handleBillingChange}
                      placeholder="John Doe"
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label htmlFor="billingEmail">Email *</Label>
                    <Input
                      id="billingEmail"
                      name="email"
                      type="email"
                      value={billingData.email}
                      onChange={handleBillingChange}
                      placeholder="john@example.com"
                      className="mt-2"
                    />
                  </div>

                  <div>
                    <Label htmlFor="billingProvince">Province *</Label>
                    <select
                      id="billingProvince"
                      name="province"
                      value={billingData.province}
                      onChange={handleBillingChange}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Province</option>
                      <option>Province 1</option>
                      <option>Bagmati</option>
                      <option>Madhesh</option>
                      <option>Gandaki</option>
                      <option>Karnali</option>
                      <option>Lumbini</option>
                      <option>Sudur Paschim</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="billingDistrict">District *</Label>
                    <select
                      id="billingDistrict"
                      name="district"
                      value={billingData.district}
                      onChange={handleBillingChange}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select District</option>
                      <option>Kathmandu</option>
                      <option>Lalitpur</option>
                      <option>Bhaktapur</option>
                      <option>Chitwan</option>
                      <option>Pokhara</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="billingMunicipality">Municipality *</Label>
                    <select
                      id="billingMunicipality"
                      name="municipality"
                      value={billingData.municipality}
                      onChange={handleBillingChange}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Municipality</option>
                      <option>Rural Municipality</option>
                      <option>Municipality</option>
                      <option>Sub-Metropolitan City</option>
                      <option>Metropolitan City</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="billingWard">Ward *</Label>
                    <select
                      id="billingWard"
                      name="ward"
                      value={billingData.ward}
                      onChange={handleBillingChange}
                      className="mt-2 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select Ward</option>
                      <option>1</option>
                      <option>2</option>
                      <option>3</option>
                      <option>4</option>
                      <option>5</option>
                    </select>
                  </div>

                  <div>
                    <Label htmlFor="billingZipCode">ZIP/Postal Code *</Label>
                    <Input
                      id="billingZipCode"
                      name="zipCode"
                      value={billingData.zipCode}
                      onChange={handleBillingChange}
                      placeholder="10001"
                      className="mt-2"
                    />
                  </div>
                </div>
              )}
            </Card>

            {/* Shipping Method */}
            {/* <Card className="p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Shipping Method
              </h2>

              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-card/50">
                  <input
                    type="radio"
                    name="shipping"
                    value="standard"
                    defaultChecked
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Standard Shipping
                    </p>
                    <p className="text-sm text-muted-foreground">
                      5-7 business days
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">Free</span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-card/50">
                  <input
                    type="radio"
                    name="shipping"
                    value="express"
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Express Shipping
                    </p>
                    <p className="text-sm text-muted-foreground">
                      2-3 business days
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    Rs. 15.00
                  </span>
                </label>

                <label className="flex items-center gap-3 rounded-lg border border-border p-4 cursor-pointer hover:bg-card/50">
                  <input
                    type="radio"
                    name="shipping"
                    value="overnight"
                    className="h-4 w-4"
                  />
                  <div className="flex-1">
                    <p className="font-medium text-foreground">
                      Overnight Shipping
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Next business day
                    </p>
                  </div>
                  <span className="font-semibold text-foreground">
                    Rs. 35.00
                  </span>
                </label>
              </div>
            </Card> */}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4 p-6">
              <h2 className="mb-4 text-xl font-bold text-foreground">
                Order Summary
              </h2>

              <div className="mb-4 max-h-64 space-y-3 overflow-y-auto border-b border-border pb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-xs text-muted-foreground">
                        Qty: {item.quantity}
                      </p>
                    </div>
                    <p className="font-medium text-foreground">
                      Rs. {(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="space-y-3 border-b border-border pb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-medium text-foreground">
                    Rs. {subtotal.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tax (13%)</span>
                  <span className="font-medium text-foreground">
                    Rs. {tax.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-medium text-foreground">Free</span>
                </div>
              </div>

              <div className="mt-4 flex justify-between">
                <span className="font-bold text-foreground">Total</span>
                <span className="text-2xl font-bold text-primary">
                  Rs. {total.toFixed(2)}
                </span>
              </div>

              <Button
                className="mt-6 w-full bg-secondary cursor-pointer"
                size="lg"
                onClick={handleContinue}
              >
                Continue to Payment
              </Button>

              <Link href="/cart">
                <Button
                  variant="outline"
                  className="mt-3 w-full bg-primary hover:bg-secondary hover:text-white cursor-pointer"
                >
                  Back to Cart
                </Button>
              </Link>
            </Card>
          </div>
        </div>
      </div>
    </main>
  );
}
