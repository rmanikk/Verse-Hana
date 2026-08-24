import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../../config/api";
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

const API = `${API_URL}/api/admin`;

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
  "w-full min-w-0 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none transition focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10";

const data = async (response) => {
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(body.message || "Request failed.");
  }

  return body;
};

const copy = (item) => ({
  ...item,

  artist: item.artist?._id || item.artist || "",

  song: item.song?._id || item.song || "",

  moods: (item.moods || []).map((mood) => mood._id || mood),

  password: "",
});

const nameOf = (type, item) =>
  type === "lyrics"
    ? item.song?.title || "lyrics"
    : item.name || item.title || item.email;

function ManagementWorkspace({ onDataChanged }) {
  const [type, setType] = useState("users");

  const [items, setItems] = useState([]);

  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState(null);

  const [options, setOptions] = useState({
    artists: [],
    moods: [],
    songs: [],
  });

  const [saving, setSaving] = useState(false);

  const [busy, setBusy] = useState("");

  const [error, setError] = useState("");

  const [notice, setNotice] = useState("");

  const [syncing, setSyncing] = useState(false);

  // =====================================================
  // LOAD DROPDOWN OPTIONS
  // =====================================================

  const loadOptions = useCallback(async () => {
    const get = async (endpoint) =>
      data(
        await fetch(`${API}/${endpoint}?page=1&limit=100`, {
          credentials: "include",
        })
      );

    const [artists, moods, songs] = await Promise.all([
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
    async (resource = type, query = "") => {
      setLoading(true);

      try {
        const queryString = new URLSearchParams({
          page: "1",
          limit: "100",
        });

        if (query.trim()) {
          queryString.set("search", query.trim());
        }

        const result = await data(
          await fetch(`${API}/${resource}?${queryString}`, {
            credentials: "include",
          })
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
    Promise.all([load(type), loadOptions()]).catch((reason) =>
      setError(reason.message)
    );
  }, [load, loadOptions, type]);

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
        await fetch(`${API}/catalog/sync-audius`, {
          method: "POST",
          credentials: "include",
        })
      );

      const artistsCreated = result.artists?.created || 0;
      const artistsUpdated = result.artists?.updated || 0;

      const songsCreated = result.songs?.created || 0;
      const songsUpdated = result.songs?.updated || 0;

      setNotice(
        `Audius sync complete. ` +
          `${artistsCreated} artists created, ` +
          `${artistsUpdated} artists updated, ` +
          `${songsCreated} songs created, ` +
          `${songsUpdated} songs updated.`
      );

      await Promise.all([
        load(type, search),
        loadOptions(),
        onDataChanged?.(),
      ]);
    } catch (reason) {
      console.error("Audius sync failed:", reason);
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

  const change = (field, value) =>
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
      values: structuredClone(config[type].blank),
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

      if (type === "users" && form.id && !payload.password) {
        delete payload.password;
      }

      const result = await data(
        await fetch(
          `${API}/${type}${form.id ? `/${form.id}` : ""}`,
          {
            method: form.id ? "PATCH" : "POST",

            credentials: "include",

            headers: {
              "Content-Type": "application/json",
            },

            body: JSON.stringify(payload),
          }
        )
      );

      setForm(null);

      setNotice(
        result.message ||
          `${config[type].singular} ${
            form.id ? "updated" : "created"
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
        `Delete ${nameOf(type, item)}? This cannot be undone.`
      )
    ) {
      return;
    }

    setBusy(item._id);
    setError("");

    try {
      const result = await data(
        await fetch(`${API}/${type}/${item._id}`, {
          method: "DELETE",
          credentials: "include",
        })
      );

      setNotice(result.message || "Record deleted.");

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
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <input
              required
              value={value.name}
              onChange={(e) => change("name", e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Email">
            <input
              required
              type="email"
              value={value.email}
              onChange={(e) => change("email", e.target.value)}
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
              onChange={(e) => change("password", e.target.value)}
              className={input}
            />
          </Field>

          {!form.id && (
            <>
              <Field label="Role">
                <select
                  value={value.role}
                  onChange={(e) => change("role", e.target.value)}
                  className={input}
                >
                  <option value="user">Member</option>
                  <option value="admin">Admin</option>
                </select>
              </Field>

              <Field label="Status">
                <select
                  value={value.status}
                  onChange={(e) => change("status", e.target.value)}
                  className={input}
                >
                  <option value="active">Active</option>
                  <option value="suspended">Suspended</option>
                </select>
              </Field>
            </>
          )}
        </div>
      );
    }

    if (type === "artists") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Artist name">
              <input
                required
                value={value.name}
                onChange={(e) => change("name", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Country">
              <input
                value={value.country}
                onChange={(e) => change("country", e.target.value)}
                className={input}
              />
            </Field>
          </div>

          <Field label="Image URL">
            <input
              type="url"
              value={value.imageUrl}
              onChange={(e) => change("imageUrl", e.target.value)}
              className={input}
            />
          </Field>

          <Field label="Biography">
            <textarea
              rows="5"
              value={value.bio}
              onChange={(e) => change("bio", e.target.value)}
              className={input}
            />
          </Field>

          <Check
            label="Feature this artist"
            checked={value.isFeatured}
            onChange={(checked) => change("isFeatured", checked)}
          />
        </div>
      );
    }

    if (type === "moods") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <Field label="Name">
              <input
                required
                value={value.name}
                onChange={(e) => change("name", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Slug">
              <input
                value={value.slug}
                placeholder="auto from name"
                onChange={(e) => change("slug", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Emoji">
              <input
                value={value.emoji}
                onChange={(e) => change("emoji", e.target.value)}
                className={input}
              />
            </Field>
          </div>

          <Field label="Description">
            <textarea
              rows="4"
              value={value.description}
              onChange={(e) => change("description", e.target.value)}
              className={input}
            />
          </Field>

          <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-6">
            <Field label="Accent color">
              <input
                type="color"
                value={value.color}
                onChange={(e) => change("color", e.target.value)}
                className="h-11 w-20 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1"
              />
            </Field>

            <Check
              label="Visible to listeners"
              checked={value.isActive}
              onChange={(checked) => change("isActive", checked)}
            />
          </div>
        </div>
      );
    }

    if (type === "songs") {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Song title">
              <input
                required
                value={value.title}
                onChange={(e) => change("title", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Artist">
              <select
                required
                value={value.artist}
                onChange={(e) => change("artist", e.target.value)}
                className={input}
              >
                <option value="">Choose artist</option>

                {options.artists.map((artist) => (
                  <option key={artist._id} value={artist._id}>
                    {artist.name}
                  </option>
                ))}
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
                    e.target.selectedOptions,
                    (option) => option.value
                  )
                )
              }
              className={`${input} h-28`}
            >
              {options.moods.map((mood) => (
                <option key={mood._id} value={mood._id}>
                  {mood.emoji} {mood.name}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Field label="Artwork URL">
              <input
                type="url"
                value={value.artwork}
                onChange={(e) => change("artwork", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Audio URL">
              <input
                type="url"
                value={value.audioUrl}
                onChange={(e) => change("audioUrl", e.target.value)}
                className={input}
              />
            </Field>

            <Field label="Duration (seconds)">
              <input
                min="0"
                type="number"
                value={value.duration}
                onChange={(e) => change("duration", e.target.value)}
                className={input}
              />
            </Field>

            <Check
              label="Publish this song"
              checked={value.isPublished}
              onChange={(checked) =>
                change("isPublished", checked)
              }
            />
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Song">
            <select
              required
              value={value.song}
              onChange={(e) => change("song", e.target.value)}
              className={input}
            >
              <option value="">Choose song</option>

              {options.songs.map((song) => (
                <option key={song._id} value={song._id}>
                  {song.title} —{" "}
                  {song.artist?.name || "Unknown artist"}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Language">
            <input
              value={value.language}
              onChange={(e) => change("language", e.target.value)}
              className={input}
            />
          </Field>
        </div>

        <Field label="Lyrics">
          <textarea
            required
            rows="14"
            value={value.content}
            onChange={(e) => change("content", e.target.value)}
            className={`${input} font-mono leading-6`}
          />
        </Field>

        <Check
          label="Publish these lyrics"
          checked={value.isPublished}
          onChange={(checked) => change("isPublished", checked)}
        />
      </div>
    );
  };

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <section className="w-full min-w-0 space-y-4 overflow-x-hidden sm:space-y-6">
      {/* ================================================= */}
      {/* HEADER / INTRO                                    */}
      {/* ================================================= */}

      <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300 sm:text-xs">
          Database-backed tools
        </p>

        <h2 className="mt-1 text-lg font-bold sm:text-2xl">
          Content and account management
        </h2>

        <p className="mt-1.5 text-xs leading-5 text-[var(--text-secondary)] sm:mt-2 sm:text-sm">
          Create, edit, search, and remove platform records.
        </p>

        {/* ================================================= */}
        {/* AUDIUS SYNC                                      */}
        {/* ================================================= */}

        <div className="mt-4 rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 sm:mt-5 sm:rounded-2xl sm:p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold sm:text-base">
                Audius Music Catalog
              </p>

              <p className="mt-1 text-[11px] leading-4 text-[var(--text-secondary)] sm:text-xs">
                Import trending Audius artists and songs into MongoDB
                Atlas.
              </p>
            </div>

            <button
              type="button"
              onClick={syncAudius}
              disabled={syncing}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-900/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto sm:rounded-xl sm:px-4 sm:text-sm"
            >
              <HiArrowPath
                className={syncing ? "animate-spin" : ""}
              />

              {syncing ? "Syncing Audius..." : "Sync Audius"}
            </button>
          </div>
        </div>

        {/* ================================================= */}
        {/* TABS                                             */}
        {/* ================================================= */}

        <div className="-mx-1 mt-4 overflow-x-auto px-1 pb-1 sm:mt-5">
          <div className="flex min-w-max gap-1.5 sm:gap-2">
            {Object.entries(config).map(([id, details]) => (
              <button
                key={id}
                type="button"
                onClick={() => choose(id)}
                className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition sm:rounded-xl sm:px-3.5 sm:py-2.5 sm:text-sm ${
                  type === id
                    ? "bg-violet-600 text-white shadow-md shadow-violet-900/20"
                    : "border border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)] hover:text-violet-300"
                }`}
              >
                {details.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ================================================= */}
      {/* MESSAGES                                         */}
      {/* ================================================= */}

      {error && <Message error text={error} />}

      {notice && <Message text={notice} />}

      {/* ================================================= */}
      {/* RECORD LIST                                       */}
      {/* ================================================= */}

      <article className="min-w-0 overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg shadow-black/5 sm:rounded-3xl">
        {/* Toolbar */}

        <div className="border-b border-[var(--border)] p-3 sm:p-5">
          <div className="flex flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between sm:gap-3">
            {/* Search */}

            <form
              onSubmit={(e) => {
                e.preventDefault();

                load(type, search).catch((reason) =>
                  setError(reason.message)
                );
              }}
              className="relative w-full sm:max-w-sm"
            >
              <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-base text-[var(--text-muted)] sm:text-lg" />

              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={`Search ${config[
                  type
                ].label.toLowerCase()}`}
                className={`${input} pl-9 text-xs sm:pl-10 sm:text-sm`}
              />
            </form>

            {/* Toolbar buttons */}

            <div className="grid grid-cols-2 gap-2 sm:flex">
              <button
                type="button"
                onClick={refresh}
                disabled={loading}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-50 sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              >
                <HiArrowPath
                  className={loading ? "animate-spin" : ""}
                />

                <span>Refresh</span>
              </button>

              <button
                type="button"
                onClick={create}
                className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-gradient-to-r from-violet-600 to-fuchsia-600 px-3 py-2.5 text-xs font-semibold text-white sm:gap-2 sm:rounded-xl sm:px-4 sm:text-sm"
              >
                <HiPlus />

                <span>
                  Add {config[type].singular}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Records */}

        <div className="divide-y divide-[var(--border)]">
          {loading ? (
            <div className="flex items-center gap-3 p-6 text-xs text-[var(--text-secondary)] sm:p-8 sm:text-sm">
              <HiArrowPath className="animate-spin text-violet-300" />
              Loading records…
            </div>
          ) : items.length ? (
            items.map((item) => (
              <div
                key={item._id}
                className="p-3.5 sm:p-5"
              >
                <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Record information */}

                  <div className="min-w-0 flex-1">
                    <Record type={type} item={item} />
                  </div>

                  {/* Actions */}

                  <div className="grid w-full grid-cols-2 gap-2 sm:flex sm:w-auto">
                    <button
                      type="button"
                      onClick={() => edit(item)}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-[var(--border)] px-2.5 py-2 text-[11px] font-semibold transition hover:border-violet-500/40 hover:text-violet-300 sm:px-3 sm:py-2 sm:text-xs"
                    >
                      <HiPencilSquare />
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() => remove(item)}
                      disabled={busy === item._id}
                      className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-red-500/20 px-2.5 py-2 text-[11px] font-semibold text-red-300 transition hover:bg-red-500/10 disabled:opacity-50 sm:px-3 sm:py-2 sm:text-xs"
                    >
                      <HiTrash />

                      {busy === item._id
                        ? "Deleting..."
                        : "Delete"}
                    </button>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <p className="p-8 text-center text-xs text-[var(--text-secondary)] sm:p-10 sm:text-sm">
              No {config[type].label.toLowerCase()} found.
            </p>
          )}
        </div>
      </article>

      {/* ================================================= */}
      {/* CREATE / EDIT MODAL                               */}
      {/* ================================================= */}

      {form && (
        <div className="fixed inset-0 z-[100] flex items-end bg-black/65 backdrop-blur-sm sm:items-center sm:justify-center sm:p-4 md:p-6">
          <form
            onSubmit={submit}
            className="flex max-h-[94vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[24px] border border-[var(--border)] bg-[var(--card)] shadow-2xl sm:max-h-[92vh] sm:rounded-[28px]"
          >
            {/* Modal header */}

            <div className="flex shrink-0 items-start justify-between border-b border-[var(--border)] bg-[var(--card)] px-4 py-4 sm:px-6 sm:py-5">
              <div className="min-w-0 pr-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300 sm:text-xs">
                  {form.id ? "Edit" : "Create"} record
                </p>

                <h3 className="mt-1 truncate text-lg font-bold sm:text-xl">
                  {form.id ? "Edit" : "Create"}{" "}
                  {config[type].singular}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-violet-500/40 hover:text-violet-300 sm:h-9 sm:w-9"
              >
                <HiXMark className="text-base sm:text-lg" />
              </button>
            </div>

            {/* Modal content */}

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-6">
              {formFields()}
            </div>

            {/* Modal footer */}

            <div className="flex shrink-0 gap-2 border-t border-[var(--border)] bg-[var(--card)] px-4 py-3 sm:justify-end sm:gap-3 sm:px-6 sm:py-4">
              <button
                type="button"
                onClick={() => setForm(null)}
                className="flex-1 rounded-lg border border-[var(--border)] px-3 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 sm:flex-none sm:rounded-xl sm:px-4 sm:text-sm"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg bg-violet-600 px-3 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:opacity-60 sm:flex-none sm:rounded-xl sm:px-4 sm:text-sm"
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

function Field({ label, hint, children }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-xs font-semibold sm:text-sm">
        {label}
      </span>

      {children}

      {hint && (
        <span className="mt-1 block text-[10px] leading-4 text-[var(--text-muted)] sm:text-xs">
          {hint}
        </span>
      )}
    </label>
  );
}

function Check({ label, checked, onChange }) {
  return (
    <label className="flex min-h-10 items-center gap-2.5 text-xs font-semibold sm:gap-3 sm:text-sm">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 rounded accent-violet-500"
      />

      <span>{label}</span>
    </label>
  );
}

function Message({ text, error }) {
  return (
    <div
      className={`flex min-w-0 gap-2.5 rounded-xl border px-3 py-2.5 text-xs sm:gap-3 sm:rounded-2xl sm:px-4 sm:py-3 sm:text-sm ${
        error
          ? "border-red-500/25 bg-red-500/10 text-red-100"
          : "border-emerald-500/25 bg-emerald-500/10 text-emerald-100"
      }`}
    >
      {error ? (
        <HiExclamationTriangle className="mt-0.5 shrink-0 text-base text-red-400 sm:text-lg" />
      ) : (
        <HiCheckCircle className="mt-0.5 shrink-0 text-base text-emerald-400 sm:text-lg" />
      )}

      <p className="min-w-0 break-words">{text}</p>
    </div>
  );
}

function Record({ type, item }) {
  if (type === "users") {
    return (
      <>
        <p className="truncate text-sm font-semibold sm:text-base">
          {item.name}{" "}
          <span className="ml-1 text-[10px] font-medium text-violet-300 sm:text-xs">
            {item.role}
          </span>
        </p>

        <p className="mt-1 truncate text-xs text-[var(--text-secondary)] sm:text-sm">
          {item.email} · {item.status}
        </p>
      </>
    );
  }

  if (type === "artists") {
    return (
      <>
        <p className="truncate text-sm font-semibold sm:text-base">
          {item.name}
        </p>

        <p className="mt-1 truncate text-xs text-[var(--text-secondary)] sm:text-sm">
          {item.country || "Country not set"}
          {item.isFeatured ? " · Featured" : ""}
        </p>
      </>
    );
  }

  if (type === "moods") {
    return (
      <>
        <p className="truncate text-sm font-semibold sm:text-base">
          {item.emoji} {item.name}
        </p>

        <p className="mt-1 truncate text-xs text-[var(--text-secondary)] sm:text-sm">
          /{item.slug} · {item.isActive ? "Visible" : "Hidden"}
        </p>
      </>
    );
  }

  if (type === "songs") {
    return (
      <>
        <p className="truncate text-sm font-semibold sm:text-base">
          {item.title}
        </p>

        <p className="mt-1 truncate text-xs text-[var(--text-secondary)] sm:text-sm">
          {item.artist?.name || "Unknown artist"} ·{" "}
          {item.isPublished ? "Published" : "Draft"}
        </p>
      </>
    );
  }

  return (
    <>
      <p className="truncate text-sm font-semibold sm:text-base">
        {item.song?.title || "Deleted song"}
      </p>

      <p className="mt-1 line-clamp-2 text-xs leading-5 text-[var(--text-secondary)] sm:max-w-xl sm:text-sm">
        {item.content}
      </p>
    </>
  );
}

export default ManagementWorkspace;