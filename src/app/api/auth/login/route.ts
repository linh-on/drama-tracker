import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(null, { status: 400 });
    }

    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    const user = result.rows[0];
    if (!user) return NextResponse.json(null, { status: 401 });
    if (!user.email_verified) return NextResponse.json(null, { status: 401 });
    if (user.status !== "approved")
      return NextResponse.json(null, { status: 401 });

    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid) return NextResponse.json(null, { status: 401 });

    return NextResponse.json({
      id: String(user.id),
      name: user.name,
      email: user.email,
      status: user.status,
    });
  } catch (err) {
    return NextResponse.json(null, { status: 500 });
  }
}
