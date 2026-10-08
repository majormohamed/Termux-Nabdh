import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const roles = (req.nextauth.token?.roles as string[]) ?? [];
    const path = req.nextUrl.pathname;

    if (path.startsWith("/admin") && !roles.includes("SUPER_ADMIN")) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    if (
      path.startsWith("/hospital") &&
      !path.startsWith("/hospital/register") &&
      !roles.some((r) => ["SUPER_ADMIN", "HOSPITAL_ADMIN", "RECEPTIONIST", "DOCTOR", "LAB_STAFF", "RADIOLOGY_STAFF", "ACCOUNTANT"].includes(r))
    ) {
      return NextResponse.redirect(new URL("/dashboard", req.url));
    }
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: ["/dashboard/:path*", "/admin/:path*", "/hospital/:path*", "/bookings/:path*", "/notifications/:path*"],
};
