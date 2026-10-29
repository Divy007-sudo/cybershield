import { createFileRoute } from "@tanstack/react-router";

// Fallback proxy: streams the public UNSW-NB15 training CSV if the browser cannot fetch it directly.
// Read-only, fixed URL — no user input is forwarded.
const SOURCE = "https://huggingface.co/datasets/Mouwiya/UNSW-NB15/resolve/main/UNSW_NB15_training-set.csv";

export const Route = createFileRoute("/api/public/dataset")({
  server: {
    handlers: {
      GET: async () => {
        const upstream = await fetch(SOURCE);
        if (!upstream.ok || !upstream.body) {
          return new Response(`Upstream error ${upstream.status}`, { status: 502 });
        }
        return new Response(upstream.body, {
          headers: { "content-type": "text/csv; charset=utf-8", "cache-control": "public, max-age=3600" },
        });
      },
    },
  },
});
