import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { sendVerificationEmail } from "@/lib/email";

function generatePin(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export async function POST(req: NextRequest) {
  try {
    const { name, email, password } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Name, email and password are required" },
        { status: 400 },
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 },
      );
    }

    // Check if email already exists
    const existing = await pool.query("SELECT id FROM users WHERE email = $1", [
      email,
    ]);
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 },
      );
    }

    // Hash password
    const password_hash = await bcrypt.hash(password, 10);

    // Generate PIN
    const pin = generatePin();
    const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Delete any previous unverified attempt with same email
    await pool.query(
      "DELETE FROM users WHERE email = $1 AND email_verified = false",
      [email],
    );

    // Create user
    await pool.query(
      `INSERT INTO users (name, email, password_hash, provider, status, email_verified, verify_pin, verify_expires)
       VALUES ($1, $2, $3, 'credentials', 'pending', false, $4, $5)`,
      [name.trim(), email.toLowerCase().trim(), password_hash, pin, expires],
    );

    // Send verification email
    await sendVerificationEmail(email, name, pin);

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Something went wrong. Please try again." },
      { status: 500 },
    );
  }
}
