import { motion } from "framer-motion";
import {
  HiHeart,
  HiMusicalNote,
  HiPlay,
  HiUserGroup,
} from "react-icons/hi2";

const communityPosts = [
  {
    id: 1,
    name: "Maya",
    avatar: "M",
    mood: "🌧 Rainy Evening",
    song: "After Dark",
    artist: "Eredaze",
    likes: "1.2K",
    message: "This song feels like walking home alone in the rain.",
  },
  {
    id: 2,
    name: "Aarav",
    avatar: "A",
    mood: "🌙 Midnight",
    song: "Summertime Sadness",
    artist: "Lana Del Rey",
    likes: "846",
    message: "Perfect soundtrack for a late-night drive.",
  },
  {
    id: 3,
    name: "Sofia",
    avatar: "S",
    mood: "❤️ Love",
    song: "Easy On Me",
    artist: "Adele",
    likes: "2.1K",
    message: "Some songs don't need an explanation.",
  },
];

function Community() {
  return (
    <section className="relative overflow-hidden py-28 lg:py-36">

      {/* Background */}

      <div className="pointer-events-none absolute inset-0">

        <div className="absolute left-[-180px] top-1/3 h-[450px] w-[450px] rounded-full bg-violet-600/10 blur-[170px]" />

        <div className="absolute right-[-180px] top-20 h-[450px] w-[450px] rounded-full bg-fuchsia-600/10 blur-[170px]" />

      </div>

      <div className="relative mx-auto max-w-[1450px] px-8 lg:px-12">

        {/* Header */}

        <motion.div
          initial={{ opacity: 0, y: 35 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-3xl text-center"
        >

          <span className="inline-flex items-center gap-2 rounded-full border border-violet-500/30 bg-violet-500/10 px-5 py-2 text-sm font-medium text-violet-400">
            <HiUserGroup />
            VerseHana Community
          </span>

          <h2 className="mt-8 text-5xl font-bold leading-tight text-[var(--text-primary)] lg:text-6xl">
            Music feels better
            <span className="block bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
              together.
            </span>
          </h2>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-400">
            Share what you're listening to, discover what others are feeling,
            and find your next favorite song through the community.
          </p>

        </motion.div>

        {/* Community Content */}

        <div className="mt-16 grid gap-8 lg:grid-cols-[0.85fr_1.15fr]">

          {/* LEFT — Community CTA */}

          <motion.div
            initial={{ opacity: 0, x: -40 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-[32px] border border-white/10 bg-white/5 p-8 backdrop-blur-2xl lg:p-10"
          >

            {/* Glow */}

            <div className="absolute -right-20 -top-20 h-64 w-64 rounded-full bg-violet-600/20 blur-[100px]" />

            <div className="relative z-10">

              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-violet-500/10 text-2xl text-violet-400">
                <HiMusicalNote />
              </div>

              <h3 className="mt-8 text-3xl font-bold text-[var(--text-primary)]">
                What's your mood today?
              </h3>

              <p className="mt-4 leading-7 text-gray-400">
                Tell the community what you're feeling and discover songs
                from people who are feeling the same way.
              </p>

              {/* Mood Buttons */}

              <div className="mt-8 flex flex-wrap gap-3">

                {[
                  "🌙 Midnight",
                  "🌧 Rain",
                  "❤️ Love",
                  "😌 Calm",
                  "💪 Focus",
                  "🎉 Party",
                ].map((mood) => (
                  <button
                    key={mood}
                    className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-gray-300 transition hover:border-violet-500/50 hover:bg-violet-500/10 hover:text-white"
                  >
                    {mood}
                  </button>
                ))}

              </div>

              <button className="mt-10 rounded-full bg-gradient-to-r from-violet-600 to-fuchsia-600 px-7 py-3.5 font-semibold text-white transition hover:scale-105 hover:shadow-lg hover:shadow-violet-500/20">
                Share Your Mood
              </button>

            </div>

          </motion.div>

          {/* RIGHT — Community Posts */}

          <div className="space-y-4">

            {communityPosts.map((post, index) => (

              <motion.div
                key={post.id}
                initial={{ opacity: 0, x: 40 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.1,
                }}
                className="group rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-xl transition duration-300 hover:border-violet-500/20"
              >

                <div className="flex gap-4">

                  {/* Avatar */}

                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white">
                    {post.avatar}
                  </div>

                  {/* Content */}

                  <div className="min-w-0 flex-1">

                    <div className="flex flex-wrap items-center justify-between gap-2">

                      <div>

                        <h4 className="font-semibold text-[var(--text-primary)]">
                          {post.name}
                        </h4>

                        <p className="text-xs text-gray-500">
                          feeling {post.mood}
                        </p>

                      </div>

                      <span className="text-xs text-gray-600">
                        #{index + 1}
                      </span>

                    </div>

                    {/* Message */}

                    <p className="mt-4 text-sm leading-6 text-gray-400">
                      {post.message}
                    </p>

                    {/* Song */}

                    <div className="mt-5 flex items-center justify-between rounded-2xl border border-white/10 bg-black/20 p-3">

                      <div className="flex min-w-0 items-center gap-3">

                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400">
                          <HiMusicalNote />
                        </div>

                        <div className="min-w-0">

                          <p className="truncate text-sm font-semibold text-[var(--text-primary)]">
                            {post.song}
                          </p>

                          <p className="truncate text-xs text-gray-500">
                            {post.artist}
                          </p>

                        </div>

                      </div>

                      <button className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition hover:bg-violet-500">
                        <HiPlay className="ml-0.5" />
                      </button>

                    </div>

                    {/* Actions */}

                    <div className="mt-4 flex items-center gap-5 text-xs text-gray-500">

                      <button className="flex items-center gap-1.5 transition hover:text-pink-400">
                        <HiHeart />
                        {post.likes}
                      </button>

                      <button className="transition hover:text-white">
                        Share
                      </button>

                    </div>

                  </div>

                </div>

              </motion.div>

            ))}

          </div>

        </div>

      </div>

    </section>
  );
}

export default Community;