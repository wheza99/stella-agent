"use client"

import SubsStatusCard from '@/components/pabrik-startup/subs/subs-status';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import { Skeleton } from '@/components/ui/skeleton';

function PaymentStatusContent() {
  const searchParams = useSearchParams();
  const tripayRef = searchParams.get("tripay_reference");
  const merchantRef = searchParams.get("tripay_merchant_ref");

  return (
    <SubsStatusCard tripayRef={tripayRef} merchantRef={merchantRef} />
  )
}

function PaymentStatusPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col w-full h-full items-center justify-center gap-8">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-64 w-full max-w-lg" />
      </div>
    }>
      <PaymentStatusContent />
    </Suspense>
  )
}

export default PaymentStatusPage
