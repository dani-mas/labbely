"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function LoginPage() {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("Login");
  const [odooUrl, setOdooUrl] = useState("");
  const [db, setDb] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  const handleSubmit = async () => {
    setStatus("loading");
    setMessage("");
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ odooUrl, db, username, password }),
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      setStatus("error");
      setMessage(payload?.error ?? t("loginFailed"));
      return;
    }
    setStatus("success");
    setMessage(t("sessionCreated"));
    router.push(`/${locale}/app`);
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-6 py-12 text-slate-900">
      <div className="absolute right-6 top-6">
        <LanguageSwitcher />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-widest text-muted-foreground">
            {t("brand")}
          </p>
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>{t("description")}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label htmlFor="odoo-url">{t("odooUrl")}</Label>
            <Input
              id="odoo-url"
              name="odooUrl"
              type="url"
              placeholder={t("odooUrlPlaceholder")}
              value={odooUrl}
              onChange={(event) => setOdooUrl(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="db">{t("database")}</Label>
            <Input
              id="db"
              name="db"
              type="text"
              placeholder={t("databasePlaceholder")}
              value={db}
              onChange={(event) => setDb(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="username">{t("email")}</Label>
            <Input
              id="username"
              name="username"
              type="email"
              placeholder={t("emailPlaceholder")}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
            />
          </div>
          <div className="space-y-3">
            <Label htmlFor="password">{t("password")}</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder={t("passwordPlaceholder")}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={handleSubmit}
            disabled={status === "loading"}
          >
            {status === "loading" ? t("creatingSession") : t("createSession")}
          </Button>
          {message ? (
            <p className={`text-sm ${status === "error" ? "text-destructive" : "text-emerald-600"}`}>
              {message}
            </p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
