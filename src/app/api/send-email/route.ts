import { NextResponse } from "next/server";
import sendMail from "@/lib/sendMail";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    await sendMail(body);

    return NextResponse.json({ success: true, message: "Mail sent successfully" });
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
