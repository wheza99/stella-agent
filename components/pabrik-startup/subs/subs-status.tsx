"use client"

import { Button } from '@/components/ui/button';
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from '@/components/ui/empty';
import { Spinner } from '@/components/ui/spinner';
import axios from 'axios';
import { CheckCircleIcon, Hourglass } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react'

function SubsStatusCard({ tripayRef, merchantRef }: { tripayRef: string | null, merchantRef: string | null }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentStatus, setPaymentStatus] = useState(null);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      try {
        const response = await axios.get('/api/payment/status', {
          params: {
            tripay_ref: tripayRef,
            merchant_ref: merchantRef,
          }
        });
        if (response.data.status === "success") {
          setPaymentStatus(response.data.payment.status);
        }
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          setError(
            err.response?.data?.message || err.message || "Failed to check payment status",
          );
        } else {
          setError("An unexpected error occurred");
        }
      } finally {
        setLoading(false);
      }
    };

    checkPaymentStatus();
  }, [tripayRef, merchantRef]);

  if (loading) {
    return <Empty>
      <EmptyHeader>
        <EmptyTitle>Processing Payment...</EmptyTitle>
        <Spinner />
      </EmptyHeader>
    </Empty>;
  }

  if (error) {
    return <Empty>
      <EmptyHeader>
        <EmptyTitle>Payment Failed</EmptyTitle>
        <EmptyDescription>{error}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  }

  if (paymentStatus === "paid") {
    return <Empty>
      <EmptyHeader>
        <EmptyMedia><CheckCircleIcon className="h-12 w-12 text-green-500" /></EmptyMedia>
        <EmptyTitle>Payment Success</EmptyTitle>
        <EmptyDescription>Your payment has been processed successfully.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => router.push("/payment/plan")}>Go to Plan</Button>
      </EmptyContent>
    </Empty>
  }

  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia><Hourglass className="h-12 w-12 text-red-500" /></EmptyMedia>
        <EmptyTitle>Waiting for Payment</EmptyTitle>
        <EmptyDescription>Please complete your payment.</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Button onClick={() => router.push(`https://tripay.co.id/checkout/${tripayRef}`)}>Complete Payment</Button>
      </EmptyContent>
    </Empty>
  )
}

export default SubsStatusCard
