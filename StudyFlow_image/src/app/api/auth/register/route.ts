import { NextResponse } from "next/server";
import { createUser, PhoneTakenError } from "@/lib/auth/users";
import { setSessionCookie } from "@/lib/auth/current-user";
import { isValidRegistration } from "@/lib/auth/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: {
    firstName?: unknown;
    lastName?: unknown;
    phone?: unknown;
    password?: unknown;
    confirmPassword?: unknown;
  };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  const firstName = typeof body.firstName === "string" ? body.firstName : "";
  const lastName = typeof body.lastName === "string" ? body.lastName : "";
  const phone = typeof body.phone === "string" ? body.phone : "";
  const password = typeof body.password === "string" ? body.password : "";
  const confirmPassword =
    typeof body.confirmPassword === "string" ? body.confirmPassword : "";

  if (!isValidRegistration(firstName, lastName, phone, password, confirmPassword)) {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const user = await createUser(firstName, lastName, phone, password);
    await setSessionCookie({
      userId: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      role: "student",
    });
    // New students are not in the class yet — they land on /pending until the
    // teacher adds them.
    return NextResponse.json({
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        role: "student",
      },
      inClass: false,
    });
  } catch (err) {
    if (err instanceof PhoneTakenError) {
      return NextResponse.json({ error: "taken" }, { status: 409 });
    }
    console.error("register failed:", err);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
