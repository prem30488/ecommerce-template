import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import 'bootstrap/dist/css/bootstrap.min.css';
import "react-datetime/css/react-datetime.css";
import 'react-s-alert/dist/s-alert-default.css';
import 'react-s-alert/dist/s-alert-css-effects/slide.css';
import '../App.css';
import { getAppSettings } from '../util/APIUtils';

// ─────────────────────────────────────────────────────────────────────────────
//  GLOBAL DESIGN TOKEN SYSTEM
//  ✅  To retheme the ENTIRE frontend, change values here ONLY.
//      All CSS files reference these tokens via var(--color-*) variables.
// ─────────────────────────────────────────────────────────────────────────────
export const defaultTheme = {

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

export const midnightOrchid = {
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  primaryGlow: 'rgba(124, 58, 237, 0.06)',
  primaryLight: 'rgba(124, 58, 237, 0.10)',
  primaryShadow: 'rgba(124, 58, 237, 0.28)',
  primaryShadowMd: 'rgba(124, 58, 237, 0.32)',
  primaryShadowLg: 'rgba(124, 58, 237, 0.45)',
  primaryBorder: 'rgba(124, 58, 237, 0.25)',
  primaryUltraLight: '#f5f3ff',
  secondary: '#db2777',
  secondaryHover: '#be185d',
  secondaryLight: '#fce7f3',
  nav: '#1e1b4b',
  navHover: '#4338ca',
  badgeSale: '#f43f5e',
  badgeSaleLight: '#fff1f2',
  inStock: '#10b981',
  text: '#1e1b4b',
  background: '#ffffff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 1 — Ocean Teal  (calm, trustworthy, professional)
// ─────────────────────────────────────────────────────────────────────────────
export const oceanTeal = {
  // ── Primary  (teal-600) ──────────────────────────────────────────────────────
  primary: '#0d9488',
  primaryHover: '#0f766e',
  primaryGlow: 'rgba(13, 148, 136, 0.06)',
  primaryLight: 'rgba(13, 148, 136, 0.10)',
  primaryShadow: 'rgba(13, 148, 136, 0.28)',
  primaryShadowMd: 'rgba(13, 148, 136, 0.32)',
  primaryShadowLg: 'rgba(13, 148, 136, 0.45)',
  primaryBorder: 'rgba(13, 148, 136, 0.25)',
  primaryUltraLight: '#f0fdf4',
  // ── Secondary  (sky-500) ─────────────────────────────────────────────────────
  secondary: '#0ea5e9',
  secondaryHover: '#0284c7',
  secondaryLight: 'rgba(14, 165, 233, 0.10)',
  secondaryShadow: 'rgba(14, 165, 233, 0.28)',
  secondaryShadowMd: 'rgba(14, 165, 233, 0.32)',
  secondaryShadowLg: 'rgba(14, 165, 233, 0.45)',
  secondaryBorder: 'rgba(14, 165, 233, 0.25)',
  secondaryUltraLight: '#f0f9ff',
  // ── Navigation  (blue-700) ───────────────────────────────────────────────────
  nav: '#0369a1',
  navHover: '#0284c7',
  navShadow: 'rgba(3, 105, 161, 0.28)',
  navShadowLg: 'rgba(3, 105, 161, 0.45)',
  navFocusRing: 'rgba(3, 105, 161, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#0ea5e9',
  skyShadow: 'rgba(14, 165, 233, 0.28)',
  skyUltraLight: 'rgba(14, 165, 233, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#ef4444',
  badgeSaleLight: '#fee2e2',
  badgeSaleUltraLight: '#fff5f5',
  badgeSaleShadow: 'rgba(239, 68, 68, 0.30)',
  badgeSaleShadowLg: 'rgba(239, 68, 68, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#4f46e5',
  badgeBestseller: '#f59e0b',
  badgeBestsellerHover: '#d97706',
  badgeBestsellerShadow: 'rgba(245, 158, 11, 0.30)',
  badgeNew: '#2563eb',
  // ── Category & Form chips ────────────────────────────────────────────────────
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
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#212121',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 2 — Violet Dusk  (creative, premium, bold)
// ─────────────────────────────────────────────────────────────────────────────
export const violetDusk = {
  // ── Primary  (violet-600) ────────────────────────────────────────────────────
  primary: '#7c3aed',
  primaryHover: '#6d28d9',
  primaryGlow: 'rgba(124, 58, 237, 0.06)',
  primaryLight: 'rgba(124, 58, 237, 0.10)',
  primaryShadow: 'rgba(124, 58, 237, 0.28)',
  primaryShadowMd: 'rgba(124, 58, 237, 0.32)',
  primaryShadowLg: 'rgba(124, 58, 237, 0.45)',
  primaryBorder: 'rgba(124, 58, 237, 0.25)',
  primaryUltraLight: '#f5f3ff',
  // ── Secondary  (purple-500) ──────────────────────────────────────────────────
  secondary: '#a855f7',
  secondaryHover: '#9333ea',
  secondaryLight: 'rgba(168, 85, 247, 0.10)',
  secondaryShadow: 'rgba(168, 85, 247, 0.28)',
  secondaryShadowMd: 'rgba(168, 85, 247, 0.32)',
  secondaryShadowLg: 'rgba(168, 85, 247, 0.45)',
  secondaryBorder: 'rgba(168, 85, 247, 0.25)',
  secondaryUltraLight: '#faf5ff',
  // ── Navigation  (violet-700) ─────────────────────────────────────────────────
  nav: '#6d28d9',
  navHover: '#7c3aed',
  navShadow: 'rgba(109, 40, 217, 0.28)',
  navShadowLg: 'rgba(109, 40, 217, 0.45)',
  navFocusRing: 'rgba(109, 40, 217, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#a855f7',
  skyShadow: 'rgba(168, 85, 247, 0.28)',
  skyUltraLight: 'rgba(168, 85, 247, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#f43f5e',
  badgeSaleLight: '#ffe4e6',
  badgeSaleUltraLight: '#fff1f2',
  badgeSaleShadow: 'rgba(244, 63, 94, 0.30)',
  badgeSaleShadowLg: 'rgba(244, 63, 94, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#f59e0b',
  badgeBestsellerHover: '#d97706',
  badgeBestsellerShadow: 'rgba(245, 158, 11, 0.30)',
  badgeNew: '#7c3aed',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#1e40af',
  chipCategoryBg: '#dbeafe',
  chipFormText: '#6d28d9',
  chipFormBg: '#ede9fe',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1a1523',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 3 — Ember Rose  (warm, energetic, feminine)
// ─────────────────────────────────────────────────────────────────────────────
export const emberRose = {
  // ── Primary  (rose-600) ──────────────────────────────────────────────────────
  primary: '#e11d48',
  primaryHover: '#be123c',
  primaryGlow: 'rgba(225, 29, 72, 0.06)',
  primaryLight: 'rgba(225, 29, 72, 0.10)',
  primaryShadow: 'rgba(225, 29, 72, 0.28)',
  primaryShadowMd: 'rgba(225, 29, 72, 0.32)',
  primaryShadowLg: 'rgba(225, 29, 72, 0.45)',
  primaryBorder: 'rgba(225, 29, 72, 0.25)',
  primaryUltraLight: '#fff1f2',
  // ── Secondary  (pink-500) ────────────────────────────────────────────────────
  secondary: '#f43f5e',
  secondaryHover: '#e11d48',
  secondaryLight: 'rgba(244, 63, 94, 0.10)',
  secondaryShadow: 'rgba(244, 63, 94, 0.28)',
  secondaryShadowMd: 'rgba(244, 63, 94, 0.32)',
  secondaryShadowLg: 'rgba(244, 63, 94, 0.45)',
  secondaryBorder: 'rgba(244, 63, 94, 0.25)',
  secondaryUltraLight: '#fff0f3',
  // ── Navigation  (rose-900) ───────────────────────────────────────────────────
  nav: '#9f1239',
  navHover: '#be123c',
  navShadow: 'rgba(159, 18, 57, 0.28)',
  navShadowLg: 'rgba(159, 18, 57, 0.45)',
  navFocusRing: 'rgba(159, 18, 57, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#fb7185',
  skyShadow: 'rgba(251, 113, 133, 0.28)',
  skyUltraLight: 'rgba(251, 113, 133, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#7c3aed',
  badgeSaleLight: '#ede9fe',
  badgeSaleUltraLight: '#f5f3ff',
  badgeSaleShadow: 'rgba(124, 58, 237, 0.30)',
  badgeSaleShadowLg: 'rgba(124, 58, 237, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#f59e0b',
  badgeBestsellerHover: '#d97706',
  badgeBestsellerShadow: 'rgba(245, 158, 11, 0.30)',
  badgeNew: '#e11d48',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#9f1239',
  chipCategoryBg: '#ffe4e6',
  chipFormText: '#5b21b6',
  chipFormBg: '#ede9fe',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#b45309',
  outOfStockBg: 'rgba(180, 83, 9, 0.10)',
  outOfStockBorder: 'rgba(180, 83, 9, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1c0a0f',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 4 — Forest Sage  (natural, organic, earthy)
// ─────────────────────────────────────────────────────────────────────────────
export const forestSage = {
  // ── Primary  (green-700) ─────────────────────────────────────────────────────
  primary: '#15803d',
  primaryHover: '#166534',
  primaryGlow: 'rgba(21, 128, 61, 0.06)',
  primaryLight: 'rgba(21, 128, 61, 0.10)',
  primaryShadow: 'rgba(21, 128, 61, 0.28)',
  primaryShadowMd: 'rgba(21, 128, 61, 0.32)',
  primaryShadowLg: 'rgba(21, 128, 61, 0.45)',
  primaryBorder: 'rgba(21, 128, 61, 0.25)',
  primaryUltraLight: '#f0fdf4',
  // ── Secondary  (lime-600) ────────────────────────────────────────────────────
  secondary: '#65a30d',
  secondaryHover: '#4d7c0f',
  secondaryLight: 'rgba(101, 163, 13, 0.10)',
  secondaryShadow: 'rgba(101, 163, 13, 0.28)',
  secondaryShadowMd: 'rgba(101, 163, 13, 0.32)',
  secondaryShadowLg: 'rgba(101, 163, 13, 0.45)',
  secondaryBorder: 'rgba(101, 163, 13, 0.25)',
  secondaryUltraLight: '#f7fee7',
  // ── Navigation  (green-800) ──────────────────────────────────────────────────
  nav: '#166534',
  navHover: '#15803d',
  navShadow: 'rgba(22, 101, 52, 0.28)',
  navShadowLg: 'rgba(22, 101, 52, 0.45)',
  navFocusRing: 'rgba(22, 101, 52, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#65a30d',
  skyShadow: 'rgba(101, 163, 13, 0.28)',
  skyUltraLight: 'rgba(101, 163, 13, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#dc2626',
  badgeSaleLight: '#fee2e2',
  badgeSaleUltraLight: '#fff5f5',
  badgeSaleShadow: 'rgba(220, 38, 38, 0.30)',
  badgeSaleShadowLg: 'rgba(220, 38, 38, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#15803d',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#14532d',
  chipCategoryBg: '#dcfce7',
  chipFormText: '#3f6212',
  chipFormBg: '#ecfccb',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#15803d',
  inStockBg: 'rgba(21, 128, 61, 0.10)',
  inStockBorder: 'rgba(21, 128, 61, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#0f1f0f',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 5 — Solar Amber  (energetic, cheerful, bold)
// ─────────────────────────────────────────────────────────────────────────────
export const solarAmber = {
  // ── Primary  (amber-600) ─────────────────────────────────────────────────────
  primary: '#d97706',
  primaryHover: '#b45309',
  primaryGlow: 'rgba(217, 119, 6, 0.06)',
  primaryLight: 'rgba(217, 119, 6, 0.10)',
  primaryShadow: 'rgba(217, 119, 6, 0.28)',
  primaryShadowMd: 'rgba(217, 119, 6, 0.32)',
  primaryShadowLg: 'rgba(217, 119, 6, 0.45)',
  primaryBorder: 'rgba(217, 119, 6, 0.25)',
  primaryUltraLight: '#fffbeb',
  // ── Secondary  (yellow-400) ──────────────────────────────────────────────────
  secondary: '#f59e0b',
  secondaryHover: '#d97706',
  secondaryLight: 'rgba(245, 158, 11, 0.10)',
  secondaryShadow: 'rgba(245, 158, 11, 0.28)',
  secondaryShadowMd: 'rgba(245, 158, 11, 0.32)',
  secondaryShadowLg: 'rgba(245, 158, 11, 0.45)',
  secondaryBorder: 'rgba(245, 158, 11, 0.25)',
  secondaryUltraLight: '#fef9c3',
  // ── Navigation  (amber-900) ──────────────────────────────────────────────────
  nav: '#92400e',
  navHover: '#b45309',
  navShadow: 'rgba(146, 64, 14, 0.28)',
  navShadowLg: 'rgba(146, 64, 14, 0.45)',
  navFocusRing: 'rgba(146, 64, 14, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#fbbf24',
  skyShadow: 'rgba(251, 191, 36, 0.28)',
  skyUltraLight: 'rgba(251, 191, 36, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#dc2626',
  badgeSaleLight: '#fee2e2',
  badgeSaleUltraLight: '#fff5f5',
  badgeSaleShadow: 'rgba(220, 38, 38, 0.30)',
  badgeSaleShadowLg: 'rgba(220, 38, 38, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#4f46e5',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#d97706',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#78350f',
  chipCategoryBg: '#fef3c7',
  chipFormText: '#92400e',
  chipFormBg: '#fef9c3',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1c1400',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 6 — Midnight Indigo  (sophisticated, luxury, deep)
// ─────────────────────────────────────────────────────────────────────────────
export const midnightIndigo = {
  // ── Primary  (indigo-900) ────────────────────────────────────────────────────
  primary: '#312e81',
  primaryHover: '#3730a3',
  primaryGlow: 'rgba(49, 46, 129, 0.06)',
  primaryLight: 'rgba(49, 46, 129, 0.10)',
  primaryShadow: 'rgba(49, 46, 129, 0.28)',
  primaryShadowMd: 'rgba(49, 46, 129, 0.32)',
  primaryShadowLg: 'rgba(49, 46, 129, 0.45)',
  primaryBorder: 'rgba(49, 46, 129, 0.25)',
  primaryUltraLight: '#eef2ff',
  // ── Secondary  (indigo-600) ──────────────────────────────────────────────────
  secondary: '#4338ca',
  secondaryHover: '#3730a3',
  secondaryLight: 'rgba(67, 56, 202, 0.10)',
  secondaryShadow: 'rgba(67, 56, 202, 0.28)',
  secondaryShadowMd: 'rgba(67, 56, 202, 0.32)',
  secondaryShadowLg: 'rgba(67, 56, 202, 0.45)',
  secondaryBorder: 'rgba(67, 56, 202, 0.25)',
  secondaryUltraLight: '#f5f3ff',
  // ── Navigation  (indigo-950) ─────────────────────────────────────────────────
  nav: '#1e1b4b',
  navHover: '#312e81',
  navShadow: 'rgba(30, 27, 75, 0.28)',
  navShadowLg: 'rgba(30, 27, 75, 0.45)',
  navFocusRing: 'rgba(30, 27, 75, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#4338ca',
  skyShadow: 'rgba(67, 56, 202, 0.28)',
  skyUltraLight: 'rgba(67, 56, 202, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#be123c',
  badgeSaleLight: '#ffe4e6',
  badgeSaleUltraLight: '#fff1f2',
  badgeSaleShadow: 'rgba(190, 18, 60, 0.30)',
  badgeSaleShadowLg: 'rgba(190, 18, 60, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#312e81',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#1e1b4b',
  chipCategoryBg: '#e0e7ff',
  chipFormText: '#312e81',
  chipFormBg: '#ede9fe',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#0f0e1a',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 7 — Coral Blaze  (playful, modern, vibrant)
// ─────────────────────────────────────────────────────────────────────────────
export const coralBlaze = {
  // ── Primary  (orange-600) ────────────────────────────────────────────────────
  primary: '#ea580c',
  primaryHover: '#c2410c',
  primaryGlow: 'rgba(234, 88, 12, 0.06)',
  primaryLight: 'rgba(234, 88, 12, 0.10)',
  primaryShadow: 'rgba(234, 88, 12, 0.28)',
  primaryShadowMd: 'rgba(234, 88, 12, 0.32)',
  primaryShadowLg: 'rgba(234, 88, 12, 0.45)',
  primaryBorder: 'rgba(234, 88, 12, 0.25)',
  primaryUltraLight: '#fff7ed',
  // ── Secondary  (orange-400) ──────────────────────────────────────────────────
  secondary: '#f97316',
  secondaryHover: '#ea580c',
  secondaryLight: 'rgba(249, 115, 22, 0.10)',
  secondaryShadow: 'rgba(249, 115, 22, 0.28)',
  secondaryShadowMd: 'rgba(249, 115, 22, 0.32)',
  secondaryShadowLg: 'rgba(249, 115, 22, 0.45)',
  secondaryBorder: 'rgba(249, 115, 22, 0.25)',
  secondaryUltraLight: '#fff4e8',
  // ── Navigation  (orange-900) ─────────────────────────────────────────────────
  nav: '#9a3412',
  navHover: '#c2410c',
  navShadow: 'rgba(154, 52, 18, 0.28)',
  navShadowLg: 'rgba(154, 52, 18, 0.45)',
  navFocusRing: 'rgba(154, 52, 18, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#fb923c',
  skyShadow: 'rgba(251, 146, 60, 0.28)',
  skyUltraLight: 'rgba(251, 146, 60, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#7c3aed',
  badgeSaleLight: '#ede9fe',
  badgeSaleUltraLight: '#f5f3ff',
  badgeSaleShadow: 'rgba(124, 58, 237, 0.30)',
  badgeSaleShadowLg: 'rgba(124, 58, 237, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#eab308',
  badgeBestsellerHover: '#ca8a04',
  badgeBestsellerShadow: 'rgba(234, 179, 8, 0.30)',
  badgeNew: '#ea580c',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#7c2d12',
  chipCategoryBg: '#fed7aa',
  chipFormText: '#9a3412',
  chipFormBg: '#ffedd5',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1c0a00',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 8 — Sky Breeze  (fresh, airy, minimal)
// ─────────────────────────────────────────────────────────────────────────────
export const skyBreeze = {
  // ── Primary  (sky-600) ───────────────────────────────────────────────────────
  primary: '#0284c7',
  primaryHover: '#0369a1',
  primaryGlow: 'rgba(2, 132, 199, 0.06)',
  primaryLight: 'rgba(2, 132, 199, 0.10)',
  primaryShadow: 'rgba(2, 132, 199, 0.28)',
  primaryShadowMd: 'rgba(2, 132, 199, 0.32)',
  primaryShadowLg: 'rgba(2, 132, 199, 0.45)',
  primaryBorder: 'rgba(2, 132, 199, 0.25)',
  primaryUltraLight: '#f0f9ff',
  // ── Secondary  (sky-300) ─────────────────────────────────────────────────────
  secondary: '#38bdf8',
  secondaryHover: '#0ea5e9',
  secondaryLight: 'rgba(56, 189, 248, 0.10)',
  secondaryShadow: 'rgba(56, 189, 248, 0.28)',
  secondaryShadowMd: 'rgba(56, 189, 248, 0.32)',
  secondaryShadowLg: 'rgba(56, 189, 248, 0.45)',
  secondaryBorder: 'rgba(56, 189, 248, 0.25)',
  secondaryUltraLight: '#e0f2fe',
  // ── Navigation  (sky-700) ────────────────────────────────────────────────────
  nav: '#0369a1',
  navHover: '#0284c7',
  navShadow: 'rgba(3, 105, 161, 0.28)',
  navShadowLg: 'rgba(3, 105, 161, 0.45)',
  navFocusRing: 'rgba(3, 105, 161, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#38bdf8',
  skyShadow: 'rgba(56, 189, 248, 0.28)',
  skyUltraLight: 'rgba(56, 189, 248, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#e11d48',
  badgeSaleLight: '#ffe4e6',
  badgeSaleUltraLight: '#fff1f2',
  badgeSaleShadow: 'rgba(225, 29, 72, 0.30)',
  badgeSaleShadowLg: 'rgba(225, 29, 72, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#7c3aed',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#0284c7',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#075985',
  chipCategoryBg: '#e0f2fe',
  chipFormText: '#0369a1',
  chipFormBg: '#bae6fd',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#0c1a24',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 9 — Plum Luxe  (rich, elegant, feminine)
// ─────────────────────────────────────────────────────────────────────────────
export const plumLuxe = {
  // ── Primary  (pink-800) ──────────────────────────────────────────────────────
  primary: '#9d174d',
  primaryHover: '#831843',
  primaryGlow: 'rgba(157, 23, 77, 0.06)',
  primaryLight: 'rgba(157, 23, 77, 0.10)',
  primaryShadow: 'rgba(157, 23, 77, 0.28)',
  primaryShadowMd: 'rgba(157, 23, 77, 0.32)',
  primaryShadowLg: 'rgba(157, 23, 77, 0.45)',
  primaryBorder: 'rgba(157, 23, 77, 0.25)',
  primaryUltraLight: '#fdf2f8',
  // ── Secondary  (pink-600) ────────────────────────────────────────────────────
  secondary: '#db2777',
  secondaryHover: '#be185d',
  secondaryLight: 'rgba(219, 39, 119, 0.10)',
  secondaryShadow: 'rgba(219, 39, 119, 0.28)',
  secondaryShadowMd: 'rgba(219, 39, 119, 0.32)',
  secondaryShadowLg: 'rgba(219, 39, 119, 0.45)',
  secondaryBorder: 'rgba(219, 39, 119, 0.25)',
  secondaryUltraLight: '#fce7f3',
  // ── Navigation  (pink-900) ───────────────────────────────────────────────────
  nav: '#831843',
  navHover: '#9d174d',
  navShadow: 'rgba(131, 24, 67, 0.28)',
  navShadowLg: 'rgba(131, 24, 67, 0.45)',
  navFocusRing: 'rgba(131, 24, 67, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#f472b6',
  skyShadow: 'rgba(244, 114, 182, 0.28)',
  skyUltraLight: 'rgba(244, 114, 182, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#4f46e5',
  badgeSaleLight: '#e0e7ff',
  badgeSaleUltraLight: '#eef2ff',
  badgeSaleShadow: 'rgba(79, 70, 229, 0.30)',
  badgeSaleShadowLg: 'rgba(79, 70, 229, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#9d174d',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#831843',
  chipCategoryBg: '#fce7f3',
  chipFormText: '#9d174d',
  chipFormBg: '#fdf2f8',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1a0010',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 10 — Slate Steel  (corporate, neutral, clean)
// ─────────────────────────────────────────────────────────────────────────────
export const slateSteel = {
  // ── Primary  (slate-700) ─────────────────────────────────────────────────────
  primary: '#334155',
  primaryHover: '#1e293b',
  primaryGlow: 'rgba(51, 65, 85, 0.06)',
  primaryLight: 'rgba(51, 65, 85, 0.10)',
  primaryShadow: 'rgba(51, 65, 85, 0.28)',
  primaryShadowMd: 'rgba(51, 65, 85, 0.32)',
  primaryShadowLg: 'rgba(51, 65, 85, 0.45)',
  primaryBorder: 'rgba(51, 65, 85, 0.25)',
  primaryUltraLight: '#f8fafc',
  // ── Secondary  (slate-500) ───────────────────────────────────────────────────
  secondary: '#475569',
  secondaryHover: '#334155',
  secondaryLight: 'rgba(71, 85, 105, 0.10)',
  secondaryShadow: 'rgba(71, 85, 105, 0.28)',
  secondaryShadowMd: 'rgba(71, 85, 105, 0.32)',
  secondaryShadowLg: 'rgba(71, 85, 105, 0.45)',
  secondaryBorder: 'rgba(71, 85, 105, 0.25)',
  secondaryUltraLight: '#f1f5f9',
  // ── Navigation  (slate-900) ──────────────────────────────────────────────────
  nav: '#1e293b',
  navHover: '#334155',
  navShadow: 'rgba(30, 41, 59, 0.28)',
  navShadowLg: 'rgba(30, 41, 59, 0.45)',
  navFocusRing: 'rgba(30, 41, 59, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#475569',
  skyShadow: 'rgba(71, 85, 105, 0.28)',
  skyUltraLight: 'rgba(71, 85, 105, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#dc2626',
  badgeSaleLight: '#fee2e2',
  badgeSaleUltraLight: '#fff5f5',
  badgeSaleShadow: 'rgba(220, 38, 38, 0.30)',
  badgeSaleShadowLg: 'rgba(220, 38, 38, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0284c7',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#334155',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#1e293b',
  chipCategoryBg: '#e2e8f0',
  chipFormText: '#334155',
  chipFormBg: '#f1f5f9',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#0f172a',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 11 — Mint Frost  (fresh, health, wellness)
// ─────────────────────────────────────────────────────────────────────────────
export const mintFrost = {
  // ── Primary  (teal-700) ──────────────────────────────────────────────────────
  primary: '#0f766e',
  primaryHover: '#0d9488',
  primaryGlow: 'rgba(15, 118, 110, 0.06)',
  primaryLight: 'rgba(15, 118, 110, 0.10)',
  primaryShadow: 'rgba(15, 118, 110, 0.28)',
  primaryShadowMd: 'rgba(15, 118, 110, 0.32)',
  primaryShadowLg: 'rgba(15, 118, 110, 0.45)',
  primaryBorder: 'rgba(15, 118, 110, 0.25)',
  primaryUltraLight: '#f0fdfa',
  // ── Secondary  (cyan-400) ────────────────────────────────────────────────────
  secondary: '#22d3ee',
  secondaryHover: '#06b6d4',
  secondaryLight: 'rgba(34, 211, 238, 0.10)',
  secondaryShadow: 'rgba(34, 211, 238, 0.28)',
  secondaryShadowMd: 'rgba(34, 211, 238, 0.32)',
  secondaryShadowLg: 'rgba(34, 211, 238, 0.45)',
  secondaryBorder: 'rgba(34, 211, 238, 0.25)',
  secondaryUltraLight: '#ecfeff',
  // ── Navigation  (cyan-700) ───────────────────────────────────────────────────
  nav: '#0e7490',
  navHover: '#0891b2',
  navShadow: 'rgba(14, 116, 144, 0.28)',
  navShadowLg: 'rgba(14, 116, 144, 0.45)',
  navFocusRing: 'rgba(14, 116, 144, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#22d3ee',
  skyShadow: 'rgba(34, 211, 238, 0.28)',
  skyUltraLight: 'rgba(34, 211, 238, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#e11d48',
  badgeSaleLight: '#ffe4e6',
  badgeSaleUltraLight: '#fff1f2',
  badgeSaleShadow: 'rgba(225, 29, 72, 0.30)',
  badgeSaleShadowLg: 'rgba(225, 29, 72, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#4f46e5',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#0f766e',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#064e3b',
  chipCategoryBg: '#d1fae5',
  chipFormText: '#155e75',
  chipFormBg: '#cffafe',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#0f766e',
  inStockBg: 'rgba(15, 118, 110, 0.10)',
  inStockBorder: 'rgba(15, 118, 110, 0.25)',
  outOfStock: '#dc2626',
  outOfStockBg: 'rgba(239, 68, 68, 0.10)',
  outOfStockBorder: 'rgba(239, 68, 68, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#042f2e',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 12 — Crimson Noir  (bold, dramatic, premium)
// ─────────────────────────────────────────────────────────────────────────────
export const crimsonNoir = {
  // ── Primary  (red-800) ───────────────────────────────────────────────────────
  primary: '#991b1b',
  primaryHover: '#7f1d1d',
  primaryGlow: 'rgba(153, 27, 27, 0.06)',
  primaryLight: 'rgba(153, 27, 27, 0.10)',
  primaryShadow: 'rgba(153, 27, 27, 0.28)',
  primaryShadowMd: 'rgba(153, 27, 27, 0.32)',
  primaryShadowLg: 'rgba(153, 27, 27, 0.45)',
  primaryBorder: 'rgba(153, 27, 27, 0.25)',
  primaryUltraLight: '#fef2f2',
  // ── Secondary  (red-700) ─────────────────────────────────────────────────────
  secondary: '#b91c1c',
  secondaryHover: '#991b1b',
  secondaryLight: 'rgba(185, 28, 28, 0.10)',
  secondaryShadow: 'rgba(185, 28, 28, 0.28)',
  secondaryShadowMd: 'rgba(185, 28, 28, 0.32)',
  secondaryShadowLg: 'rgba(185, 28, 28, 0.45)',
  secondaryBorder: 'rgba(185, 28, 28, 0.25)',
  secondaryUltraLight: '#fee2e2',
  // ── Navigation  (red-950) ────────────────────────────────────────────────────
  nav: '#7f1d1d',
  navHover: '#991b1b',
  navShadow: 'rgba(127, 29, 29, 0.28)',
  navShadowLg: 'rgba(127, 29, 29, 0.45)',
  navFocusRing: 'rgba(127, 29, 29, 0.25)',
  // ── Sky / Info ───────────────────────────────────────────────────────────────
  sky: '#ef4444',
  skyShadow: 'rgba(239, 68, 68, 0.28)',
  skyUltraLight: 'rgba(239, 68, 68, 0.10)',
  // ── Sale badge ───────────────────────────────────────────────────────────────
  badgeSale: '#4338ca',
  badgeSaleLight: '#e0e7ff',
  badgeSaleUltraLight: '#eef2ff',
  badgeSaleShadow: 'rgba(67, 56, 202, 0.30)',
  badgeSaleShadowLg: 'rgba(67, 56, 202, 0.60)',
  // ── Semantic status badges ───────────────────────────────────────────────────
  badgeFeatured: '#0d9488',
  badgeBestseller: '#d97706',
  badgeBestsellerHover: '#b45309',
  badgeBestsellerShadow: 'rgba(217, 119, 6, 0.30)',
  badgeNew: '#991b1b',
  // ── Category & Form chips ────────────────────────────────────────────────────
  chipCategoryText: '#7f1d1d',
  chipCategoryBg: '#fee2e2',
  chipFormText: '#991b1b',
  chipFormBg: '#fecaca',
  // ── Stock status ─────────────────────────────────────────────────────────────
  inStock: '#059669',
  inStockBg: 'rgba(16, 185, 129, 0.10)',
  inStockBorder: 'rgba(16, 185, 129, 0.25)',
  outOfStock: '#92400e',
  outOfStockBg: 'rgba(146, 64, 14, 0.10)',
  outOfStockBorder: 'rgba(146, 64, 14, 0.20)',
  // ── Base ─────────────────────────────────────────────────────────────────────
  text: '#1a0000',
  background: '#fff',
};


// ─────────────────────────────────────────────────────────────────────────────
// THEME 13 — Crimson Noir  (bold, dramatic, premium)
// ─────────────────────────────────────────────────────────────────────────────

export const goldenGilded = {
  // ── Primary (Gold-600) ─── buttons, CTAs, active states ────────────────
  primary: '#d4af37',               // Classic Metallic Gold
  primaryHover: '#b8860b',          // Dark Goldenrod
  primaryGlow: 'rgba(212, 175, 55, 0.08)',
  primaryLight: 'rgba(212, 175, 55, 0.12)',  // Light gold tint for badges
  primaryShadow: 'rgba(184, 134, 11, 0.25)', // Bronze-tinted shadow
  primaryShadowMd: 'rgba(184, 134, 11, 0.35)',
  primaryShadowLg: 'rgba(184, 134, 11, 0.50)',
  primaryBorder: 'rgba(212, 175, 55, 0.30)',
  primaryUltraLight: '#fffcf2',     // Champagne/Cream background wash

  // ── Secondary (Deep Bronze) ─── featured products, accents ──────────────
  secondary: '#78350f',             // Rich Burnt Amber
  secondaryHover: '#451a03',
  secondaryLight: 'rgba(120, 53, 15, 0.10)',
  secondaryShadow: 'rgba(120, 53, 15, 0.20)',

  // ── Navigation ────────────────────────────────────────────────────────────
  nav: '#1c1917',                   // Dark Stone (nearly black) for high contrast
  navHover: '#d4af37',              // Gold on hover
  navShadow: 'rgba(0, 0, 0, 0.15)',
  navFocusRing: 'rgba(212, 175, 55, 0.40)',

  // ── Semantic Badges ───────────────────────────────────────────────────────
  badgeSale: '#b45309',             // Deep Amber
  badgeSaleLight: '#fef3c7',        // Soft Gold
  badgeSaleUltraLight: '#fffbeb',

  badgeFeatured: '#1c1917',         // Black/Gold combination is peak luxury
  badgeNew: '#d4af37',

  // ── Category & Form Chips ─────────────────────────────────────────────────
  chipCategoryText: '#92400e',
  chipCategoryBg: '#fef3c7',
  chipFormText: '#451a03',
  chipFormBg: '#fff7ed',

  // ── Stock status ──────────────────────────────────────────────────────────
  inStock: '#15803d',
  inStockBg: 'rgba(21, 128, 61, 0.10)',
  outOfStock: '#991b1b',

  // ── Base text & background ────────────────────────────────────────────────
  text: '#1c1917',                  // Warm Black
  background: '#ffffff',            // Crisp White
};




// ─────────────────────────────────────────────────────────────────────────────
//  THEME REGISTRY
// ─────────────────────────────────────────────────────────────────────────────
export const THEMES = {
  "Default": defaultTheme,
  "Midnight Orchid": midnightOrchid,
  "Ocean Teal": oceanTeal,
  "Violet Dusk": violetDusk,
  "Ember Rose": emberRose,
  "Forest Sage": forestSage,
  "Solar Amber": solarAmber,
  "Midnight Indigo": midnightIndigo,
  "Coral Blaze": coralBlaze,
  "Sky Breeze": skyBreeze,
  "Plum Luxe": plumLuxe,
  "Slate Steel": slateSteel,
  "Mint Frost": mintFrost,
  "Crimson Noir": crimsonNoir,
  "Golden Gilded": goldenGilded,
};

// ─────────────────────────────────────────────────────────────────────────────
//  Inject every token as a CSS custom property on :root
// ─────────────────────────────────────────────────────────────────────────────
const injectCSSVars = (themeColors) => {
  if (typeof document === 'undefined') return;
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

  // Sync data attribute for secondary CSS targeting
  document.documentElement.setAttribute('data-theme', themeColors.name || 'custom');
};

const ThemeWrapper = ({ children }) => {
  const [activeThemeName, setActiveThemeName] = React.useState(() => {
    return localStorage.getItem('app_theme') || 'Default';
  });

  React.useEffect(() => {
    // Sync with database on mount
    const syncWithDB = async () => {
      try {
        const settings = await getAppSettings();
        if (settings && settings.app_theme && settings.app_theme !== activeThemeName) {
          localStorage.setItem('app_theme', settings.app_theme);
          setActiveThemeName(settings.app_theme);
        }
      } catch (error) {
        console.warn('Backend settings unavailable or not yet initialized.');
      }
    };
    syncWithDB();

    // 1. Local window update (for the same tab)
    // 1. Local window update (for the same tab)
    const handleThemeChange = () => {
      const newTheme = localStorage.getItem('app_theme') || 'Default';
      setActiveThemeName(newTheme);
    };

    window.addEventListener('themeChanged', handleThemeChange);

    // 2. Cross-tab/window update (standard storage event)
    // Edge and Chrome handle storage events across all tabs of the same origin.
    const handleStorageChange = (e) => {
      if (e.key === 'app_theme') {
        handleThemeChange();
      }
    };
    
    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('themeChanged', handleThemeChange);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const themeColors = THEMES[activeThemeName] || defaultTheme;

  // Update CSS Vars
  React.useLayoutEffect(() => {
    injectCSSVars(themeColors);
  }, [themeColors]);

  // Create MUI theme
  const muiTheme = React.useMemo(() => createTheme({
    palette: {
      primary: { main: themeColors.primary },
      secondary: { main: themeColors.secondary },
      text: { primary: themeColors.text },
      background: { default: themeColors.background, paper: themeColors.background },
    },
    typography: {
      fontFamily: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    },
  }), [themeColors]);

  return (
    <ThemeProvider theme={muiTheme}>
      {children}
    </ThemeProvider>
  );
};

export default ThemeWrapper;
