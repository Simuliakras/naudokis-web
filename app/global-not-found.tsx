import NotFound, { metadata } from "./not-found";

export { metadata };

export default function GlobalNotFound() {
  return (
    // suppressHydrationWarning: the page's parse-time language script (not-found.tsx)
    // retargets `lang` and stamps data-nf-en on this element under /en/*, so the
    // hydrating markup deliberately does not match what the browser already has.
    <html lang="lt" suppressHydrationWarning>
      <body>
        <NotFound />
      </body>
    </html>
  );
}
