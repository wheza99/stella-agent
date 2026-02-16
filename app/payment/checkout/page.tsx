import SubsCheckoutCard from '@/components/pabrik-startup/subs/subs-checkout'
import { Suspense } from 'react'
import { Skeleton } from '@/components/ui/skeleton'

function CheckoutPage() {
  return (
    <Suspense fallback={
      <div className="flex flex-col w-full h-full items-center justify-center gap-8">
        <Skeleton className="h-16 w-64" />
        <Skeleton className="h-96 w-full max-w-lg" />
      </div>
    }>
      <SubsCheckoutCard />
    </Suspense>
  )
}

export default CheckoutPage
