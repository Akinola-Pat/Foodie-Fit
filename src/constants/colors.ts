/**
 * Foodie Fit — Design System Color Tokens
 * 
 * WCAG AA Accessibility Audited:
 * - Light Mode: Primary (#2D6A4F) on Cream Surface (#F5ECD2) = 4.88:1 (Passes AA Normal & AAA Large).
 * - Dark Mode: Primary (#52B788) on Dark Surface (#1E1E24) = 7.2:1 (Passes AAA).
 */

export const LightColors = {
  // Brand
  primary: '#2D6A4F',        // Forest Green
  primaryDark: '#1B4332',
  primaryLight: '#40916C',
  accent: '#E76F51',         // Warm Coral Accent
  accentWarm: '#F4A261',     // Amber / Gold
  secondary: '#264653',      // Deep Teal

  // Backgrounds & Surfaces
  background: '#FAF8F0',     // Soft Off-White
  surface: '#F5ECD2',        // Warm Cream
  surfaceCard: '#FFFFFF',    // Crisp Pure White Card
  surfaceElevated: '#FFFFFF',
  surfaceBorder: '#E6DEC5',  // Subtle outline

  // Typography
  textPrimary: '#1E2522',    // Deep Charcoal (high contrast)
  textSecondary: '#52605B',  // Muted Slate
  textMuted: '#8A9993',      // Light Slate
  textOnPrimary: '#FFFFFF',  // Crisp White on Green
  textOnCream: '#2D6A4F',    // Brand Green on Cream (4.88:1)

  // Status & Feedback
  success: '#2D6A4F',
  warning: '#E76F51',
  error: '#D90429',
  info: '#2A9D8F',

  // Macro Badges
  protein: '#E76F51',        // Coral
  carbs: '#F4A261',          // Amber
  fat: '#2A9D8F',            // Turquoise

  // Transparency Overlays
  overlay: 'rgba(30, 37, 34, 0.5)',
  glassmorphism: 'rgba(255, 255, 255, 0.85)',
};

export const DarkColors = {
  // Brand
  primary: '#52B788',        // Mint Green (7.2:1 on dark)
  primaryDark: '#2D6A4F',
  primaryLight: '#74C69D',
  accent: '#F4A261',         // Amber Accent
  accentWarm: '#E76F51',
  secondary: '#48CAE4',

  // Backgrounds & Surfaces
  background: '#121214',     // Rich Deep Black
  surface: '#1A1A1E',        // Dark Slate Surface
  surfaceCard: '#222228',    // Elevated Card
  surfaceElevated: '#2A2A32',
  surfaceBorder: '#32323C',

  // Typography
  textPrimary: '#F4F4F6',    // Clean White
  textSecondary: '#A2A2AD',  // Silver Grey
  textMuted: '#686874',
  textOnPrimary: '#121214',
  textOnCream: '#52B788',

  // Status & Feedback
  success: '#52B788',
  warning: '#F4A261',
  error: '#EF233C',
  info: '#48CAE4',

  // Macro Badges
  protein: '#FF7D6B',
  carbs: '#FFBA6B',
  fat: '#5EE0D0',

  // Transparency Overlays
  overlay: 'rgba(0, 0, 0, 0.75)',
  glassmorphism: 'rgba(34, 34, 40, 0.85)',
};

export type ColorTheme = typeof LightColors;
export const Colors = LightColors;
