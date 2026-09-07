import { NextResponse } from "next/server";
import { adminDataResponse } from "@/lib/admin-data-server";
import { getMessageActor } from "@/lib/message-auth";
import { listMessageAssignees } from "@/lib/message-service";

export const runtime = "nodejs";

export async function GET() {
  const actor = await getMessageActor();
  if (!actor.ok) {
    return NextResponse.json(
      { error: actor.status === 401 ? "Unauthorized" : "Forbidden" },
      { status: actor.status },
    );
  }

  return adminDataResponse("messages", "assignees", async () => ({
    assignees: await listMessageAssignees(),
    currentUserId: actor.userId,
  }));
}
