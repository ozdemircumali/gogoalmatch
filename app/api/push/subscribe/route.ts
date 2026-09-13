import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import crypto from "crypto";

const redisUrl = process.env.kv_rest_api_url;
const redisToken = process.env.kv_rest_api_token;

export async function POST(request: Request) {
  try {
    if (!redisUrl || !redisToken) {
      return NextResponse.json(
        { error: "Redis environment variables are not configured" },
        { status: 500 }
      );
    }

    const redis = new Redis({
      url: redisUrl,
      token: redisToken,
    });

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
