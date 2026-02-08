"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "../../ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../ui/card";
import { Separator } from "../../ui/separator";
import { Progress } from "../../ui/progress";
import { Payment } from "@/type/interface/payment";
import { Usage } from "@/type/interface/usage";
import { useUser } from "@/context/user-context";
import SubsPlanUsageCard from "./subs-plan-usage";
import SubsPlanPaymentCard from "./subs-plan-payment";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import SubsPlanPaginationCard from "./subs-plan-pagination";
import { Item, ItemContent, ItemDescription, ItemHeader, ItemTitle } from "@/components/ui/item";
import axios from "axios";

function SubsPlanCard() {
  const { activeOrg } = useUser();
  const [billingHistory, setBillingHistory] = useState<Payment[]>([]);
  const [creditHistory, setCreditHistory] = useState<Usage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const currentPage = 1;
  const totalPages = 1;
  const pageNumbers: (number | string)[] = [1];

  useEffect(() => {
    const fetchPlanData = async () => {
      if (!activeOrg?.id) return;
      try {
        const response = await axios.get(`/api/payment/plan`, {
          params: { org_id: activeOrg.id }
        });
        if (response.data.status === "success") {
          setBillingHistory(response.data.payment);
          setCreditHistory(response.data.usage);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || err.message || "Failed to fetch plan data",
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPlanData();
  }, [activeOrg?.id]);

  if (loading) {
    return <Empty>
      <EmptyHeader>
        <EmptyTitle>Loading...</EmptyTitle>
        <Spinner />
      </EmptyHeader>
    </Empty>;
  }

  return (
    <>
      {/* Title and Description */}
      <Item>
        <ItemHeader className="flex flex-col gap-2 items-start">
          <ItemTitle className="text-3xl font-bold">Plan and Billing</ItemTitle>
          <ItemDescription className="text-lg text-muted-foreground">
            {error ? error : "Manage your subscription plan and billing information."}
          </ItemDescription>
        </ItemHeader>
      </Item>

      {/* Subscription Plan */}
      <Item>
        <ItemHeader>
          <ItemTitle className="text-lg font-bold">Subscription Plan</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <Card className="w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>Current Plan</CardTitle>
              <CardDescription className="text-2xl font-bold text-primary">
                {activeOrg?.credit?.plan === "pro"
                  ? "Pro"
                  : "Free"}
              </CardDescription>
            </CardHeader>
            <Separator />
            <CardFooter className="w-full flex items-center justify-between">
              <CardTitle>Upgrade Plan</CardTitle>
              <Button>
                <Link href="/pricing">Upgrade</Link>
              </Button>
            </CardFooter>
          </Card>
        </ItemContent>
      </Item>

      {/* Credit Usage */}
      <Item>
        <ItemHeader>
          <ItemTitle className="text-lg font-bold">Credit Usage</ItemTitle>
        </ItemHeader>
        <ItemContent>
          <Card className="w-full">
            <CardHeader className="flex items-center justify-between">
              <CardTitle>
                {activeOrg?.credit?.plan === "pro"
                  ? "Pro Plan"
                  : "Free Plan"}
              </CardTitle>
              <CardDescription>Reset on next billing cycle</CardDescription>
            </CardHeader>
            <CardContent>
              <Progress
                value={
                  activeOrg?.credit
                    ? (activeOrg.credit.used / activeOrg.credit.total) * 100
                    : 0
                }
              />
            </CardContent>
            <CardFooter className="w-full flex items-center justify-between">
              <CardDescription>
                {activeOrg?.credit?.used || 0} /{" "}
                <span className="text-gray-500">
                  {activeOrg?.credit ? activeOrg.credit.total : 0} credits
                </span>
              </CardDescription>
              <CardDescription>{activeOrg?.credit?.remain || 0} Left</CardDescription>
            </CardFooter>
          </Card>
        </ItemContent>
      </Item>

      {/* Credit History */}
      <Item>
        <ItemHeader>
          <ItemTitle className="text-lg font-bold">Credit History</ItemTitle>
        </ItemHeader>
        <ItemContent className="w-full">
          <Card className="w-full">
            <SubsPlanUsageCard usageHistory={creditHistory} />
            <SubsPlanPaginationCard
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
            />
          </Card>
        </ItemContent>
      </Item>

      {/* Billing History */}
      <Item>
        <ItemHeader>
          <ItemTitle className="text-lg font-bold">Billing History</ItemTitle>
        </ItemHeader>
        <ItemContent className="w-full">
          <Card className="w-full">
            <SubsPlanPaymentCard billingHistory={billingHistory} />
            <SubsPlanPaginationCard
              currentPage={currentPage}
              totalPages={totalPages}
              pageNumbers={pageNumbers}
            />
          </Card>
        </ItemContent>
      </Item>
    </>
  );
}

export default SubsPlanCard;
