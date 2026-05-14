export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname !== '/api/commits') {
      return env.ASSETS.fetch(request);
    }

    const now = new Date();
    const to = now.toISOString();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const from28 = new Date(now - 29 * 24 * 60 * 60 * 1000).toISOString();

    const ghHeaders = {
      'Authorization': `bearer ${env.GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
      'User-Agent': 'sandeval-blog'
    };

    const query = `{
      viewer {
        month: contributionsCollection(from: "${monthStart}", to: "${to}") {
          totalCommitContributions
        }
        grid: contributionsCollection(from: "${from28}", to: "${to}") {
          contributionCalendar {
            weeks {
              contributionDays {
                contributionCount
              }
            }
          }
        }
      }
    }`;

    const ghRes = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: ghHeaders,
      body: JSON.stringify({ query })
    });

    const { data } = await ghRes.json();
    const count = data?.viewer?.month?.totalCommitContributions ?? 0;

    const days = (data?.viewer?.grid?.contributionCalendar?.weeks ?? [])
      .flatMap(w => w.contributionDays)
      .map(d => d.contributionCount)
      .slice(-28);

    // Pad to 28 if needed
    while (days.length < 28) days.unshift(0);

    const max = Math.max(...days, 1);
    const grid = days.map(v => v === 0 ? 0 : Math.ceil((v / max) * 4));

    return new Response(JSON.stringify({ count, grid }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
};
