/** Renders a JSON-LD `<script>` tag. `data` must always be a static,
 * developer-authored object (never raw user input) — same safety
 * justification as the Organization/WebSite JSON-LD in [locale]/layout.tsx. */
export function JsonLd({ data }: { data: object }) {
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }} />;
}
