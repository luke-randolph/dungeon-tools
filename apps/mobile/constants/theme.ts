import { Platform } from "react-native";

const primaryColorLight = "#1e5e5e";
const primaryColorDark = "#fff";
const destructiveLight = "#8b1a1a";
const destructiveDark = "#cc4444";

export const Colors = {
  light: {
    text: "#1a1410",
    background: "#e8d8b0",
    surface: "#392c22",
    surfaceText: "#f0e4c8",
    accent: "#fbbf24",
    primary: primaryColorLight,
    destructive: destructiveLight,
    secondary: "#4a4a4a",
    border: "#b8a778",
    placeholder: "#8a7a5a",
    icon: "#5d4e37",
    tabIconDefault: "#5d4e37",
    tabIconSelected: primaryColorLight,
    goblinGreen: "#23b04d",
  },
  dark: {
    text: "#ECEDEE",
    background: "#151718",
    surface: "#392c25",
    surfaceText: "#e8d8b0",
    accent: "#fbbf24",
    primary: primaryColorDark,
    destructive: destructiveDark,
    secondary: "#444",
    border: "#444",
    placeholder: "#666",
    icon: "#9BA1A6",
    tabIconDefault: "#9BA1A6",
    tabIconSelected: primaryColorDark,
    goblinGreen: "#23b04d",
  },
};

export const Fonts = Platform.select({
  ios: {
    sans: "system-ui",
    serif: "ui-serif",
    rounded: "ui-rounded",
    mono: "ui-monospace",
  },
  default: {
    sans: "normal",
    serif: "serif",
    rounded: "normal",
    mono: "monospace",
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded:
      "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
