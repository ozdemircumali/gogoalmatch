import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const subscription = await request.json();

    if (!subscription?.endpoint) {
      return NextResponse.json(
        { error: "Invalid push subscription" },
        { status: 400 }
      );
    }

    // Şimdilik aboneliği doğruluyoruz.
    // Kalıcı kayıt sistemini bir sonraki adımda ekleyeceğiz.
    console.log("Push subscription received:", subscription);

    return NextResponse.json({
      success: true,
      message: "Push subscription received",
    });
  } catch (error) {
    console.error("Push subscription error:", error);

    return NextResponse.json(
      { error: "Failed to save push subscription" },
      { status: 500 }
    );
  }
}
