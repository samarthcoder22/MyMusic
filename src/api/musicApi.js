const BASE_URL = "https://itunes.apple.com/search";

export async function searchSongs(query) {
  const params = new URLSearchParams({
    term: query,
    country: "us",
    media: "music",
    entity: "song",
    limit: "12",
  });

  const response = await fetch(
    `${BASE_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Music search failed");
  }

  const data = await response.json();

  return data.results;
}

// GET NEW / POPULAR MUSIC
export async function getNewReleases() {
  const params = new URLSearchParams({
    term: "music",
    country: "us",
    media: "music",
    entity: "song",
    limit: "20",
    sort: "recent",
  });

  const response = await fetch(
    `${BASE_URL}?${params.toString()}`
  );

  if (!response.ok) {
    throw new Error("Failed to load new releases");
  }

  const data = await response.json();

  return data.results || [];
}