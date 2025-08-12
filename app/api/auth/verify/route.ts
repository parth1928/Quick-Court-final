import { NextResponse } from "next/server";
import { withAuth } from "@/lib/auth";

export const GET = withAuth(async (req: Request, user: any) => {
  // If we get here, the token is valid because withAuth middleware validated it
  return NextResponse.json({ 
    valid: true,
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }
  });
});
