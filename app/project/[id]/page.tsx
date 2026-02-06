import ChatSection from '@/components/pabrik-startup/chat/chat-section'
import { Card } from '@/components/ui/card'

interface PageProps {
  params: Promise<{ id: string }>
}

async function ProjectDetailPage({ params }: PageProps) {
  const { id } = await params

  return (
    <Card className='flex p-0 rounded-none'>
      <ChatSection projectId={id} />
    </Card>
  )
}

export default ProjectDetailPage
