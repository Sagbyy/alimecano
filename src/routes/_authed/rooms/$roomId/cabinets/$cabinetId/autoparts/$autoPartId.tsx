import { getAutoPartById } from "#/server/auto-parts";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute(
  "/_authed/rooms/$roomId/cabinets/$cabinetId/autoparts/$autoPartId",
)({
  component: RouteComponent,
});

function RouteComponent() {
  const { roomId, cabinetId, autoPartId } = Route.useParams();
  return (
    <div>
      Pièce {autoPartId} (armoire {cabinetId}, salle {roomId})
    </div>
  );
}
