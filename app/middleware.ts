import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // const token = request.cookies.get("token")?.value;
  const token=localStorage.getItem('token')
  console.log('token',token)

  if (!token) {
    return NextResponse.redirect(new URL("/user/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/orders/:path*",
    "/products/:path*",
    "/userTable/:path*",
  ],
};
