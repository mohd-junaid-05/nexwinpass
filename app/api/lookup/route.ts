import { NextRequest, NextResponse } from "next/server";
import { lookupLimiter } from "@/lib/rateLimit";
import { generateCertificateId } from "@/lib/certificates/id";
import rawRegistrations from "@/data/registrations.json";

interface Registration {
  email: string;
  name: string;
  team: string;
  teamId: string;
  track: number;
  role: string;
  members: number;
  idea?: string;
  number?: number;
  participation?: boolean;
  completion?: boolean;
}

const registrations: Registration[] = rawRegistrations as Registration[];

export async function POST(request: NextRequest) {
  try {
    // Rate limit by IP (shared limit across both Pass and Certificates tabs)
    const forwarded = request.headers.get("x-forwarded-for");
    const ip = forwarded?.split(",")[0]?.trim() ?? "unknown";

    if (!lookupLimiter.check(ip)) {
      return NextResponse.json(
        { error: "Too many tries. Wait a minute." },
        { status: 429 },
      );
    }

    let body: { email?: string; teamId?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";

    if (!email) {
      return NextResponse.json({ found: false }, { status: 200 });
    }

    const match = registrations.find(
      (r) => r.email.trim().toLowerCase() === email,
    );

    if (!match) {
      // Same status code as a hit — indistinguishable by timing or code
      return NextResponse.json({ found: false }, { status: 200 });
    }

    // Optional second check: require team ID matching if enabled
    const requireTeamId =
      process.env.REQUIRE_TEAM_ID === "true" ||
      process.env.NEXT_PUBLIC_REQUIRE_TEAM_ID === "true";

    if (requireTeamId) {
      const providedTeamId =
        typeof body.teamId === "string" ? body.teamId.trim().toUpperCase() : "";
      const expectedTeamId = (match.teamId || "").trim().toUpperCase();

      if (!providedTeamId || providedTeamId !== expectedTeamId) {
        // Return exact same generic response as unknown email
        return NextResponse.json({ found: false }, { status: 200 });
      }
    }

    // Server strictly evaluates certificate eligibility
    const isParticipationEligible = match.participation !== false;
    const isCompletionEligible = match.completion === true;

    let participationId: string | null = null;
    let completionId: string | null = null;

    try {
      participationId = isParticipationEligible
        ? generateCertificateId("participation", match)
        : null;
    } catch (err) {
      console.warn("[api/lookup] Error generating participation certificate ID:", err);
    }

    try {
      completionId = isCompletionEligible
        ? generateCertificateId("completion", match)
        : null;
    } catch (err) {
      console.warn("[api/lookup] Error generating completion certificate ID:", err);
    }

    // Never return the email, never return teammates' names
    return NextResponse.json({
      found: true,
      name: match.name,
      team: match.team,
      teamId: match.teamId,
      track: match.track,
      role: match.role,
      members: match.members,
      idea: match.idea ?? "",
      number: match.number,
      certificates: {
        participation: {
          eligible: isParticipationEligible,
          id: participationId,
        },
        completion: {
          eligible: isCompletionEligible,
          id: completionId,
        },
      },
    });
  } catch (error) {
    console.error("[api/lookup] Unexpected server error:", error);
    return NextResponse.json(
      { error: "Internal server error. Please try again." },
      { status: 500 }
    );
  }
}
