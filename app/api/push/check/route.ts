import { NextResponse } from "next/server";
import { Redis } from "@upstash/redis";
import webpush from "web-push";

export const dynamic = "force-dynamic";

const redisUrl = process.env.kv_rest_api_url;
const redisToken = process.env.kv_rest_api_token;

const apiKey = process.env.API_FOOTBALL_KEY;
const vapidPublicKey =
  process.env.next_public_vapid_public_key;
const vapidPrivateKey =
  process.env.vapid_private_key;
const vapidSubject =
  process.env.vapid_subject;

function getRedis() {
  if (!redisUrl || !redisToken) {
    throw new Error(
      "Redis environment variables are not configured"
    );
  }

  return new Redis({
    url: redisUrl,
    token: redisToken,
  });
}

function getEventKey(event: any): string {
  return [
    event?.time?.elapsed ?? "",
    event?.time?.extra ?? "",
    event?.team?.id ?? "",
    event?.player?.id ??
      event?.player?.name ??
      "",
    event?.type ?? "",
    event?.detail ?? "",
    event?.comments ?? "",
  ].join("|");
}

function getAlertType(
  event: any
): string | null {
  const type =
    event?.type?.toLowerCase() || "";

  const detail =
    event?.detail?.toLowerCase() || "";

  if (type === "goal") {
    if (detail.includes("missed")) {
      return null;
    }

    return "goal";
  }

  if (type === "card") {
    if (detail.includes("red")) {
      return "red";
    }

    return "yellow";
  }

  if (type === "var") {
    if (detail.includes("penalty")) {
      return "penalty";
    }

    return "var";
  }

  if (detail.includes("penalty")) {
    return "penalty";
  }

  return null;
}

function getTitle(type: string) {
  if (type === "goal") {
    return "GOOOOOL!";
  }

  if (type === "yellow") {
    return "YELLOW CARD";
  }

  if (type === "red") {
    return "RED CARD";
  }

  if (type === "penalty") {
    return "PENALTY";
  }

  return "VAR";
}

function getIcon(type: string) {
  if (type === "goal") {
    return "⚽";
  }

  if (type === "yellow") {
    return "🟨";
  }

  if (type === "red") {
    return "🟥";
  }

  if (type === "penalty") {
    return "⚽";
  }

  return "📺";
}

function getEventText(
  fixture: any,
  event: any,
  type: string
) {
  const home =
    fixture?.teams?.home?.name ||
    "Home";

  const away =
    fixture?.teams?.away?.name ||
    "Away";

  const homeScore =
    fixture?.goals?.home ?? "-";

  const awayScore =
    fixture?.goals?.away ?? "-";

  const minute =
    event?.time?.elapsed !==
      null &&
    event?.time?.elapsed !==
      undefined
      ? ` · ${event.time.elapsed}'`
      : "";

  if (type === "goal") {
    const player =
      event?.player?.name;

    if (player) {
      return `${home} ${homeScore} - ${awayScore} ${away} · ${player}${minute}`;
    }

    return `${home} ${homeScore} - ${awayScore} ${away}${minute}`;
  }

  if (
    type === "yellow" ||
    type === "red"
  ) {
    return `${
      event?.player?.name ||
      "Player"
    }${minute} · ${home} vs ${away}`;
  }

  return `${home} vs ${away}${minute}`;
}

export async function GET(
  request: Request
) {
  try {
    const url = new URL(request.url);

    const cronSecret =
      process.env.CRON_SECRET;

    if (
      cronSecret &&
      url.searchParams.get(
        "secret"
      ) !== cronSecret
    ) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "API_FOOTBALL_KEY is not configured",
        },
        { status: 500 }
      );
    }

    if (
      !vapidPublicKey ||
      !vapidPrivateKey ||
      !vapidSubject
    ) {
      return NextResponse.json(
        {
          error:
            "VAPID environment variables are not configured",
        },
        { status: 500 }
      );
    }

    const redis = getRedis();

    webpush.setVapidDetails(
      vapidSubject,
      vapidPublicKey,
      vapidPrivateKey
    );

    const response =
      await fetch(
        "https://v3.football.api-sports.io/fixtures?live=all&timezone=America/New_York",
        {
          method: "GET",
          headers: {
            "x-apisports-key": apiKey,
          },
          cache: "no-store",
        }
      );

    if (!response.ok) {
      return NextResponse.json(
        {
          error: `API-Football error: ${response.status}`,
        },
        { status: response.status }
      );
    }

    const apiData =
      await response.json();

    if (
      apiData?.errors &&
      Object.keys(apiData.errors)
        .length > 0
    ) {
      return NextResponse.json(
        {
          error:
            "API-Football returned an error",
          details: apiData.errors,
        },
        { status: 502 }
      );
    }

    const fixtures =
      Array.isArray(
        apiData?.response
      )
        ? apiData.response
        : [];

    const subscriptions =
      await redis.hgetall(
        "ggm:push:subscriptions"
      );

    if (!subscriptions) {
      return NextResponse.json({
        success: true,
        message:
          "No push subscriptions",
        notificationsSent: 0,
      });
    }

    const sentNotifications: string[] =
      [];

    const removedSubscriptions: string[] =
      [];

    for (const fixture of fixtures) {
      const fixtureId =
        String(
          fixture?.fixture?.id ||
            ""
        );

      if (!fixtureId) {
        continue;
      }

      const home =
        fixture?.teams?.home?.name ||
        "Home";

      const away =
        fixture?.teams?.away?.name ||
        "Away";

      const homeScore =
        fixture?.goals?.home ?? "-";

      const awayScore =
        fixture?.goals?.away ?? "-";

      const events =
        Array.isArray(
          fixture?.events
        )
          ? fixture.events
          : [];

      const currentEventKeys =
        events.map(
          getEventKey
        );

      const stateKey =
        `ggm:push:fixture:${fixtureId}`;

      const previousState =
        await redis.get<{
          score: string;
          events: string[];
        }>(stateKey);

      const currentScore =
        `${homeScore}-${awayScore}`;

      /*
       * İlk kontrolde mevcut durumu
       * kaydediyoruz.
       *
       * Böylece kullanıcı sistemi
       * açtığında eski goller için
       * bildirim gitmiyor.
       */
      if (!previousState) {
        await redis.set(
          stateKey,
          {
            score:
              currentScore,
            events:
              currentEventKeys,
          },
          {
            ex: 21600,
          }
        );

        continue;
      }

      const previousEvents =
        new Set(
          Array.isArray(
            previousState.events
          )
            ? previousState.events
            : []
        );

      const newEvents =
        events.filter(
          (event: any) =>
            !previousEvents.has(
              getEventKey(event)
            )
        );

      const scoreChanged =
        previousState.score !==
        currentScore;

      /*
       * Önce yeni event'leri buluyoruz.
       * API event göndermese bile skor
       * değiştiyse gol bildirimi üretilecek.
       */
      let alerts: {
        type: string;
        title: string;
        body: string;
        eventKey: string;
      }[] = [];

      for (const event of newEvents) {
        const type =
          getAlertType(event);

        if (!type) {
          continue;
        }

        alerts.push({
          type,
          title:
            `${getIcon(type)} ${getTitle(type)}`,
          body:
            getEventText(
              fixture,
              event,
              type
            ),
          eventKey:
            getEventKey(event),
        });
      }

      if (
        scoreChanged &&
        alerts.length === 0
      ) {
        alerts.push({
          type: "goal",
          title: "⚽ GOOOOOL!",
          body:
            `${home} ${homeScore} - ${awayScore} ${away}`,
          eventKey:
            `score:${currentScore}`,
        });
      }

      /*
       * Yeni durumu kaydet.
       */
      await redis.set(
        stateKey,
        {
          score:
            currentScore,
          events:
            currentEventKeys,
        },
        {
          ex: 21600,
        }
      );

      if (alerts.length === 0) {
        continue;
      }

      /*
       * Bu maçı favorilerine eklemiş
       * olan bütün abonelere gönder.
       */
      for (const [
        subscriptionId,
        rawValue,
      ] of Object.entries(
        subscriptions
      )) {
        try {
          const saved =
            typeof rawValue ===
            "string"
              ? JSON.parse(
                  rawValue
                )
              : rawValue;

          const favoriteIds =
            Array.isArray(
              saved?.favorites
            )
              ? saved.favorites.map(
                  String
                )
              : [];

          if (
            !favoriteIds.includes(
              fixtureId
            )
          ) {
            continue;
          }

          const subscription =
            saved?.subscription;

          if (
            !subscription?.endpoint
          ) {
            continue;
          }

          for (const alert of alerts) {
            try {
              await webpush.sendNotification(
                subscription,
                JSON.stringify({
                  title:
                    alert.title,
                  body:
                    alert.body,
                  icon:
                    "/favicon.ico",
                  badge:
                    "/favicon.ico",
                  tag:
                    `ggm-${fixtureId}-${alert.eventKey}`,
                  url:
                    `/matches/${fixtureId}`,
                  fixtureId,
                })
              );

              sentNotifications.push(
                `${subscriptionId}:${fixtureId}:${alert.type}`
              );
            } catch (pushError: any) {
              const statusCode =
                pushError?.statusCode;

              /*
               * 404/410 = abonelik artık
               * geçerli değil. Redis'ten sil.
               */
              if (
                statusCode === 404 ||
                statusCode === 410
              ) {
                await redis.hdel(
                  "ggm:push:subscriptions",
                  subscriptionId
                );

                removedSubscriptions.push(
                  subscriptionId
                );
              } else {
                console.error(
                  "Push send error:",
                  pushError
                );
              }
            }
          }
        } catch (subscriptionError) {
          console.error(
            "Subscription processing error:",
            subscriptionError
          );
        }
      }
    }

    return NextResponse.json({
      success: true,
      fixturesChecked:
        fixtures.length,
      notificationsSent:
        sentNotifications.length,
      removedSubscriptions:
        removedSubscriptions.length,
    });
  } catch (error) {
    console.error(
      "Push check error:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Background push check failed",
      },
      { status: 500 }
    );
  }
}
