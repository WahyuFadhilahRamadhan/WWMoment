import { NextRequest, NextResponse } from "next/server";
import {
  ADMIN_COOKIE_MAX_AGE,
  ADMIN_COOKIE_NAME,
  hashAdminPasscode,
} from "@/lib/adminAuth";

export async function POST(request: NextRequest) {
  const adminPasscode = process.env.ADMIN_PASSCODE;
  if (!adminPasscode) {
    return NextResponse.json(
      { error: "Admin passcode is not configured on the server." },
      { status: 500 }
    );
  }

  const body = await request.json().catch(() => null);
  const passcode = body?.passcode;

  if (typeof passcode !== "string" || passcode !== adminPasscode) {
    return NextResponse.json(
      { error: "Incorrect passcode." },
      { status: 401 }
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_COOKIE_NAME, hashAdminPasscode(adminPasscode), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: ADMIN_COOKIE_MAX_AGE,
  });
  return response;
}
