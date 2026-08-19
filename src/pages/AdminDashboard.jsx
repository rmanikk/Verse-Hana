import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiArrowPath,
  HiChartBar,
  HiCheckCircle,
  HiChevronLeft,
  HiChevronRight,
  HiClock,
  HiExclamationTriangle,
  HiHeart,
  HiMagnifyingGlass,
  HiMusicalNote,
  HiNoSymbol,
  HiQueueList,
  HiShieldCheck,
  HiSignal,
  HiSquares2X2,
  HiUserGroup,
} from "react-icons/hi2";

import { useAuth } from "../context/AuthContext";
import ManagementWorkspace from "../components/admin/ManagementWorkspace";

const API_URL = "http://localhost:5000";

const navigation = [
  { id: "overview", label: "Overview", icon: HiSquares2X2 },
  { id: "members", label: "Members", icon: HiUserGroup },
  { id: "manage", label: "Manage data", icon: HiQueueList },
  { id: "engagement", label: "Engagement", icon: HiChartBar },
  { id: "activity", label: "Activity log", icon: HiClock },
];

const emptyPagination = { page: 1, limit: 10, total: 0, totalPages: 1 };

const formatNumber = (value) => new Intl.NumberFormat("en").format(value || 0);

const formatDate = (value) => {
  if (!value) {
    return "—";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) {
    return "Just now";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getInitial = (name) => name?.trim().charAt(0).toUpperCase() || "U";

const getResponseData = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong. Please try again.");
  }

  return data;
};

function UserAvatar({ name, size = "md" }) {
  const sizeClasses = size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white ${sizeClasses}`}>
      {getInitial(name)}
    </div>
  );
}

function RoleBadge({ role }) {
  const isAdmin = role === "admin";

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${
        isAdmin
          ? "border-violet-500/25 bg-violet-500/10 text-violet-300"
          : "border-[var(--border)] bg-[var(--surface)] text-[var(--text-secondary)]"
      }`}
    >
      {isAdmin && <HiShieldCheck className="text-sm" />}
      {isAdmin ? "Admin" : "Member"}
    </span>
  );
}

function StatusBadge({ status }) {
  const isSuspended = status === "suspended";

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${
        isSuspended
          ? "bg-red-500/10 text-red-300"
          : "bg-emerald-500/10 text-emerald-300"
      }`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${isSuspended ? "bg-red-400" : "bg-emerald-400"}`} />
      {isSuspended ? "Suspended" : "Active"}
    </span>
  );
}

function StatCard({ icon, label, value, detail, tone = "violet" }) {
  const tones = {
    violet: "border-violet-500/20 bg-violet-500/10 text-violet-300",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    pink: "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
    emerald: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm text-[var(--text-secondary)]">{label}</p>
          <p className="mt-2 text-3xl font-bold tracking-tight">{formatNumber(value)}</p>
          <p className="mt-2 text-xs text-[var(--text-muted)]">{detail}</p>
        </div>
        <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border ${tones[tone]}`}>
          {icon}
        </div>
      </div>
    </article>
  );
}

function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div>
        {eyebrow && <p className="text-xs font-semibold uppercase tracking-[0.18em] text-violet-300">{eyebrow}</p>}
        <h2 className="mt-1 text-2xl font-bold tracking-tight">{title}</h2>
        {description && <p className="mt-2 text-sm text-[var(--text-secondary)]">{description}</p>}
      </div>
      {action}
    </div>
  );
}

function Pagination({ pagination, onPageChange, loading }) {
  if (pagination.totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between border-t border-[var(--border)] px-5 py-4 text-sm text-[var(--text-secondary)]">
      <span>Page {pagination.page} of {pagination.totalPages}</span>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <HiChevronLeft />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={pagination.page >= pagination.totalPages || loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <HiChevronRight />
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const isRoleChange = activity.action === "user.role_changed";
  const actorName = activity.actor?.name || "An administrator";
  const targetName = activity.targetUser?.name || "a member";
  const field = isRoleChange ? "role" : "account status";

  return (
    <div className="flex gap-3 py-4">
      <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${isRoleChange ? "bg-violet-500/10 text-violet-300" : "bg-amber-500/10 text-amber-300"}`}>
        {isRoleChange ? <HiShieldCheck /> : <HiNoSymbol />}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6 text-[var(--text-primary)]">
          <span className="font-semibold">{actorName}</span> changed <span className="font-semibold">{targetName}</span>&apos;s {field} from <span className="font-medium text-[var(--text-secondary)]">{activity.previousValue}</span> to <span className="font-medium text-violet-300">{activity.nextValue}</span>.
        </p>
        <p className="mt-1 text-xs text-[var(--text-muted)]">{formatDateTime(activity.createdAt)}</p>
      </div>
    </div>
  );
}

function AdminDashboard() {
  const { user } = useAuth();
  const [activeView, setActiveView] = useState("overview");
  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberPagination, setMemberPagination] = useState(emptyPagination);
  const [memberFilters, setMemberFilters] = useState({ search: "", role: "", status: "" });
  const [activity, setActivity] = useState([]);
  const [activityPagination, setActivityPagination] = useState(emptyPagination);
  const [activityLoaded, setActivityLoaded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [updatingKey, setUpdatingKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    const response = await fetch(`${API_URL}/api/admin/dashboard`, {
      credentials: "include",
    });
    const data = await getResponseData(response);
    setDashboard(data);
  }, []);

  const loadMembers = useCallback(async ({ page = 1, search = "", role = "", status = "" } = {}) => {
    setLoadingMembers(true);

    try {
      const params = new URLSearchParams({ page: String(page), limit: "10" });

      if (search.trim()) params.set("search", search.trim());
      if (role) params.set("role", role);
      if (status) params.set("status", status);

      const response = await fetch(`${API_URL}/api/admin/users?${params}`, {
        credentials: "include",
      });
      const data = await getResponseData(response);

      setMembers(data.users || []);
      setMemberPagination(data.pagination || emptyPagination);
    } finally {
      setLoadingMembers(false);
    }
  }, []);

  const loadActivity = useCallback(async (page = 1) => {
    setLoadingActivity(true);

    try {
      const response = await fetch(`${API_URL}/api/admin/activity?page=${page}&limit=15`, {
        credentials: "include",
      });
      const data = await getResponseData(response);

      setActivity(data.activity || []);
      setActivityPagination(data.pagination || emptyPagination);
      setActivityLoaded(true);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      setError("");

      try {
        await Promise.all([loadDashboard(), loadMembers()]);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    loadWorkspace();
  }, [loadDashboard, loadMembers]);

  const showView = async (view) => {
    setActiveView(view);
    setError("");
    setNotice("");

    if (view === "activity" && !activityLoaded) {
      try {
        await loadActivity();
      } catch (requestError) {
        setError(requestError.message);
      }
    }
  };

  const refreshWorkspace = async () => {
    setError("");
    setNotice("");
    setLoading(true);

    try {
      await Promise.all([
        loadDashboard(),
        loadMembers({ ...memberFilters, page: memberPagination.page }),
        activeView === "activity" ? loadActivity(activityPagination.page) : Promise.resolve(),
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  const applyMemberFilters = async (event) => {
    event.preventDefault();
    setError("");
    setNotice("");

    try {
      await loadMembers({ ...memberFilters, page: 1 });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const resetMemberFilters = async () => {
    const filters = { search: "", role: "", status: "" };
    setMemberFilters(filters);
    setError("");
    setNotice("");

    try {
      await loadMembers({ ...filters, page: 1 });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const changeMemberPage = async (page) => {
    try {
      await loadMembers({ ...memberFilters, page });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const changeActivityPage = async (page) => {
    try {
      await loadActivity(page);
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const updateMember = async (member, field, nextValue) => {
    if (member[field] === nextValue) {
      return;
    }

    if (field === "status" && nextValue === "suspended") {
      const approved = window.confirm(`Suspend ${member.name}? They will no longer be able to sign in.`);

      if (!approved) {
        return;
      }
    }

    const actionKey = `${member._id}-${field}`;
    setUpdatingKey(actionKey);
    setError("");
    setNotice("");

    try {
      const response = await fetch(`${API_URL}/api/admin/users/${member._id}/${field}`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ [field]: nextValue }),
      });
      const data = await getResponseData(response);

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember._id === data.user._id ? data.user : currentMember
        )
      );
      setNotice(`${data.user.name}'s ${field} was updated.`);

      await Promise.all([
        loadDashboard(),
        activityLoaded ? loadActivity(activityPagination.page) : Promise.resolve(),
      ]);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setUpdatingKey("");
    }
  };

  const stats = dashboard?.stats || {
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    suspendedUsers: 0,
    totalLikes: 0,
    uniqueTracks: 0,
  };
  const recentUsers = dashboard?.recentUsers || [];
  const recentLikes = dashboard?.recentLikes || [];
  const popularTracks = dashboard?.popularTracks || [];
  const recentActivity = dashboard?.recentActivity || [];

  if (loading && !dashboard) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] text-[var(--text-primary)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <HiArrowPath className="animate-spin text-lg text-violet-400" />
          Loading the admin workspace…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">
        <aside className="border-b border-[var(--border)] bg-[var(--surface)]/65 px-4 py-5 lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:px-5 lg:py-7">
          <div className="flex items-center justify-between lg:block">
            <Link to="/dashboard" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg text-white shadow-lg shadow-violet-500/20">
                <HiMusicalNote />
              </div>
              <div>
                <p className="font-bold tracking-tight">VerseHana</p>
                <p className="text-xs text-violet-300">Admin console</p>
              </div>
            </Link>
            <Link to="/dashboard" className="text-xs font-medium text-[var(--text-secondary)] transition hover:text-violet-300 lg:mt-8 lg:inline-flex lg:items-center lg:gap-2">
              <HiArrowLeft className="hidden lg:block" />
              Back to app
            </Link>
          </div>

          <nav className="mt-5 flex gap-2 overflow-x-auto pb-1 lg:mt-9 lg:flex-col lg:overflow-visible">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => showView(item.id)}
                  className={`flex shrink-0 items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-lg shadow-violet-500/20"
                      : "text-[var(--text-secondary)] hover:bg-violet-500/10 hover:text-[var(--text-primary)]"
                  }`}
                >
                  <Icon className="text-lg" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          <div className="mt-7 hidden rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 lg:block">
            <div className="flex items-center gap-2 text-sm font-semibold text-emerald-300">
              <HiSignal />
              Systems operational
            </div>
            <p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">The API and database responded successfully to this workspace.</p>
          </div>

          <div className="mt-6 hidden border-t border-[var(--border)] pt-5 lg:flex lg:items-center lg:gap-3">
            <UserAvatar name={user?.name} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{user?.name}</p>
              <p className="truncate text-xs text-[var(--text-muted)]">{user?.email}</p>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 px-4 py-6 sm:px-7 lg:px-10 lg:py-9">
          <header className="flex flex-col gap-5 border-b border-[var(--border)] pb-6 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-violet-300">
                <HiShieldCheck className="text-sm" />
                Secure workspace
              </div>
              <h1 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
                {navigation.find((item) => item.id === activeView)?.label}
              </h1>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">Manage your community with live data from VerseHana.</p>
            </div>
            <button
              type="button"
              onClick={refreshWorkspace}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-sm font-semibold transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-wait disabled:opacity-60"
            >
              <HiArrowPath className={loading ? "animate-spin" : ""} />
              Refresh data
            </button>
          </header>

          {error && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-100">
              <HiExclamationTriangle className="mt-0.5 shrink-0 text-lg text-red-400" />
              <p>{error}</p>
            </div>
          )}

          {notice && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
              <HiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-400" />
              <p>{notice}</p>
            </div>
          )}

          {activeView === "overview" && (
            <div className="space-y-8 pt-8">
              <section className="relative overflow-hidden rounded-[28px] border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-[var(--card)] to-fuchsia-600/10 p-6 sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-fuchsia-500/15 blur-3xl" />
                <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-sm font-medium text-violet-200">Welcome back, {user?.name || "Admin"}.</p>
                    <h2 className="mt-2 max-w-xl text-2xl font-bold tracking-tight sm:text-3xl">Your community is ready for a closer look.</h2>
                    <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Review people, track listening engagement, and keep a clear record of every admin action.</p>
                  </div>
                  <button type="button" onClick={() => showView("members")} className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-zinc-900 transition hover:scale-[1.02]">
                    <HiUserGroup />
                    Manage members
                  </button>
                </div>
              </section>

              <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={<HiUserGroup className="text-xl" />} label="Total members" value={stats.totalUsers} detail={`${formatNumber(stats.activeUsers)} active accounts`} />
                <StatCard icon={<HiShieldCheck className="text-xl" />} label="Administrators" value={stats.adminUsers} detail="Protected workspace access" tone="sky" />
                <StatCard icon={<HiHeart className="text-xl" />} label="Songs saved" value={stats.totalLikes} detail={`${formatNumber(stats.uniqueTracks)} unique tracks`} tone="pink" />
                <StatCard icon={<HiNoSymbol className="text-xl" />} label="Suspended accounts" value={stats.suspendedUsers} detail="Cannot sign in or use the API" tone="emerald" />
              </section>

              <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5 sm:p-6">
                  <SectionHeading eyebrow="Engagement" title="Popular saved tracks" description="Most frequently saved by your community." action={<button type="button" onClick={() => showView("engagement")} className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">View all</button>} />
                  <div className="mt-5 divide-y divide-[var(--border)]">
                    {popularTracks.length ? popularTracks.slice(0, 5).map((track, index) => (
                      <div key={track._id} className="flex items-center gap-4 py-3">
                        <span className="w-5 text-sm font-bold text-[var(--text-muted)]">{index + 1}</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300"><HiMusicalNote /></div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{track.title}</p>
                          <p className="truncate text-xs text-[var(--text-secondary)]">{track.artist || "Unknown artist"}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold">{formatNumber(track.likes)}</p>
                          <p className="text-xs text-[var(--text-muted)]">saves</p>
                        </div>
                      </div>
                    )) : <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Saved tracks will appear here as your community listens.</p>}
                  </div>
                </article>

                <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5 sm:p-6">
                  <SectionHeading eyebrow="Access" title="Newest members" description="Recently created VerseHana accounts." action={<button type="button" onClick={() => showView("members")} className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">Review</button>} />
                  <div className="mt-5 space-y-4">
                    {recentUsers.length ? recentUsers.map((member) => (
                      <div key={member._id} className="flex items-center gap-3">
                        <UserAvatar name={member.name} size="sm" />
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-sm font-semibold">{member.name}</p>
                          <p className="truncate text-xs text-[var(--text-secondary)]">Joined {formatDate(member.createdAt)}</p>
                        </div>
                        <StatusBadge status={member.status} />
                      </div>
                    )) : <p className="py-8 text-center text-sm text-[var(--text-secondary)]">No members yet.</p>}
                  </div>
                </article>
              </section>

              <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5 sm:p-6">
                <SectionHeading eyebrow="Audit trail" title="Recent administration activity" description="Role and account access changes are recorded here." action={<button type="button" onClick={() => showView("activity")} className="text-sm font-semibold text-violet-300 transition hover:text-violet-200">Open activity log</button>} />
                <div className="mt-4 divide-y divide-[var(--border)]">
                  {recentActivity.length ? recentActivity.map((entry) => <ActivityItem key={entry._id} activity={entry} />) : <p className="py-8 text-center text-sm text-[var(--text-secondary)]">Changes you make to roles or account status will appear here.</p>}
                </div>
              </article>
            </div>
          )}

          {activeView === "members" && (
            <div className="space-y-6 pt-8">
              <SectionHeading eyebrow="Member directory" title="Manage people and access" description="Promote trusted teammates, or suspend accounts when action is needed." />
              <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/5">
                <form onSubmit={applyMemberFilters} className="grid gap-3 border-b border-[var(--border)] p-5 lg:grid-cols-[minmax(0,1fr)_150px_160px_auto_auto]">
                  <div className="relative">
                    <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />
                    <input value={memberFilters.search} onChange={(event) => setMemberFilters((current) => ({ ...current, search: event.target.value }))} placeholder="Search name or email" className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3 text-sm outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10" />
                  </div>
                  <select value={memberFilters.role} onChange={(event) => setMemberFilters((current) => ({ ...current, role: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-violet-500">
                    <option value="">All roles</option>
                    <option value="admin">Admins</option>
                    <option value="user">Members</option>
                  </select>
                  <select value={memberFilters.status} onChange={(event) => setMemberFilters((current) => ({ ...current, status: event.target.value }))} className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-sm outline-none focus:border-violet-500">
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>
                  <button type="submit" disabled={loadingMembers} className="rounded-xl bg-violet-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60">Apply</button>
                  <button type="button" onClick={resetMemberFilters} disabled={loadingMembers} className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-sm font-semibold text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-60">Reset</button>
                </form>

                <div className="flex items-center justify-between px-5 py-4">
                  <p className="text-sm text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{formatNumber(memberPagination.total)}</span> matching members</p>
                  {loadingMembers && <span className="inline-flex items-center gap-2 text-xs text-violet-300"><HiArrowPath className="animate-spin" />Updating list</span>}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[820px] w-full border-collapse text-left">
                    <thead className="border-y border-[var(--border)] bg-[var(--surface)]/70 text-xs uppercase tracking-wider text-[var(--text-muted)]">
                      <tr>
                        <th className="px-5 py-3 font-semibold">Member</th>
                        <th className="px-5 py-3 font-semibold">Joined</th>
                        <th className="px-5 py-3 font-semibold">Role</th>
                        <th className="px-5 py-3 font-semibold">Status</th>
                        <th className="px-5 py-3 text-right font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)]">
                      {members.length ? members.map((member) => {
                        const isCurrentUser = member._id === user?.id;
                        const changingRole = updatingKey === `${member._id}-role`;
                        const changingStatus = updatingKey === `${member._id}-status`;

                        return (
                          <tr key={member._id} className="transition hover:bg-violet-500/[0.03]">
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-3">
                                <UserAvatar name={member.name} />
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2"><p className="max-w-[190px] truncate text-sm font-semibold">{member.name}</p>{isCurrentUser && <span className="text-xs text-violet-300">You</span>}</div>
                                  <p className="max-w-[230px] truncate text-xs text-[var(--text-secondary)]">{member.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">{formatDate(member.createdAt)}</td>
                            <td className="px-5 py-4"><RoleBadge role={member.role} /></td>
                            <td className="px-5 py-4"><StatusBadge status={member.status} /></td>
                            <td className="px-5 py-4">
                              {isCurrentUser ? <p className="text-right text-xs text-[var(--text-muted)]">Your access is protected</p> : (
                                <div className="flex justify-end gap-2">
                                  <select value={member.role} onChange={(event) => updateMember(member, "role", event.target.value)} disabled={changingRole || changingStatus} aria-label={`Change ${member.name}'s role`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-semibold outline-none focus:border-violet-500 disabled:cursor-wait disabled:opacity-60">
                                    <option value="user">Member</option>
                                    <option value="admin">Admin</option>
                                  </select>
                                  <select value={member.status} onChange={(event) => updateMember(member, "status", event.target.value)} disabled={changingRole || changingStatus} aria-label={`Change ${member.name}'s account status`} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-semibold outline-none focus:border-violet-500 disabled:cursor-wait disabled:opacity-60">
                                    <option value="active">Active</option>
                                    <option value="suspended">Suspend</option>
                                  </select>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      }) : (
                        <tr><td colSpan="5" className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]">No members match these filters.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                <Pagination pagination={memberPagination} onPageChange={changeMemberPage} loading={loadingMembers} />
              </article>
            </div>
          )}

          {activeView === "engagement" && (
            <div className="space-y-6 pt-8">
              <SectionHeading eyebrow="Listening signals" title="Community engagement" description="Understand what your listeners save and return to." />
              <section className="grid gap-4 sm:grid-cols-3">
                <StatCard icon={<HiHeart className="text-xl" />} label="All-time saves" value={stats.totalLikes} detail="Likes recorded by the platform" tone="pink" />
                <StatCard icon={<HiMusicalNote className="text-xl" />} label="Unique tracks" value={stats.uniqueTracks} detail="Different tracks receiving saves" tone="sky" />
                <StatCard icon={<HiUserGroup className="text-xl" />} label="Active listeners" value={stats.activeUsers} detail="Accounts currently in good standing" tone="emerald" />
              </section>
              <section className="grid gap-6 xl:grid-cols-2">
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5 sm:p-6">
                  <SectionHeading eyebrow="Ranking" title="Most saved tracks" description="A real-time ranking across all member saves." />
                  <div className="mt-5 space-y-2">
                    {popularTracks.length ? popularTracks.map((track, index) => (
                      <div key={track._id} className="flex items-center gap-4 rounded-2xl border border-[var(--border)] p-4">
                        <span className="w-5 text-sm font-bold text-violet-300">{index + 1}</span>
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300"><HiMusicalNote /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{track.title}</p><p className="truncate text-xs text-[var(--text-secondary)]">{track.artist || "Unknown artist"}</p></div>
                        <div className="rounded-xl bg-fuchsia-500/10 px-3 py-2 text-right"><p className="text-sm font-bold text-fuchsia-200">{formatNumber(track.likes)}</p><p className="text-[11px] text-fuchsia-300">saves</p></div>
                      </div>
                    )) : <p className="py-10 text-center text-sm text-[var(--text-secondary)]">No saved music yet.</p>}
                  </div>
                </article>
                <article className="rounded-3xl border border-[var(--border)] bg-[var(--card)] p-5 shadow-xl shadow-black/5 sm:p-6">
                  <SectionHeading eyebrow="Live feed" title="Latest saves" description="The most recent listening signals from your members." />
                  <div className="mt-5 divide-y divide-[var(--border)]">
                    {recentLikes.length ? recentLikes.map((like) => (
                      <div key={like._id} className="flex items-center gap-3 py-3.5">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300"><HiHeart /></div>
                        <div className="min-w-0 flex-1"><p className="truncate text-sm font-semibold">{like.title}</p><p className="truncate text-xs text-[var(--text-secondary)]">{like.artist || "Unknown artist"}</p></div>
                        <div className="max-w-[130px] text-right"><p className="truncate text-xs text-[var(--text-secondary)]">{like.user?.name || "Deleted member"}</p><p className="mt-1 text-[11px] text-[var(--text-muted)]">{formatDateTime(like.createdAt)}</p></div>
                      </div>
                    )) : <p className="py-10 text-center text-sm text-[var(--text-secondary)]">No saved music yet.</p>}
                  </div>
                </article>
              </section>
            </div>
          )}

          {activeView === "manage" && (
            <div className="pt-8">
              <ManagementWorkspace onDataChanged={loadDashboard} />
            </div>
          )}

          {activeView === "activity" && (
            <div className="space-y-6 pt-8">
              <SectionHeading eyebrow="Audit trail" title="Administration activity" description="Every role and account status update is recorded with its administrator." />
              <article className="overflow-hidden rounded-3xl border border-[var(--border)] bg-[var(--card)] shadow-xl shadow-black/5">
                <div className="px-5 py-4 text-sm text-[var(--text-secondary)]"><span className="font-semibold text-[var(--text-primary)]">{formatNumber(activityPagination.total)}</span> recorded admin actions</div>
                <div className="divide-y divide-[var(--border)] px-5">
                  {loadingActivity ? <div className="flex items-center gap-3 py-10 text-sm text-[var(--text-secondary)]"><HiArrowPath className="animate-spin text-violet-300" />Loading activity…</div> : activity.length ? activity.map((entry) => <ActivityItem key={entry._id} activity={entry} />) : <p className="py-12 text-center text-sm text-[var(--text-secondary)]">No admin actions have been recorded yet.</p>}
                </div>
                <Pagination pagination={activityPagination} onPageChange={changeActivityPage} loading={loadingActivity} />
              </article>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;
