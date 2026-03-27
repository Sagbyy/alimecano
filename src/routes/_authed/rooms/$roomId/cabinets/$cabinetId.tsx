import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/rooms/$roomId/cabinets/$cabinetId')({
  component: RouteComponent,
})

function RouteComponent() {
  const { roomId, cabinetId } = Route.useParams()
  return <div>Armoire {cabinetId} (salle {roomId})</div>
}
