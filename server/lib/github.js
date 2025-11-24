import axios from "axios";

export async function fetchProfile(username) {
  const r = await axios.get(
    `https://api.github.com/users/${encodeURIComponent(username)}`
  );
  return r.data;
}

export async function fetchTopRepos(username, limit = 5) {
  const r = await axios.get(
    `https://api.github.com/users/${encodeURIComponent(
      username
    )}/repos?per_page=100`
  );
  const repos = r.data
    .filter((x) => !x.fork)
    .sort((a, b) => (b.stargazers_count || 0) - (a.stargazers_count || 0))
    .slice(0, limit)
    .map((repo) => ({
      name: repo.name,
      description: repo.description,
      stars: repo.stargazers_count,
      language: repo.language,
      url: repo.html_url,
    }));
  return repos;
}
