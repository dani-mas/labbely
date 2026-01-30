"use client";

import Link from "next/link";

import LanguageSwitcher from "@/components/LanguageSwitcher";
import { LandingContainer } from "./LandingContainer";

import styles from "./LandingFooter.module.css";
import type { LandingFooterProps } from "./types";

export function LandingFooter({
  logoSrc,
  locale: _locale,
  homeAriaLabel,
  tagline,
  productLabel,
  editorLabel,
  loginLabel,
  developersLabel,
  githubLabel,
  issuesLabel,
  languageLabel,
  copyright: copyrightText,
  appHref,
  loginHref,
  githubHref,
  issuesHref,
  className = "",
  style,
}: LandingFooterProps) {
  const localePrefix = _locale ? `/${_locale}` : "/";

  return (
    <footer className={`${styles.footer} ${className}`} style={style}>
      <LandingContainer>
        <div className={styles.grid}>
          <div className={styles.brand}>
            <Link href={localePrefix} className={styles.logoLink} aria-label={homeAriaLabel}>
              <img src={logoSrc} alt="Labbely" className={styles.logo} loading="lazy" />
            </Link>
            <p className={styles.tagline}>{tagline}</p>
          </div>
          
          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{productLabel}</h3>
            <ul className={styles.linkList}>
              <li>
                <Link href={appHref} className={styles.link}>
                  {editorLabel}
                </Link>
              </li>
              <li>
                <Link href={loginHref} className={styles.link}>
                  {loginLabel}
                </Link>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{developersLabel}</h3>
            <ul className={styles.linkList}>
              <li>
                <a href={githubHref} target="_blank" rel="noreferrer" className={styles.link}>
                  {githubLabel}
                </a>
              </li>
              <li>
                <a href={issuesHref} target="_blank" rel="noreferrer" className={styles.link}>
                  {issuesLabel}
                </a>
              </li>
            </ul>
          </div>

          <div className={styles.column}>
            <h3 className={styles.columnTitle}>{languageLabel}</h3>
            <div className={styles.languageWrap}>
              <LanguageSwitcher />
            </div>
          </div>
        </div>

        <div className={styles.copyright}>
          <span>{copyrightText}</span>
        </div>
      </LandingContainer>
    </footer>
  );
}
