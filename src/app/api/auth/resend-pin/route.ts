import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import { sendVerificationEmail } from "@/lib/email";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    if (user.email_verified)
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 },
      );

    // Generate new PIN
    const pin = generatePin();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await pool.query(
      "UPDATE users SET verify_pin = $1, verify_expires = $2 WHERE email = $3",
      [pin, expires, email],
    );

    await sendVerificationEmail(email, user.name, pin);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to resend PIN" },
      { status: 500 },
    );
  }
}
