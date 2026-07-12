import { Archivo } from "next/font/google";

// One shared next/font instance for every route, including the standalone global
// 404. Separate calls generate separate font assets and make normal pages preload
// fonts used only by the error route.
export const brandFont = Archivo({
  variable: "--font-archivo",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
});
