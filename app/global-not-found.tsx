import NotFound, { metadata } from "./not-found";

export { metadata };

export default function GlobalNotFound() {
  return (
    <html lang="lt">
      <body>
        <NotFound />
      </body>
    </html>
  );
}
