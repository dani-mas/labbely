import createMiddleware from "next-intl/middleware";
import { NextRequest } from "next/server";

import { defaultLocale, localePrefix, locales } from "./lib/i18n";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
  // Don't auto-detect locale from Accept-Language header
  localeDetection: false,
});

export default function middleware(request: NextRequest) {
  console.log("🟡 Middleware - Request URL:", request.nextUrl.pathname);
  console.log("  Request headers:", {
    "x-next-intl-locale": request.headers.get("x-next-intl-locale"),
    "accept-language": request.headers.get("accept-language"),
  });
  
  const response = intlMiddleware(request);
  
  console.log("  Response status:", response.status);
  console.log("  Response headers:", {
    "x-next-intl-locale": response.headers.get("x-next-intl-locale"),
    location: response.headers.get("location"),
  });
  
  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
