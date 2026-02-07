"use client"

import SubsStatusCard from '@/components/pabrik-startup/subs/subs-status';
import { useSearchParams } from 'next/navigation';

function PaymentStatusPage() {
  const searchParams = useSearchParams();
  const tripayRef = searchParams.get("tripay_reference");
  const merchantRef = searchParams.get("tripay_merchant_ref");

  return (
    <SubsStatusCard tripayRef={tripayRef} merchantRef={merchantRef} />
  )
}

export default PaymentStatusPage
