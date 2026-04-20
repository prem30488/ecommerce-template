import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datetime/css/react-datetime.css";
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import '../App.css';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL DESIGN TOKEN SYSTEM
//  ✅  To retheme the ENTIRE frontend, change values here ONLY.
//      All CSS files reference these tokens via var(--color-*) variables.
// ─────────────────────────────────────────────────────────────────────────────
export const themeColors = {

  // ── Primary  (teal-600) ─── buttons, CTAs, active dots, marquee strips ────
  primary: '#0d9488',
  primaryHover: '#0f766e',
  primaryGlow: 'rgba(13, 148, 136, 0.06)',   // very subtle bg tint
  primaryLight: 'rgba(13, 148, 136, 0.10)',   // light badge bg / hover bg
  primaryShadow: 'rgba(13, 148, 136, 0.28)',   // standard button shadow
  primaryShadowMd: 'rgba(13, 148, 136, 0.32)',   // dot hover / nav hover
  primaryShadowLg: 'rgba(13, 148, 136, 0.45)',   // heavy icon shadow / glow
  primaryBorder: 'rgba(13, 148, 136, 0.25)',   // badge border
  primaryUltraLight: '#f0fdf4',                    // image wrapper tint bg

  // ── Secondary  (blue-600) ─── featured products, secondary actions ─────────
  secondary: '#0d9488',
  secondaryHover: '#8BC53F',
  secondaryLight: '#8BC53F',
  secondaryShadow: 'rgba(13, 148, 136, 0.28)',
  secondaryShadowMd: 'rgba(13, 148, 136, 0.32)',
  secondaryShadowLg: 'rgba(13, 148, 136, 0.45)',
  secondaryBorder: 'rgba(13, 148, 136, 0.25)',
  secondaryUltraLight: '#f0fdf4',                    // feature card image bg

  // ── Navigation / Sky-600  (sky-600) ─── navbar links, back buttons ─────────
  nav: '#0d9488',
  navHover: '#25d4c6ff',
  navShadow: 'rgba(13, 148, 136, 0.28)',
  navShadowLg: 'rgba(13, 148, 136, 0.45)',
  navFocusRing: 'rgba(13, 148, 136, 0.25)',

  // ── Sky/Info  (sky-400) ─── frequent-buy cards, swiper pagination ──────────
  sky: '#0d9488',
  skyShadow: 'rgba(13, 148, 136, 0.28)',
  skyUltraLight: 'rgba(13, 148, 136, 0.10)',

  // ── Sale badge ──────────────────────────────────────────────────────────────
  badgeSale: '#0d9488',
  badgeSaleLight: '#8BC53F',
  badgeSaleUltraLight: '#f0fdf4',
  badgeSaleShadow: 'rgba(255, 71, 87, 0.30)',
  badgeSaleShadowLg: 'rgba(255, 71, 87, 0.60)',

  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#4f46e5',   // Featured (indigo)
  badgeBestseller: '#f59e0b',   // Bestseller (amber)
  badgeBestsellerHover: '#d97706',
  badgeBestsellerShadow: 'rgba(245, 158, 11, 0.3)',
  badgeNew: '#2563eb',   // NEW chip on nav

  // ── Category & Form meta chips ───────────────────────────────────────────────
  chipCategoryText: '#166534',
  chipCategoryBg: '#dcfce7',
  chipFormText: '#5b21b6',
  chipFormBg: '#ede9fe',

  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',

  // ── Base text & background ────────────────────────────────────────────────────
  text: '#212121',
  background: '#fff',
};

// ─────────────────────────────────────────────────────────────────────────────
//  Inject every token as a CSS custom property on :root
// ─────────────────────────────────────────────────────────────────────────────
if (typeof document !== 'undefined') {
  const r = document.documentElement.style;

  // Primary
  r.setProperty('--color-primary', themeColors.primary);
  r.setProperty('--color-primary-hover', themeColors.primaryHover);
  r.setProperty('--color-primary-glow', themeColors.primaryGlow);
  r.setProperty('--color-primary-light', themeColors.primaryLight);
  r.setProperty('--color-primary-shadow', themeColors.primaryShadow);
  r.setProperty('--color-primary-shadow-md', themeColors.primaryShadowMd);
  r.setProperty('--color-primary-shadow-lg', themeColors.primaryShadowLg);
  r.setProperty('--color-primary-border', themeColors.primaryBorder);
  r.setProperty('--color-primary-ultra-light', themeColors.primaryUltraLight);

  // Secondary
  r.setProperty('--color-secondary', themeColors.secondary);
  r.setProperty('--color-secondary-hover', themeColors.secondaryHover);
  r.setProperty('--color-secondary-light', themeColors.secondaryLight);
  r.setProperty('--color-secondary-shadow', themeColors.secondaryShadow);
  r.setProperty('--color-secondary-shadow-md', themeColors.secondaryShadowMd);
  r.setProperty('--color-secondary-shadow-lg', themeColors.secondaryShadowLg);
  r.setProperty('--color-secondary-border', themeColors.secondaryBorder);
  r.setProperty('--color-secondary-ultra-light', themeColors.secondaryUltraLight);

  // Navigation
  r.setProperty('--color-nav', themeColors.nav);
  r.setProperty('--color-nav-hover', themeColors.navHover);
  r.setProperty('--color-nav-shadow', themeColors.navShadow);
  r.setProperty('--color-nav-shadow-lg', themeColors.navShadowLg);
  r.setProperty('--color-nav-focus-ring', themeColors.navFocusRing);

  // Sky / Info
  r.setProperty('--color-sky', themeColors.sky);
  r.setProperty('--color-sky-shadow', themeColors.skyShadow);
  r.setProperty('--color-sky-ultra-light', themeColors.skyUltraLight);

  // Sale badges
  r.setProperty('--color-badge-sale', themeColors.badgeSale);
  r.setProperty('--color-badge-sale-light', themeColors.badgeSaleLight);
  r.setProperty('--color-badge-sale-ultra-light', themeColors.badgeSaleUltraLight);
  r.setProperty('--color-badge-sale-shadow', themeColors.badgeSaleShadow);
  r.setProperty('--color-badge-sale-shadow-lg', themeColors.badgeSaleShadowLg);

  // Status badges
  r.setProperty('--color-badge-featured', themeColors.badgeFeatured);
  r.setProperty('--color-badge-bestseller', themeColors.badgeBestseller);
  r.setProperty('--color-badge-bestseller-hover', themeColors.badgeBestsellerHover);
  r.setProperty('--color-badge-bestseller-shadow', themeColors.badgeBestsellerShadow);
  r.setProperty('--color-badge-new', themeColors.badgeNew);

  // Meta chips
  r.setProperty('--color-chip-category', themeColors.chipCategoryText);
  r.setProperty('--color-chip-category-bg', themeColors.chipCategoryBg);
  r.setProperty('--color-chip-form', themeColors.chipFormText);
  r.setProperty('--color-chip-form-bg', themeColors.chipFormBg);

  // Stock status
  r.setProperty('--color-in-stock', themeColors.inStock);
  r.setProperty('--color-in-stock-bg', themeColors.inStockBg);
  r.setProperty('--color-in-stock-border', themeColors.inStockBorder);
  r.setProperty('--color-out-of-stock', themeColors.outOfStock);
  r.setProperty('--color-out-of-stock-bg', themeColors.outOfStockBg);
  r.setProperty('--color-out-of-stock-border', themeColors.outOfStockBorder);

  // Text / Background
  r.setProperty('--color-text', themeColors.text);
  r.setProperty('--color-bg', themeColors.background);
}

// ─────────────────────────────────────────────────────────────────────────────
//  MUI theme – mirrors the same primary/secondary values
// ─────────────────────────────────────────────────────────────────────────────
const theme = createTheme({
  palette: {
    primary: { main: themeColors.primary },
    secondary: { main: themeColors.secondary },
    text: { primary: themeColors.text },
    background: { default: themeColors.background, paper: themeColors.background },
  },
  typography: {
    fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
  },
});

const ThemeWrapper = ({ children }) => (
  <ThemeProvider theme={theme}>
    {children}
  </ThemeProvider>
);

export default ThemeWrapper;
