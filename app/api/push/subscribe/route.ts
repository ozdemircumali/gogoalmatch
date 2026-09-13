import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redis = Redis.fromEnv();

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const subscription = body?.subscription;
    const favorites = Array.isArray(body?.favorites)
      ? body.favorites.map(String)
      : [];

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 }
      );
    }

    const subscriptionId = crypto
      .createHash("sha256")
      .update(subscription.endpoint)
      .digest("hex");

    const data = {
      subscription,
      favorites,
      updatedAt: new Date().toISOString(),
    };

    await redis.hset("ggm:push:subscriptions", {
      [subscriptionId]: JSON.stringify(data),
    });

    return NextResponse.json({
      success: true,
      subscriptionId,
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }
}
