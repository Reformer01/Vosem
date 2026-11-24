// Static structured data only; props are built from trusted site content, never user input.
// Raw markup keeps the script in the initial HTML (React hoists <script> into RSC otherwise).
export default function JsonLd({ data }: { data: Record<string, unknown> | Record<string, unknown>[] }) {
  const json = JSON.stringify(data).replace(/</g, "\\u003c");
  return <div dangerouslySetInnerHTML={{ __html: `<script type="application/ld+json">${json}</script>` }} />;
}
