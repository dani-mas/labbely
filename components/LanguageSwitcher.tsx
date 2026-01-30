"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const locale = useLocale();
  const t = useTranslations("Common");

  const handleLocaleChange = (nextLocale: Locale) => {
    console.log("🔵 LanguageSwitcher - handleLocaleChange called");
    console.log("  Current locale (from hook):", locale);
    console.log("  Next locale:", nextLocale);
    console.log("  Current pathname (from hook):", pathname);
    console.log("  Current window.location.pathname:", window.location.pathname);
    console.log("  Current window.location.href:", window.location.href);
    
    if (nextLocale === locale) {
      console.log("  ⚠️ Same locale, returning early");
      return;
    }
    
    // Use the actual browser pathname instead of the hook
    const actualPathname = window.location.pathname;
    const segments = actualPathname.split("/").filter(Boolean);
    const query = window.location.search.substring(1); // Remove leading ?
    console.log("  Actual pathname segments:", segments);
    console.log("  Query params:", query);
    
    // Check if first segment is a locale
    const hasLocalePrefix = segments[0] && locales.includes(segments[0] as Locale);
    console.log("  Has locale prefix:", hasLocalePrefix, segments[0]);
    
    // Get path without locale
    const pathWithoutLocale = hasLocalePrefix 
      ? "/" + segments.slice(1).join("/")
      : actualPathname;
    console.log("  Path without locale:", pathWithoutLocale);
    
    // Always include locale prefix in path
    const cleanPath = pathWithoutLocale === "/" ? "" : pathWithoutLocale;
    let newPath = `/${nextLocale}${cleanPath}`;
    console.log("  📍 Building path (always prefix):", newPath);
    
    // Ensure path starts with /
    if (!newPath.startsWith("/")) {
      newPath = "/" + newPath;
    }
    
    const fullPath = query ? `${newPath}?${query}` : newPath;
    console.log("  ✅ Final full path:", fullPath);
    console.log("  🚀 Navigating to:", fullPath);
    console.log("  Locale prefix is always enabled");
    
    // Force a complete page reload to ensure middleware processes the locale change
    window.location.href = fullPath;
  };

  return (
    <Select value={locale} onValueChange={handleLocaleChange}>
      <SelectTrigger className="h-8 w-[140px] text-xs">
        <SelectValue placeholder={t("language")} />
      </SelectTrigger>
      <SelectContent>
        {locales.map((item) => (
          <SelectItem key={item} value={item}>
            {item === "en" ? t("languageEn") : t("languageEs")}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
