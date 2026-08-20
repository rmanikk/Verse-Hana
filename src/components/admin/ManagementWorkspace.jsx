import { useCallback, useEffect, useState } from "react";
import {
  HiArrowPath,
  HiCheckCircle,
  HiExclamationTriangle,
  HiMagnifyingGlass,
  HiPencilSquare,
  HiPlus,
  HiTrash,
  HiXMark,
} from "react-icons/hi2";

const API = "http://localhost:5000/api/admin";

const config = {
  users: {
    label: "Users",
    singular: "user",
    blank: {
      name: "",
      email: "",
      password: "",
      role: "user",
      status: "active",
    },
  },

  artists: {
    label: "Artists",
    singular: "artist",
    blank: {
      name: "",
      country: "",
      imageUrl: "",
      bio: "",
      isFeatured: false,
    },
  },

  moods: {
    label: "Moods",
    singular: "mood",
    blank: {
      name: "",
      slug: "",
      emoji: "🎵",
      description: "",
      color: "#8b5cf6",
      isActive: true,
    },
  },

  songs: {
    label: "Songs",
    singular: "song",
    blank: {
      title: "",
      artist: "",
      moods: [],
      artwork: "",
      audioUrl: "",
      duration: 0,
      isPublished: false,
    },
  },

  lyrics: {
    label: "Lyrics",
    singular: "lyrics",
    blank: {
      song: "",
      content: "",
      language: "English",
      isPublished: false,
    },
  },
};

const input =
  "w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-violet-500";

const data = async (response) => {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      body.message || "Request failed."
    );
  }

  return body;
};

const copy = (item) => ({
  ...item,
  artist:
    item.artist?._id ||
    item.artist ||
    "",

  song:
    item.song?._id ||
    item.song ||
    "",

  moods: (item.moods || []).map(
    (mood) => mood._id || mood
  ),

  password: "",
});

const nameOf = (type, item) =>
  type === "lyrics"
    ? item.song?.title || "lyrics"
    : item.name ||
      item.title ||
      item.email;

function ManagementWorkspace({
  onDataChanged,
}) {
  const [type, setType] =
    useState("users");

  const [items, setItems] =
    useState([]);

  const [search, setSearch] =
    useState("");

  const [loading, setLoading] =
    useState(true);

  const [form, setForm] =
    useState(null);

  const [options, setOptions] =
    useState({
      artists: [],
      moods: [],
      songs: [],
    });

  const [saving, setSaving] =
    useState(false);

  const [busy, setBusy] =
    useState("");

  const [error, setError] =
    useState("");

  const [notice, setNotice] =
    useState("");

  const [syncing, setSyncing] =
    useState(false);

  // =====================================================
  // LOAD DROPDOWN OPTIONS
  // =====================================================

  const loadOptions =
    useCallback(async () => {
      const get = async (endpoint) =>
        data(
          await fetch(
            `${API}/${endpoint}?page=1&limit=100`,
            {
              credentials: "include",
            }
          )
        );

      const [
        artists,
        moods,
        songs,
      ] = await Promise.all([
        get("artists"),
        get("moods"),
        get("songs"),
      ]);

      setOptions({
        artists: artists.items || [],
        moods: moods.items || [],
        songs: songs.items || [],
      });
    }, []);

  // =====================================================
  // LOAD CURRENT RESOURCE
  // =====================================================

  const load = useCallback(
    async (
      resource = type,
      query = ""
    ) => {
      setLoading(true);

      try {
        const queryString =
          new URLSearchParams({
            page: "1",
            limit: "100",
          });

        if (query.trim()) {
          queryString.set(
            "search",
            query.trim()
          );
        }

        const result = await data(
          await fetch(
            `${API}/${resource}?${queryString}`,
            {
              credentials: "include",
            }
          )
        );

        setItems(
          resource === "users"
            ? result.users || []
            : result.items || []
        );
      } finally {
        setLoading(false);
      }
    },
    [type]
  );

  useEffect(() => {
    Promise.all([
      load(type),
      loadOptions(),
    ]).catch((reason) =>
      setError(reason.message)
    );
  }, [
    load,
    loadOptions,
    type,
  ]);

  // =====================================================
  // REFRESH EVERYTHING
  // =====================================================

  const refresh = async () => {
    await Promise.all([
      load(type, search),
      loadOptions(),
      onDataChanged?.(),
    ]);
  };

  // =====================================================
  // SYNC AUDIUS → MONGODB
  // =====================================================

  const syncAudius = async () => {
    setSyncing(true);
    setError("");
    setNotice("");

    try {
      const result = await data(
        await fetch(
          `${API}/catalog/sync-audius`,
          {
            method: "POST",
            credentials: "include",
          }
        )
      );

      const artistsCreated =
        result.artists?.created || 0;

      const artistsUpdated =
        result.artists?.updated || 0;

      const songsCreated =
        result.songs?.created || 0;

      const songsUpdated =
        result.songs?.updated || 0;

      setNotice(
        `Audius sync complete. ` +
        `${artistsCreated} artists created, ` +
        `${artistsUpdated} artists updated, ` +
        `${songsCreated} songs created, ` +
        `${songsUpdated} songs updated.`
      );

      // Reload MongoDB data
      await Promise.all([
        load(type, search),
        loadOptions(),
        onDataChanged?.(),
      ]);
    } catch (reason) {
      console.error(
        "Audius sync failed:",
        reason
      );

      setError(reason.message);
    } finally {
      setSyncing(false);
    }
  };

  // =====================================================
  // UI ACTIONS
  // =====================================================

  const choose = (next) => {
    setType(next);
    setSearch("");
    setError("");
    setNotice("");
    setForm(null);
  };

  const change = (
    field,
    value
  ) =>
    setForm((current) => ({
      ...current,
      values: {
        ...current.values,
        [field]: value,
      },
    }));

  const create = () => {
    setError("");

    setForm({
      id: "",
      values: structuredClone(
        config[type].blank
      ),
    });
  };

  const edit = (item) => {
    setError("");

    setForm({
      id: item._id,
      values: copy(item),
    });
  };

  // =====================================================
  // CREATE / UPDATE
  // =====================================================

  const submit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setError("");

    try {
      const payload = {
        ...form.values,
      };

      if (
        type === "users" &&
        form.id &&
        !payload.password
      ) {
        delete payload.password;
      }

      const result = await data(
        await fetch(
          `${API}/${type}${
            form.id
              ? `/${form.id}`
              : ""
          }`,
          {
            method: form.id
              ? "PATCH"
              : "POST",

            credentials: "include",

            headers: {
              "Content-Type":
                "application/json",
            },

            body: JSON.stringify(
              payload
            ),
          }
        )
      );

      setForm(null);

      setNotice(
        result.message ||
          `${config[type].singular} ${
            form.id
              ? "updated"
              : "created"
          }.`
      );

      await refresh();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // DELETE
  // =====================================================

  const remove = async (item) => {
    if (
      !window.confirm(
        `Delete ${nameOf(
          type,
          item
        )}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(item._id);
    setError("");

    try {
      const result = await data(
        await fetch(
          `${API}/${type}/${item._id}`,
          {
            method: "DELETE",
            credentials: "include",
          }
        )
      );

      setNotice(
        result.message ||
          "Record deleted."
      );

      await refresh();
    } catch (reason) {
      setError(reason.message);
    } finally {
      setBusy("");
    }
  };

  // =====================================================
  // FORM FIELDS
  // =====================================================

  const formFields = () => {
    const value = form.values;

    if (type === "users") {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              required
              value={value.name}
              onChange={(e) =>
                change(
                  "name",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={value.email}
              onChange={(e) =>
                change(
                  "email",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          <Field
            label={
              form.id
                ? "New password (optional)"
                : "Temporary password"
            }
          >
            <input
              required={!form.id}
              minLength="6"
              type="password"
              value={value.password}
              onChange={(e) =>
                change(
                  "password",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          {!form.id ? (
            <>
              <Field label="Role">
                <select
                  value={value.role}
                  onChange={(e) =>
                    change(
                      "role",
                      e.target.value
                    )
                  }
                  className={input}
                >
                  <option value="user">
                    Member
                  </option>

                  <option value="admin">
                    Admin
                  </option>
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={value.status}
                  onChange={(e) =>
                    change(
                      "status",
                      e.target.value
                    )
                  }
                  className={input}
                >
                  <option value="active">
                    Active
                  </option>

                  <option value="suspended">
                    Suspended
                  </option>
                </select>
              </Field>
            </>
          ) : null}
        </div>
      );
    }

    if (type === "artists") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Artist name">
              <input
                required
                value={value.name}
                onChange={(e) =>
                  change(
                    "name",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Country">
              <input
                value={value.country}
                onChange={(e) =>
                  change(
                    "country",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>
          </div>

          <Field label="Image URL">
            <input
              type="url"
              value={value.imageUrl}
              onChange={(e) =>
                change(
                  "imageUrl",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          <Field label="Biography">
            <textarea
              rows="5"
              value={value.bio}
              onChange={(e) =>
                change(
                  "bio",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          <Check
            label="Feature this artist"
            checked={value.isFeatured}
            onChange={(checked) =>
              change(
                "isFeatured",
                checked
              )
            }
          />
        </div>
      );
    }

    if (type === "moods") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input
                required
                value={value.name}
                onChange={(e) =>
                  change(
                    "name",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Slug">
              <input
                value={value.slug}
                placeholder="auto from name"
                onChange={(e) =>
                  change(
                    "slug",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Emoji">
              <input
                value={value.emoji}
                onChange={(e) =>
                  change(
                    "emoji",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows="4"
              value={value.description}
              onChange={(e) =>
                change(
                  "description",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>

          <div className="flex flex-wrap items-center gap-5">
            <Field label="Accent color">
              <input
                type="color"
                value={value.color}
                onChange={(e) =>
                  change(
                    "color",
                    e.target.value
                  )
                }
                className="h-11 w-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
              />
            </Field>

            <Check
              label="Visible to listeners"
              checked={value.isActive}
              onChange={(checked) =>
                change(
                  "isActive",
                  checked
                )
              }
            />
          </div>
        </div>
      );
    }

    if (type === "songs") {
      return (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Song title">
              <input
                required
                value={value.title}
                onChange={(e) =>
                  change(
                    "title",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Artist">
              <select
                required
                value={value.artist}
                onChange={(e) =>
                  change(
                    "artist",
                    e.target.value
                  )
                }
                className={input}
              >
                <option value="">
                  Choose artist
                </option>

                {options.artists.map(
                  (artist) => (
                    <option
                      key={artist._id}
                      value={artist._id}
                    >
                      {artist.name}
                    </option>
                  )
                )}
              </select>
            </Field>
          </div>

          <Field
            label="Moods"
            hint="Use Ctrl/Cmd to choose several."
          >
            <select
              multiple
              value={value.moods}
              onChange={(e) =>
                change(
                  "moods",
                  Array.from(
                    e.target
                      .selectedOptions,
                    (option) =>
                      option.value
                  )
                )
              }
              className={`${input} h-28`}
            >
              {options.moods.map(
                (mood) => (
                  <option
                    key={mood._id}
                    value={mood._id}
                  >
                    {mood.emoji}{" "}
                    {mood.name}
                  </option>
                )
              )}
            </select>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Artwork URL">
              <input
                type="url"
                value={value.artwork}
                onChange={(e) =>
                  change(
                    "artwork",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Audio URL">
              <input
                type="url"
                value={value.audioUrl}
                onChange={(e) =>
                  change(
                    "audioUrl",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Field label="Duration (seconds)">
              <input
                min="0"
                type="number"
                value={value.duration}
                onChange={(e) =>
                  change(
                    "duration",
                    e.target.value
                  )
                }
                className={input}
              />
            </Field>

            <Check
              label="Publish this song"
              checked={
                value.isPublished
              }
              onChange={(checked) =>
                change(
                  "isPublished",
                  checked
                )
              }
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Song">
            <select
              required
              value={value.song}
              onChange={(e) =>
                change(
                  "song",
                  e.target.value
                )
              }
              className={input}
            >
              <option value="">
                Choose song
              </option>

              {options.songs.map(
                (song) => (
                  <option
                    key={song._id}
                    value={song._id}
                  >
                    {song.title} —{" "}
                    {song.artist?.name ||
                      "Unknown artist"}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field label="Language">
            <input
              value={value.language}
              onChange={(e) =>
                change(
                  "language",
                  e.target.value
                )
              }
              className={input}
            />
          </Field>
        </div>

        <Field label="Lyrics">
          <textarea
            required
            rows="14"
            value={value.content}
            onChange={(e) =>
              change(
                "content",
                e.target.value
              )
            }
            className={`${input} font-mono leading-6`}
          />
        </Field>

        <Check
          label="Publish these lyrics"
          checked={value.isPublished}
          onChange={(checked) =>
            change(
              "isPublished",
              checked
            )
          }
        />
      </div>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="space-y-6">
      <div className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">
          Database-backed tools
        </p>

        <h2 className="mt-1 text-2xl font-bold">
          Content and account management
        </h2>

        <p className="mt-2 text-sm text-[var(--text-secondary)]">
          Create, edit, search, and remove
          platform records.
        </p>

        {/* ================================================= */}
        {/* AUDIUS SYNC                                      */}
        {/* ================================================= */}

        <div className="mt-5 rounded-2xl border border-violet-500/20 bg-violet-500/5 p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="font-semibold">
                Audius Music Catalog
              </p>

              <p className="mt-1 text-xs text-[var(--text-secondary)]">
                Import trending Audius artists
                and songs into MongoDB Atlas.
              </p>
            </div>

            <button
              type="button"
              onClick={syncAudius}
              disabled={syncing}
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <HiArrowPath
                className={
                  syncing
                    ? "animate-spin"
                    : ""
                }
              />

              {syncing
                ? "Syncing Audius..."
                : "Sync Audius"}
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* TABS                                             */}
        {/* ================================================= */}

        <div className="mt-5 flex gap-2 overflow-x-auto pb-1">
          {Object.entries(config).map(
            ([id, details]) => (
              <button
                key={id}
                type="button"
                onClick={() =>
                  choose(id)
                }
                className={`shrink-0 rounded-xl px-3.5 py-2.5 text-sm font-semibold transition ${
                  type === id
                    ? "bg-violet-600 text-white"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-violet-300"
                }`}
              >
                {details.label}
              </button>
            )
          )}
        </div>
      </div>

      {error && (
        <Message
          error
          text={error}
        />
      )}

      {notice && (
        <Message text={notice} />
      )}

      {/* ================================================= */}
      {/* RECORD LIST                                       */}
      {/* ================================================= */}

      <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/5">
        <div className="flex flex-col gap-3 border-b border-[var(--border)] p-5 sm:flex-row sm:justify-between">
          <form
            onSubmit={(e) => {
              e.preventDefault();

              load(type, search).catch(
                (reason) =>
                  setError(
                    reason.message
                  )
              );
            }}
            className="relative w-full sm:max-w-sm"
          >
            <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />

            <input
              value={search}
              onChange={(e) =>
                setSearch(
                  e.target.value
                )
              }
              placeholder={`Search ${config[
                type
              ].label.toLowerCase()}`}
              className={`${input} pl-10`}
            />
          </form>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={refresh}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-50"
            >
              <HiArrowPath
                className={
                  loading
                    ? "animate-spin"
                    : ""
                }
              />

              Refresh
            </button>

            <button
              type="button"
              onClick={create}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-2.5 text-sm font-semibold text-white"
            >
              <HiPlus />
              Add{" "}
              {config[type].singular}
            </button>
          </div>
        </div>

        <div className="divide-y divide-[var(--border)]">
          {loading ? (
            <div className="flex items-center gap-3 p-8 text-sm text-[var(--text-secondary)]">
              <HiArrowPath className="animate-spin text-violet-300" />
              Loading records…
            </div>
          ) : items.length ? (
            items.map((item) => (
              <div
                key={item._id}
                className="flex flex-col gap-3 p-5 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <Record
                    type={type}
                    item={item}
                  />
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      edit(item)
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-[var(--border)] px-3 py-2 text-xs font-semibold transition hover:border-violet-500/40 hover:text-violet-300"
                  >
                    <HiPencilSquare />
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      remove(item)
                    }
                    disabled={
                      busy === item._id
                    }
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-500/20 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50"
                  >
                    <HiTrash />
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="p-10 text-center text-sm text-[var(--text-secondary)]">
              No{" "}
              {config[
                type
              ].label.toLowerCase()}{" "}
              found.
            </p>
          )}
        </div>
      </article>

      {/* ================================================= */}
      {/* CREATE / EDIT MODAL                               */}
      {/* ================================================= */}

      {form && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/65 backdrop-blur-sm sm:items-center sm:justify-center sm:p-6">
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-t-[28px] border border-[var(--border)] bg-[var(--card)] shadow-2xl sm:rounded-[28px]"
          >
            <div className="sticky top-0 flex items-start justify-between border-b border-[var(--border)] bg-[var(--card)] px-5 py-5 sm:px-6">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                  {form.id
                    ? "Edit"
                    : "Create"}{" "}
                  record
                </p>

                <h3 className="mt-1 text-xl font-bold">
                  {form.id
                    ? "Edit"
                    : "Create"}{" "}
                  {
                    config[type]
                      .singular
                  }
                </h3>
              </div>

              <button
                type="button"
                onClick={() =>
                  setForm(null)
                }
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)]"
              >
                <HiXMark className="text-lg" />
              </button>
            </div>

            <div className="p-5 sm:p-6">
              {formFields()}
            </div>

            <div className="sticky bottom-0 flex justify-end gap-3 border-t border-[var(--border)] bg-[var(--card)] px-5 py-4 sm:px-6">
              <button
                type="button"
                onClick={() =>
                  setForm(null)
                }
                className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
              >
                {saving && (
                  <HiArrowPath className="animate-spin" />
                )}

                {form.id
                  ? "Save changes"
                  : `Create ${config[type].singular}`}
              </button>
            </div>
          </form>
        </div>
      )}
    </section>
  );
}

// =====================================================
// SMALL COMPONENTS
// =====================================================

function Field({
  label,
  hint,
  children,
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-semibold">
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-1 block text-xs text-[var(--text-muted)]">
          {hint}
        </span>
      )}
    </label>
  );
}

function Check({
  label,
  checked,
  onChange,
}) {
  return (
    <label className="flex items-center gap-3 self-end pt-5 text-sm font-semibold">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) =>
          onChange(
            e.target.checked
          )
        }
        className="h-4 w-4 rounded accent-violet-500"
      />

      {label}
    </label>
  );
}

function Message({
  text,
  error,
}) {
  return (
    <div
      className={`flex gap-3 rounded-2xl border px-4 py-3 text-sm ${
        error
          ? "border-red-500/25 bg-red-500/10 text-red-100"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      }`}
    >
      {error ? (
        <HiExclamationTriangle className="shrink-0 text-lg text-red-400" />
      ) : (
        <HiCheckCircle className="shrink-0 text-lg text-emerald-400" />
      )}

      <p>{text}</p>
    </div>
  );
}

function Record({
  type,
  item,
}) {
  if (type === "users") {
    return (
      <>
        <p className="font-semibold">
          {item.name}{" "}
          <span className="text-xs font-medium text-violet-300">
            {item.role}
          </span>
        </p>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {item.email} ·{" "}
          {item.status}
        </p>
      </>
    );
  }

  if (type === "artists") {
    return (
      <>
        <p className="font-semibold">
          {item.name}
        </p>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {item.country ||
            "Country not set"}

          {item.isFeatured
            ? " · Featured"
            : ""}
        </p>
      </>
    );
  }

  if (type === "moods") {
    return (
      <>
        <p className="font-semibold">
          {item.emoji} {item.name}
        </p>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          /{item.slug} ·{" "}
          {item.isActive
            ? "Visible"
            : "Hidden"}
        </p>
      </>
    );
  }

  if (type === "songs") {
    return (
      <>
        <p className="font-semibold">
          {item.title}
        </p>

        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {item.artist?.name ||
            "Unknown artist"}{" "}
          ·{" "}
          {item.isPublished
            ? "Published"
            : "Draft"}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="font-semibold">
        {item.song?.title ||
          "Deleted song"}
      </p>

      <p className="mt-1 max-w-xl truncate text-sm text-[var(--text-secondary)]">
        {item.content}
      </p>
    </>
  );
}

export default ManagementWorkspace;