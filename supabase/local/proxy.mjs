/**
 * Tiny reverse proxy so @supabase/supabase-js can talk to plain PostgREST.
 *
 * The Supabase client prefixes every database call with /rest/v1, which is
 * Supabase's gateway convention; PostgREST serves those same routes at the
 * root. This strips the prefix and forwards. Nothing else is rewritten, so
 * what reaches Postgres is exactly what the app would send in production.
 *
 * Local development only. No dependencies — node's http module.
 *
 *   node supabase/local/proxy.mjs
 *
 * Listens on 3001 (what .env.local points at), forwards to PostgREST on 3002.
 */
import http from "node:http";

const LISTEN = Number(process.env.PROXY_PORT ?? 3001);
const TARGET = Number(process.env.POSTGREST_PORT ?? 3002);

const server = http.createServer((req, res) => {
  const path = req.url.replace(/^\/rest\/v1/, "") || "/";

  // The Supabase client always sends the service-role key as a bearer token.
  // PostgREST does not ignore it when jwt-secret is unset — it fails the
  // request with PGRST300 "Server lacks JWT secret". Dropping the auth
  // headers here lets every request fall through to db-anon-role, which is
  // the BYPASSRLS role standing in for Supabase's service role. The
  // alternative is signing real JWTs locally, which buys nothing: this proxy
  // is bound to 127.0.0.1 and fronts a throwaway database.
  const headers = { ...req.headers };
  delete headers.authorization;
  delete headers.apikey;

  const upstream = http.request(
    { host: "127.0.0.1", port: TARGET, path, method: req.method, headers },
    (up) => {
      res.writeHead(up.statusCode ?? 502, up.headers);
      up.pipe(res);
    },
  );

  upstream.on("error", (err) => {
    // Surface the cause rather than a bare socket hang-up, so a stopped
    // PostgREST does not look like an application bug.
    res.writeHead(502, { "Content-Type": "application/json" });
    res.end(
      JSON.stringify({
        message: `local proxy could not reach PostgREST on :${TARGET} — ${err.message}`,
      }),
    );
  });

  req.pipe(upstream);
});

server.listen(LISTEN, "127.0.0.1", () => {
  console.log(`proxy :${LISTEN}/rest/v1/* -> PostgREST :${TARGET}/*`);
});
