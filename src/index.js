const CACHE_TTL = 3600; // 1 hour

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    if (url.pathname === '/api/commits') {
      const cache = caches.default;
      const cached = await cache.match(request);
      if (cached) return cached;

      const response = await fetchCommits(env);
      ctx.waitUntil(cache.put(request, response.clone()));
      return response;
    }

    return env.ASSETS.fetch(request);
  },
};

async function fetchCommits(env) {
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Cache-Control': `public, max-age=${CACHE_TTL}`,
  };

  try {
    const now = new Date();
    const from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const to   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59).toISOString();

    const query = `query {
      user(login: "sandeval") {
        contributionsCollection(from: "${from}", to: "${to}") {
          totalCommitContributions
        }
      }
    }`;

    const res = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${env.GITHUB_TOKEN}`,
        'Content-Type': 'application/json',
        'User-Agent': 'sandeval-portfolio',
      },
      body: JSON.stringify({ query }),
    });

    const { data } = await res.json();
    const count = data.user.contributionsCollection.totalCommitContributions;
    const month = now.toLocaleString('en', { month: 'short' }) + " '" + String(now.getFullYear()).slice(2);

    return new Response(JSON.stringify({ count, month }), { headers });
  } catch (e) {
    return new Response(JSON.stringify({ error: 'unavailable' }), { status: 500, headers });
  }
}
