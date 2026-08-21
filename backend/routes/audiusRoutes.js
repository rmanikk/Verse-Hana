import express from "express";

const router = express.Router();

const AUDIUS_API_URL = "https://api.audius.co/v1";

// =====================================================
// VERSEHANA MOOD MAPPING
// =====================================================

const moodMapping = {
  happy: {
    audiusMood: "happy",
    searchTerms: ["upbeat", "happy", "feel good"],
  },

  calm: {
    audiusMood: "chill",
    searchTerms: ["calm", "chill", "relaxing"],
  },

  rain: {
    audiusMood: "sad",
    searchTerms: ["rain", "rainy", "melancholic", "chill"],
  },

  night: {
    audiusMood: "night",
    searchTerms: ["night", "late night", "atmospheric"],
  },

  love: {
    audiusMood: "romantic",
    searchTerms: ["love", "romantic", "love song"],
  },

  focus: {
    audiusMood: "relaxed",
    searchTerms: ["focus", "study", "instrumental", "ambient"],
  },

  party: {
    audiusMood: "energetic",
    searchTerms: ["party", "dance", "energetic", "upbeat"],
  },

  sad: {
    audiusMood: "sad",
    searchTerms: ["sad", "melancholic", "emotional"],
  },
};

// =====================================================
// HELPER — FETCH FROM AUDIUS
// =====================================================

async function fetchAudius(endpoint) {
  const response = await fetch(
    `${AUDIUS_API_URL}${endpoint}`,
    {
      headers: {
        "x-api-key": process.env.AUDIUS_API_KEY,
      },
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data?.message || "Audius API request failed."
    );
  }

  return data;
}

// =====================================================
// GET TRENDING MUSIC
// GET /api/music/trending
// =====================================================

router.get("/trending", async (req, res) => {
  try {
    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    const data = await fetchAudius(
      `/tracks/trending?limit=${limit}`
    );

    return res.status(200).json({
      message: "Audius tracks fetched successfully.",
      tracks: data.data || [],
    });
  } catch (error) {
    console.error("Audius trending error:", error);

    return res.status(500).json({
      message: "Failed to fetch trending music.",
    });
  }
});

// =====================================================
// GET MUSIC BY VERSEHANA MOOD
// GET /api/music/mood/:mood
// =====================================================

router.get("/mood/:mood", async (req, res) => {
  try {
    const mood = req.params.mood.toLowerCase();

    // Check if VerseHana supports this mood
    const moodConfig = moodMapping[mood];

    if (!moodConfig) {
      return res.status(400).json({
        message: "Invalid VerseHana mood.",
        availableMoods: Object.keys(moodMapping),
      });
    }

    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    // First try Audius' own mood filtering
    const params = new URLSearchParams({
      mood: moodConfig.audiusMood,
      limit: String(limit),
      sort_method: "popular",
    });

    const data = await fetchAudius(
      `/tracks/search?${params.toString()}`
    );

    let tracks = data.data || [];

    // =================================================
    // FALLBACK SEARCH
    // =================================================

    // Some VerseHana moods may not have enough
    // matching Audius mood results.
    if (tracks.length < 5) {
      const fallbackResults = [];

      for (const searchTerm of moodConfig.searchTerms) {
        const searchParams = new URLSearchParams({
          query: searchTerm,
          limit: "10",
          sort_method: "popular",
        });

        const fallbackData = await fetchAudius(
          `/tracks/search?${searchParams.toString()}`
        );

        if (fallbackData.data) {
          fallbackResults.push(...fallbackData.data);
        }

        // Stop making requests once we have enough songs
        if (fallbackResults.length >= limit) {
          break;
        }
      }

      // Remove duplicate tracks
      const uniqueTracks = [
        ...new Map(
          fallbackResults.map((track) => [
            track.id,
            track,
          ])
        ).values(),
      ];

      tracks = uniqueTracks.slice(0, limit);
    }

    return res.status(200).json({
      message: "Mood-based music fetched successfully.",
      mood,
      audiusMood: moodConfig.audiusMood,
      tracks,
    });
  } catch (error) {
    console.error("Audius mood error:", error);

    return res.status(500).json({
      message: "Failed to fetch mood-based music.",
    });
  }
});

// =====================================================
// SEARCH MUSIC
// GET /api/music/search?q=...
// =====================================================

router.get("/search", async (req, res) => {
  try {
    const query = req.query.q?.trim();

    if (!query) {
      return res.status(400).json({
        message: "Search query is required.",
      });
    }

    const limit = Math.min(
      Number(req.query.limit) || 10,
      100
    );

    const params = new URLSearchParams({
      query,
      limit: String(limit),
      sort_method: "relevant",
    });

    const data = await fetchAudius(
      `/tracks/search?${params.toString()}`
    );

    return res.status(200).json({
      message: "Music search successful.",
      query,
      tracks: data.data || [],
    });
  } catch (error) {
    console.error("Audius search error:", error);

    return res.status(500).json({
      message: "Failed to search music.",
    });
  }
});
// =====================================================
// GENRE MAPPING
// =====================================================

const genreMapping = {
  electronic: {
    searchTerms: [
      "electronic",
      "edm",
      "electro",
    ],
  },

  hiphop: {
    searchTerms: [
      "hip hop",
      "hiphop",
      "rap",
    ],
  },

  pop: {
    searchTerms: [
      "pop",
      "pop music",
    ],
  },

  rock: {
    searchTerms: [
      "rock",
      "alternative rock",
    ],
  },

  rnb: {
    searchTerms: [
      "rnb",
      "r&b",
      "soul",
    ],
  },

  jazz: {
    searchTerms: [
      "jazz",
      "smooth jazz",
    ],
  },

  classical: {
    searchTerms: [
      "classical",
      "orchestra",
      "piano",
    ],
  },

  lofi: {
    searchTerms: [
      "lofi",
      "lo-fi",
      "lofi beats",
    ],
  },

  metal: {
    searchTerms: [
      "metal",
      "heavy metal",
    ],
  },

  indie: {
    searchTerms: [
      "indie",
      "indie music",
    ],
  },
};

// =====================================================
// GET MUSIC BY GENRE
// GET /api/music/genre/:genre
// =====================================================

router.get("/genre/:genre", async (req, res) => {
  try {
    const genre = req.params.genre.toLowerCase();

    const genreConfig = genreMapping[genre];

    if (!genreConfig) {
      return res.status(400).json({
        message: "Invalid genre.",
        availableGenres: Object.keys(genreMapping),
      });
    }

    const limit = Math.min(
      Number(req.query.limit) || 20,
      100
    );

    const tracks = [];

    // =================================================
    // SEARCH AUDIUS USING GENRE TERMS
    // =================================================

    for (const searchTerm of genreConfig.searchTerms) {
      const params = new URLSearchParams({
        query: searchTerm,
        limit: String(limit),
        sort_method: "popular",
      });

      const data = await fetchAudius(
        `/tracks/search?${params.toString()}`
      );

      if (data.data) {
        tracks.push(...data.data);
      }

      // Stop once we have enough songs
      if (tracks.length >= limit) {
        break;
      }
    }

    // =================================================
    // REMOVE DUPLICATES
    // =================================================

    const uniqueTracks = [
      ...new Map(
        tracks.map((track) => [
          track.id,
          track,
        ])
      ).values(),
    ];

    return res.status(200).json({
      message: "Genre music fetched successfully.",
      genre,
      tracks: uniqueTracks.slice(0, limit),
    });
  } catch (error) {
    console.error(
      "Audius genre error:",
      error
    );

    return res.status(500).json({
      message: "Failed to fetch genre music.",
    });
  }
});

export default router;