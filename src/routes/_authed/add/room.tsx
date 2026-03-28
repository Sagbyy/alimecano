import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/add/room')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/add/room"!</div>
}
