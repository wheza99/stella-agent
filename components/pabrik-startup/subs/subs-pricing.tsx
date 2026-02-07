"use client";

import { useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import { Item } from "../../ui/item";

const PRICING_PLAN = [
  {
    name: "Free Plan",
    monthly: {
      price: "Rp 0",
      period: "per month, no credit card required",
      desc: "Ideal for individuals getting started with our service. No credit card required.",
      url: "/",
    },
    yearly: {
      price: "Rp 0",
      period: "per year, no credit card required",
      desc: "Ideal for individuals getting started with our service. No credit card required.",
      url: "/",
    },
    buttonText: "Start for Free",
    highlighted: false,
    features: [
      "30 Credits Monthly",
      "Limited Access Features",
      "Basic Support",
    ],
  },
  {
    name: "Pro Plan",
    monthly: {
      price: "Rp 100 ribu",
      period: "for 30 days",
      desc: "Perfect for small businesses looking to grow. Start with 500 credits for a month.",
      url: `/payment/checkout?planName=Pro%20Plan%20Monthly&planPrice=100000`,
    },
    yearly: {
      price: "Rp 900 ribu",
      period: "for 365 days",
      desc: "Perfect for small businesses looking to grow. Save 25% compared to monthly billing.",
      url: `/payment/checkout?planName=Pro%20Plan%20Yearly&planPrice=900000`,
    },
    buttonText: "Get Started",
    highlighted: true,
    features: [
      "1000 Credits Monthly",
      "Unlock All Features",
      "High Priority Support",
    ],
  },
];

export default function SubsPricingCard() {
  const [cycle, setCycle] = useState("monthly");
  const isMonthly = cycle === "monthly";

  return (
    <Card className="rounded-none flex flex-col w-full h-full items-center justify-center gap-8 pb-48">
      <CardHeader className="w-full">
        <CardTitle className="text-center text-6xl font-bold tracking-tighter text-foreground">
          Pricing Plans
        </CardTitle>
      </CardHeader>

      <CardContent>
        <ToggleGroup
          type="single"
          value={cycle}
          onValueChange={(value) => {
            if (value && value !== cycle) {
              setCycle(value);
            }
          }}
          className="rounded-lg bg-muted p-1 mx-auto"
        >
          <ToggleGroupItem
            value="monthly"
            className="h-8 w-32 rounded-md data-[state=on]:bg-background"
          >
            Monthly
          </ToggleGroupItem>
          <ToggleGroupItem
            value="yearly"
            className="h-8 w-32 rounded-md data-[state=on]:bg-background"
          >
            Yearly
          </ToggleGroupItem>
        </ToggleGroup>
      </CardContent>

      <CardFooter className="grid grid-cols-1 md:grid-cols-2 justify-center items-start gap-4 px-4 w-full">
        {PRICING_PLAN.map((pricing, index) => (
          <Card
            className={`w-full h-full border ${pricing.highlighted
              ? "border-2 border-primary"
              : "border-border"
              }`}
            key={index}
          >
            <CardHeader>
              <CardTitle className="text-lg font-medium">
                {pricing.name}
              </CardTitle>
              <CardDescription className="text-5xl font-semibold ">
                {isMonthly ? pricing.monthly.price : pricing.yearly.price}
              </CardDescription>
              <CardDescription className="text-xs">
                {isMonthly ? pricing.monthly.period : pricing.yearly.period}
              </CardDescription>
            </CardHeader>

            <CardContent className="px-7 pt-6">
              <CardDescription className="text-sm text-muted-foreground">
                {isMonthly ? pricing.monthly.desc : pricing.yearly.desc}
              </CardDescription>

              <Link
                href={isMonthly ? pricing.monthly.url : pricing.yearly.url}
                className="mt-6 w-full"
              >
                <Button className="mt-6 w-full">{pricing.buttonText}</Button>
              </Link>

              <span className="relative mt-12 mb-4 flex items-center justify-center overflow-hidden">
                <Separator />
                <span className="px-3 text-xs text-muted-foreground opacity-50">
                  FEATURES
                </span>
                <Separator />
              </span>

              {pricing.features.map((feature, index) => (
                <Item
                  key={index}
                  className="px-0 py-2 flex items-center gap-3 text-muted-foreground text-sm"
                >
                  <CheckCircle className="size-5 " />
                  {feature}
                </Item>
              ))}
            </CardContent>
          </Card>
        ))}
      </CardFooter>
    </Card>
  );
}
