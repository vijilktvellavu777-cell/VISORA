import { NextResponse } from "next/server";
import { getPushConfig } from "@/lib/push-delivery";

export async function GET() {
  const config = getPushConfig();
  return NextResponse.json({
    enabled: config.webPushEnabled,
    publicKey: config.vapidPublicKey,
  });
}
