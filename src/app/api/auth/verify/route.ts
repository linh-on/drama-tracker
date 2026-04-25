import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const { email, pin } = await req.json();

    if (!email || !pin) {
      return NextResponse.json(
        { error: "Email and PIN are required" },
        { status: 400 },
      );
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.email_verified) {
      return NextResponse.json(
        { error: "Email already verified" },
        { status: 400 },
      );
    }

    if (user.verify_pin !== pin) {
      return NextResponse.json(
        { error: "Incorrect PIN. Please try again." },
        { status: 400 },
      );
    }

    if (new Date() > new Date(user.verify_expires)) {
      return NextResponse.json(
        { error: "PIN has expired. Please register again." },
        { status: 400 },
      );
    }

    // Mark email as verified
    await pool.query(
      `UPDATE users 
   SET email_verified = true, status = 'approved', verify_pin = null, verify_expires = null
   WHERE email = $1`,
      [email],
    );

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Verify error:", err);
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
