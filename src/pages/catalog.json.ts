import type { APIRoute } from "astro";
import { catalog } from "../lib/catalog";

export const prerender = true;

export const GET: APIRoute = () => {
  const body = {
    ...catalog,
    license: {
      editorial: "https://creativecommons.org/licenses/by/4.0/",
      metadata: "https://creativecommons.org/publicdomain/zero/1.0/",
      note: "These licenses cover this catalog's original work, not content on linked websites.",
    },
  };

  return new Response(`${JSON.stringify(body, null, 2)}\n`, {
    headers: { "Content-Type": "application/json; charset=utf-8" },
  });
};
