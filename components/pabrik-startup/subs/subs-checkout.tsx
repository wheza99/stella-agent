"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import axios from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Item, ItemDescription, ItemTitle } from "@/components/ui/item";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "../../ui/separator";
import Image from "next/image";
import { useUser } from "@/context/user-context";

const PAYMENT_METHODS = [
  {
    id: "BCAVA",
    name: "BCA Virtual Account",
    image:
      "https://assets.tripay.co.id/upload/payment-icon/ytBKvaleGy1605201833.png",
    fee_flat: 5500,
    fee_percent: 0,
  },
  {
    id: "QRIS",
    name: "QRIS by ShopeePay",
    image:
      "https://assets.tripay.co.id/upload/payment-icon/BpE4BPVyIw1605597490.png",
    fee_flat: 750,
    fee_percent: 0.007,
  },
];

export default function SubsCheckoutCard() {
  const { user, activeOrg } = useUser();
  const router = useRouter();
  const [method, setMethod] = useState("BCAVA");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Get plan details from query parameters
  const searchParams = useSearchParams();
  const planName = searchParams.get("planName") || "Pro Plan Monthly";
  const planPriceParam = searchParams.get("planPrice");
  const planPrice = planPriceParam ? parseInt(planPriceParam) : 100000;

  // Calculate fee for display purposes only
  const selectedMethod = PAYMENT_METHODS.find((m) => m.id === method);
  const fee =
    (selectedMethod?.fee_flat || 0) +
    (selectedMethod?.fee_percent || 0) * planPrice;
  const displayTotal = planPrice + fee;

  // Handle purchase submission
  const handlePurchase = async () => {
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (!activeOrg) {
      setError("Please select an organization");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post("/api/payment/checkout", {
        plan_name: planName,
        plan_price: planPrice,
        method,
        org_id: activeOrg?.id,
      });
      if (response.data.status === "success" && response.data.payment.url) {
        router.push(response.data.payment.url);
      }
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        setError(
          err.response?.data?.message || err.message || "Failed to login",
        );
      } else {
        setError("An unexpected error occurred");
      }
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <Card className="rounded-none flex flex-col w-full h-full items-center justify-center gap-8 pb-48">
      <CardHeader className="w-full">
        <CardTitle className="text-center text-6xl font-bold tracking-tighter text-foreground">
          Checkout
        </CardTitle>
      </CardHeader>

      <CardContent className="w-full">
        <Card className="w-full max-w-lg mx-auto">
          <CardHeader>
            <CardTitle>Selected Plan</CardTitle>
            <Item variant="outline" className="w-full justify-between">
              <ItemTitle>{planName}</ItemTitle>
              <ItemDescription className="text-lg font-bold text-primary">
                {formatCurrency(planPrice)}
              </ItemDescription>
            </Item>
          </CardHeader>

          <CardContent className="space-y-6">
            <CardTitle>Payment Method</CardTitle>

            <RadioGroup
              defaultValue={method}
              className="w-full"
              onValueChange={(value) => {
                const selected = PAYMENT_METHODS.find((m) => m.id === value);
                if (selected) {
                  setMethod(selected.id);
                }
              }}
              value={method}
            >
              {PAYMENT_METHODS.map((method) => (
                <FieldLabel key={method.id} htmlFor={method.id}>
                  <Field orientation="horizontal">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <FieldContent>
                      <FieldTitle>{method.name}</FieldTitle>
                    </FieldContent>
                    <Image
                      src={method.image}
                      alt={method.name}
                      width={24}
                      height={24}
                    />
                  </Field>
                </FieldLabel>
              ))}
            </RadioGroup>

            <Card className="bg-muted/30 my-8">
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Item className="w-full justify-between px-0 py-0">
                  <ItemTitle>{planName}</ItemTitle>
                  <ItemDescription>{formatCurrency(planPrice)}</ItemDescription>
                </Item>
                <Item className="w-full justify-between px-0 py-0">
                  <ItemTitle>Transaction Fee (Est.)</ItemTitle>
                  <ItemDescription>{formatCurrency(fee)}</ItemDescription>
                </Item>
                <Separator />
                <Item className="w-full justify-between px-0 py-0">
                  <ItemTitle className="text-lg font-semibold">Total</ItemTitle>
                  <ItemDescription className="text-lg font-bold text-primary">
                    {formatCurrency(displayTotal)}
                  </ItemDescription>
                </Item>
              </CardContent>
            </Card>
          </CardContent>

          <CardFooter className="flex flex-col">
            <Button
              className="w-full"
              onClick={handlePurchase}
              disabled={loading}
            >
              {loading ? "Processing..." : "Purchase"}
            </Button>
            {error && <p className="text-red-500 text-sm">{error}</p>}
          </CardFooter>
        </Card>
      </CardContent>
    </Card>
  );
}
