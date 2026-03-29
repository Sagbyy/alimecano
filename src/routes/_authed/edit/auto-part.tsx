import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_authed/edit/auto-part')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_authed/edit/auto-part"!</div>
}
