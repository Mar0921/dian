import { HostScreen } from "@/components/host/host-screen"

export default async function HostGamePage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  return <HostScreen gameId={id} />
}
