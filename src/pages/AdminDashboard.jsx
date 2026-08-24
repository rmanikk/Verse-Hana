import { useCallback, useEffect, useState } from "react";
import { API_URL } from "../config/api";
import { Link } from "react-router-dom";
import {
  HiArrowLeft,
  HiArrowPath,
  HiBars3,
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
  HiXMark,
} from "react-icons/hi2";

import {
  ResponsiveContainer,
  AreaChart,
  Area,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts";

import { useAuth } from "../context/AuthContext";
import ManagementWorkspace from "../components/admin/ManagementWorkspace";



const navigation = [
  { id: "overview", label: "Overview", icon: HiSquares2X2 },
  { id: "members", label: "Members", icon: HiUserGroup },
  { id: "manage", label: "Manage data", icon: HiQueueList },
  { id: "engagement", label: "Engagement", icon: HiChartBar },
  { id: "activity", label: "Activity log", icon: HiClock },
];

const emptyPagination = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

const formatNumber = (value) =>
  new Intl.NumberFormat("en").format(value || 0);

const formatDate = (value) => {
  if (!value) return "—";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const formatDateTime = (value) => {
  if (!value) return "Just now";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
};

const getInitial = (name) =>
  name?.trim().charAt(0).toUpperCase() || "U";

const getResponseData = async (response) => {
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(
      data.message || "Something went wrong. Please try again."
    );
  }

  return data;
};

/* -------------------------------------------------------------------------- */
/*                                   UI                                       */
/* -------------------------------------------------------------------------- */

function UserAvatar({ name, size = "md" }) {
  const sizeClasses =
    size === "sm" ? "h-8 w-8 text-xs" : "h-10 w-10 text-sm";

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-fuchsia-500 font-bold text-white ${sizeClasses}`}
    >
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
      <span
        className={`h-1.5 w-1.5 rounded-full ${
          isSuspended ? "bg-red-400" : "bg-emerald-400"
        }`}
      />
      {isSuspended ? "Suspended" : "Active"}
    </span>
  );
}

function StatCard({
  icon,
  label,
  value,
  detail,
  tone = "violet",
}) {
  const tones = {
    violet:
      "border-violet-500/20 bg-violet-500/10 text-violet-300",
    sky: "border-sky-500/20 bg-sky-500/10 text-sky-300",
    pink:
      "border-fuchsia-500/20 bg-fuchsia-500/10 text-fuchsia-300",
    emerald:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  };

  return (
    <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-[var(--text-secondary)] sm:text-sm">
            {label}
          </p>

          <p className="mt-1.5 text-2xl font-bold tracking-tight sm:mt-2 sm:text-3xl">
            {formatNumber(value)}
          </p>

          <p className="mt-1.5 line-clamp-2 text-[11px] leading-4 text-[var(--text-muted)] sm:mt-2 sm:text-xs">
            {detail}
          </p>
        </div>

        <div
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border sm:h-11 sm:w-11 sm:rounded-2xl ${tones[tone]}`}
        >
          {icon}
        </div>
      </div>
    </article>
  );
}

function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {eyebrow && (
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-violet-300 sm:text-xs">
            {eyebrow}
          </p>
        )}

        <h2 className="mt-1 text-xl font-bold tracking-tight sm:text-2xl">
          {title}
        </h2>

        {description && (
          <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-secondary)] sm:mt-2 sm:text-sm">
            {description}
          </p>
        )}
      </div>

      {action}
    </div>
  );
}

function Pagination({
  pagination,
  onPageChange,
  loading,
}) {
  if (pagination.totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between border-t border-[var(--border)] px-4 py-3 text-xs text-[var(--text-secondary)] sm:px-5 sm:py-4 sm:text-sm">
      <span>
        Page {pagination.page} of {pagination.totalPages}
      </span>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onPageChange(pagination.page - 1)}
          disabled={pagination.page === 1 || loading}
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
          aria-label="Previous page"
        >
          <HiChevronLeft />
        </button>

        <button
          type="button"
          onClick={() => onPageChange(pagination.page + 1)}
          disabled={
            pagination.page >= pagination.totalPages || loading
          }
          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-[var(--border)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:cursor-not-allowed disabled:opacity-40 sm:h-9 sm:w-9"
          aria-label="Next page"
        >
          <HiChevronRight />
        </button>
      </div>
    </div>
  );
}

function ActivityItem({ activity }) {
  const isRoleChange =
    activity.action === "user.role_changed";

  const isCreate =
    activity.action === "user.created";

  const isDelete =
    activity.action === "user.deleted";

  const actorName =
    activity.actor?.name || "An administrator";

  const targetName =
    activity.targetUser?.name ||
    activity.targetName ||
    "a member";

  if (isCreate) {
    return (
      <div className="flex gap-3 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-300">
          <HiUserGroup />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6">
            <span className="font-semibold">{actorName}</span>{" "}
            created the account for{" "}
            <span className="font-semibold">{targetName}</span>.
          </p>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {formatDateTime(activity.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  if (isDelete) {
    return (
      <div className="flex gap-3 py-4">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-red-500/10 text-red-300">
          <HiNoSymbol />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-sm leading-6">
            <span className="font-semibold">{actorName}</span>{" "}
            deleted{" "}
            <span className="font-semibold">{targetName}</span>.
          </p>

          <p className="mt-1 text-xs text-[var(--text-muted)]">
            {formatDateTime(activity.createdAt)}
          </p>
        </div>
      </div>
    );
  }

  const field = isRoleChange ? "role" : "account status";

  return (
    <div className="flex gap-3 py-4">
      <div
        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
          isRoleChange
            ? "bg-violet-500/10 text-violet-300"
            : "bg-amber-500/10 text-amber-300"
        }`}
      >
        {isRoleChange ? <HiShieldCheck /> : <HiNoSymbol />}
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-sm leading-6">
          <span className="font-semibold">{actorName}</span>{" "}
          changed{" "}
          <span className="font-semibold">{targetName}</span>
          's {field} from{" "}
          <span className="font-medium text-[var(--text-secondary)]">
            {activity.previousValue}
          </span>{" "}
          to{" "}
          <span className="font-medium text-violet-300">
            {activity.nextValue}
          </span>
          .
        </p>

        <p className="mt-1 text-xs text-[var(--text-muted)]">
          {formatDateTime(activity.createdAt)}
        </p>
      </div>
    </div>
  );
}

function ActivityAnalytics({
  analytics,
  loading,
}) {
  const data = analytics?.daily || [];

  return (
    <section className="space-y-4">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        <StatCard
          icon={<HiChartBar className="text-lg sm:text-xl" />}
          label="Total actions"
          value={analytics?.totalActions || 0}
          detail="Recorded administration actions"
        />

        <StatCard
          icon={<HiClock className="text-lg sm:text-xl" />}
          label="Last 7 days"
          value={analytics?.last7Days || 0}
          detail="Administrative actions"
          tone="sky"
        />

        <StatCard
          icon={<HiShieldCheck className="text-lg sm:text-xl" />}
          label="Today"
          value={analytics?.today || 0}
          detail="Actions recorded today"
          tone="emerald"
        />
      </div>

      <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
        <SectionHeading
          eyebrow="Analytics"
          title="Admin activity over time"
          description="A 30-day view of administrative activity."
        />

        <div className="mt-5 h-[260px] sm:mt-6 sm:h-[320px]">
          {loading ? (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
              <HiArrowPath className="mr-2 animate-spin text-violet-300" />
              Loading analytics…
            </div>
          ) : data.length ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 10,
                  left: -20,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient
                    id="activityGradient"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor="#8b5cf6"
                      stopOpacity={0.45}
                    />
                    <stop
                      offset="100%"
                      stopColor="#8b5cf6"
                      stopOpacity={0}
                    />
                  </linearGradient>
                </defs>

                <CartesianGrid
                  stroke="var(--border)"
                  strokeDasharray="3 3"
                  vertical={false}
                />

                <XAxis
                  dataKey="label"
                  tick={{
                    fill: "var(--text-muted)",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <YAxis
                  allowDecimals={false}
                  tick={{
                    fill: "var(--text-muted)",
                    fontSize: 10,
                  }}
                  axisLine={false}
                  tickLine={false}
                />

                <Tooltip
                  contentStyle={{
                    background: "var(--card)",
                    border: "1px solid var(--border)",
                    borderRadius: "14px",
                    color: "var(--text-primary)",
                  }}
                  labelStyle={{
                    color: "var(--text-secondary)",
                  }}
                  formatter={(value) => [value, "Actions"]}
                />

                <Area
                  type="monotone"
                  dataKey="count"
                  stroke="#8b5cf6"
                  strokeWidth={3}
                  fill="url(#activityGradient)"
                  activeDot={{ r: 6 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex h-full items-center justify-center text-sm text-[var(--text-secondary)]">
              No activity data available yet.
            </div>
          )}
        </div>
      </article>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*                              ADMIN DASHBOARD                               */
/* -------------------------------------------------------------------------- */

function AdminDashboard() {
  const { user } = useAuth();

  const [activeView, setActiveView] = useState("overview");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [dashboard, setDashboard] = useState(null);
  const [members, setMembers] = useState([]);
  const [memberPagination, setMemberPagination] =
    useState(emptyPagination);

  const [memberFilters, setMemberFilters] = useState({
    search: "",
    role: "",
    status: "",
  });

  const [activity, setActivity] = useState([]);
  const [activityPagination, setActivityPagination] =
    useState(emptyPagination);

  const [activityAnalytics, setActivityAnalytics] =
    useState(null);

  const [activityLoaded, setActivityLoaded] = useState(false);

  const [loading, setLoading] = useState(true);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [loadingActivity, setLoadingActivity] = useState(false);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);

  const [updatingKey, setUpdatingKey] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDashboard = useCallback(async () => {
    const response = await fetch(
      `${API_URL}/api/admin/dashboard`,
      {
        credentials: "include",
      }
    );

    const data = await getResponseData(response);
    setDashboard(data);
  }, []);

  const loadMembers = useCallback(
    async ({
      page = 1,
      search = "",
      role = "",
      status = "",
    } = {}) => {
      setLoadingMembers(true);

      try {
        const params = new URLSearchParams({
          page: String(page),
          limit: "10",
        });

        if (search.trim()) {
          params.set("search", search.trim());
        }

        if (role) params.set("role", role);
        if (status) params.set("status", status);

        const response = await fetch(
          `${API_URL}/api/admin/users?${params}`,
          {
            credentials: "include",
          }
        );

        const data = await getResponseData(response);

        setMembers(data.users || []);
        setMemberPagination(
          data.pagination || emptyPagination
        );
      } finally {
        setLoadingMembers(false);
      }
    },
    []
  );

  const loadActivity = useCallback(async (page = 1) => {
    setLoadingActivity(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/activity?page=${page}&limit=15`,
        {
          credentials: "include",
        }
      );

      const data = await getResponseData(response);

      setActivity(data.activity || []);

      setActivityPagination(
        data.pagination || emptyPagination
      );

      setActivityLoaded(true);
    } finally {
      setLoadingActivity(false);
    }
  }, []);

  const loadActivityAnalytics = useCallback(async () => {
    setLoadingAnalytics(true);

    try {
      const response = await fetch(
        `${API_URL}/api/admin/activity/analytics`,
        {
          credentials: "include",
        }
      );

      const data = await getResponseData(response);
      setActivityAnalytics(data);
    } finally {
      setLoadingAnalytics(false);
    }
  }, []);

  useEffect(() => {
    const loadWorkspace = async () => {
      setLoading(true);
      setError("");

      try {
        await Promise.all([
          loadDashboard(),
          loadMembers(),
        ]);
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

    // Close mobile navigation after selecting a page
    setMobileMenuOpen(false);

    setError("");
    setNotice("");

    if (view === "activity") {
      try {
        await Promise.all([
          activityLoaded
            ? Promise.resolve()
            : loadActivity(),
          loadActivityAnalytics(),
        ]);
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

        loadMembers({
          ...memberFilters,
          page: memberPagination.page,
        }),

        activeView === "activity"
          ? loadActivity(activityPagination.page)
          : Promise.resolve(),

        activeView === "activity"
          ? loadActivityAnalytics()
          : Promise.resolve(),
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
      await loadMembers({
        ...memberFilters,
        page: 1,
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const resetMemberFilters = async () => {
    const filters = {
      search: "",
      role: "",
      status: "",
    };

    setMemberFilters(filters);
    setError("");
    setNotice("");

    try {
      await loadMembers({
        ...filters,
        page: 1,
      });
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  const changeMemberPage = async (page) => {
    try {
      await loadMembers({
        ...memberFilters,
        page,
      });
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

  const updateMember = async (
    member,
    field,
    nextValue
  ) => {
    if (member[field] === nextValue) return;

    if (
      field === "status" &&
      nextValue === "suspended"
    ) {
      const approved = window.confirm(
        `Suspend ${member.name}? They will no longer be able to sign in.`
      );

      if (!approved) return;
    }

    const actionKey = `${member._id}-${field}`;

    setUpdatingKey(actionKey);
    setError("");
    setNotice("");

    try {
      const response = await fetch(
        `${API_URL}/api/admin/users/${member._id}/${field}`,
        {
          method: "PATCH",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            [field]: nextValue,
          }),
        }
      );

      const data = await getResponseData(response);

      setMembers((currentMembers) =>
        currentMembers.map((currentMember) =>
          currentMember._id === data.user._id
            ? data.user
            : currentMember
        )
      );

      setNotice(
        `${data.user.name}'s ${field} was updated.`
      );

      await Promise.all([
        loadDashboard(),

        activityLoaded
          ? loadActivity(activityPagination.page)
          : Promise.resolve(),

        activeView === "activity"
          ? loadActivityAnalytics()
          : Promise.resolve(),
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
      <main className="flex min-h-screen items-center justify-center bg-[var(--background)] px-4 text-[var(--text-primary)]">
        <div className="flex items-center gap-3 text-sm text-[var(--text-secondary)]">
          <HiArrowPath className="animate-spin text-lg text-violet-400" />
          Loading the admin workspace…
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen overflow-x-hidden bg-[var(--background)] text-[var(--text-primary)]">
      <div className="mx-auto flex min-h-screen max-w-[1600px] flex-col lg:flex-row">

        {/* ---------------------------------------------------------------- */}
        {/* DESKTOP SIDEBAR                                                  */}
        {/* ---------------------------------------------------------------- */}

        <aside className="hidden border-r border-[var(--border)] bg-[var(--surface)]/65 lg:flex lg:w-64 lg:shrink-0 lg:flex-col lg:px-5 lg:py-7">
          
          {/* BRAND - NOT CLICKABLE */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-lg text-white shadow-lg shadow-violet-500/20">
              <HiMusicalNote />
            </div>

            <div>
              <p className="font-bold tracking-tight">
                VerseHana
              </p>

              <p className="text-xs text-violet-300">
                Admin console
              </p>
            </div>
          </div>

          <Link
            to="/dashboard"
            className="mt-8 inline-flex items-center gap-2 text-xs font-medium text-[var(--text-secondary)] transition hover:text-violet-300"
          >
            <HiArrowLeft />
            Back to app
          </Link>

          <nav className="mt-9 flex flex-col gap-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => showView(item.id)}
                  className={`flex items-center gap-3 rounded-xl px-3.5 py-3 text-left text-sm font-semibold transition ${
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

          <div className="mt-auto flex items-center gap-3 border-t border-[var(--border)] pt-5">
            <UserAvatar
              name={user?.name}
              size="sm"
            />

            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">
                {user?.name}
              </p>

              <p className="truncate text-xs text-[var(--text-muted)]">
                {user?.email}
              </p>
            </div>
          </div>
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* MOBILE HEADER + HAMBURGER                                       */}
        {/* ---------------------------------------------------------------- */}

        <div className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--surface)]/95 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6">

            {/* BRAND - NOT CLICKABLE */}
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-fuchsia-500 text-white shadow-lg shadow-violet-500/20">
                <HiMusicalNote />
              </div>

              <div>
                <p className="text-sm font-bold tracking-tight">
                  VerseHana
                </p>

                <p className="text-[10px] text-violet-300">
                  Admin console
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--card)] text-xl transition hover:border-violet-500/40 hover:text-violet-300"
              aria-label={
                mobileMenuOpen
                  ? "Close navigation"
                  : "Open navigation"
              }
              aria-expanded={mobileMenuOpen}
            >
              {mobileMenuOpen ? <HiXMark /> : <HiBars3 />}
            </button>
          </div>

          {/* MOBILE NAVIGATION */}
          {mobileMenuOpen && (
            <div className="border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 sm:px-6">
              <nav className="grid gap-2 sm:grid-cols-2">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive =
                    activeView === item.id;

                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => showView(item.id)}
                      className={`flex items-center gap-3 rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
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

              <div className="mt-3 flex items-center justify-between border-t border-[var(--border)] pt-3">
                <div className="flex min-w-0 items-center gap-3">
                  <UserAvatar
                    name={user?.name}
                    size="sm"
                  />

                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {user?.name}
                    </p>

                    <p className="truncate text-xs text-[var(--text-muted)]">
                      {user?.email}
                    </p>
                  </div>
                </div>

                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold text-[var(--text-secondary)] hover:bg-violet-500/10 hover:text-violet-300"
                >
                  <HiArrowLeft />
                  Back
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* MAIN CONTENT                                                     */}
        {/* ---------------------------------------------------------------- */}

        <section className="min-w-0 flex-1 px-4 py-5 sm:px-6 sm:py-7 lg:px-10 lg:py-9">

          {/* PAGE HEADER */}
          <header className="flex flex-col gap-4 border-b border-[var(--border)] pb-5 sm:flex-row sm:items-start sm:justify-between sm:pb-6">
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-violet-300 sm:text-xs">
                <HiShieldCheck className="text-sm" />
                Secure workspace
              </div>

              <h1 className="mt-1.5 text-2xl font-bold tracking-tight sm:mt-2 sm:text-3xl lg:text-4xl">
                {
                  navigation.find(
                    (item) => item.id === activeView
                  )?.label
                }
              </h1>

              <p className="mt-1.5 max-w-2xl text-xs leading-5 text-[var(--text-secondary)] sm:mt-2 sm:text-sm">
                Manage your community with live data from VerseHana.
              </p>
            </div>

            <button
              type="button"
              onClick={refreshWorkspace}
              disabled={loading}
              className="inline-flex w-full shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-4 py-2.5 text-xs font-semibold transition hover:border-violet-500/40 hover:bg-violet-500/10 disabled:cursor-wait disabled:opacity-60 sm:w-auto sm:text-sm"
            >
              <HiArrowPath
                className={loading ? "animate-spin" : ""}
              />
              Refresh data
            </button>
          </header>

          {/* ALERTS */}
          {error && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 px-3.5 py-3 text-xs text-red-100 sm:mt-6 sm:rounded-2xl sm:px-4 sm:text-sm">
              <HiExclamationTriangle className="mt-0.5 shrink-0 text-lg text-red-400" />
              <p>{error}</p>
            </div>
          )}

          {notice && (
            <div className="mt-4 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3.5 py-3 text-xs text-emerald-100 sm:mt-6 sm:rounded-2xl sm:px-4 sm:text-sm">
              <HiCheckCircle className="mt-0.5 shrink-0 text-lg text-emerald-400" />
              <p>{notice}</p>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* OVERVIEW                                                         */}
          {/* ---------------------------------------------------------------- */}

          {activeView === "overview" && (
            <div className="space-y-6 pt-6 sm:space-y-8 sm:pt-8">

              {/* HERO */}
              <section className="relative overflow-hidden rounded-2xl border border-violet-500/20 bg-gradient-to-br from-violet-600/20 via-[var(--card)] to-fuchsia-600/10 p-5 sm:rounded-[28px] sm:p-8">
                <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-fuchsia-500/15 blur-3xl sm:h-56 sm:w-56" />

                <div className="relative flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between sm:gap-5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-violet-200 sm:text-sm">
                      Welcome back, {user?.name || "Admin"}.
                    </p>

                    <h2 className="mt-1.5 max-w-xl text-xl font-bold tracking-tight sm:mt-2 sm:text-3xl">
                      Your community is ready for a closer look.
                    </h2>

                    <p className="mt-2 max-w-2xl text-xs leading-5 text-[var(--text-secondary)] sm:mt-3 sm:text-sm sm:leading-6">
                      Review people, track listening engagement, and keep a clear record of every admin action.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => showView("members")}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-zinc-900 transition hover:scale-[1.02] sm:text-sm"
                  >
                    <HiUserGroup />
                    Manage members
                  </button>
                </div>
              </section>

              {/* STATS — 2 COLUMNS ON MOBILE */}
              <section className="space-y-3 sm:space-y-4">
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

                  <StatCard
                    icon={<HiUserGroup className="text-lg sm:text-xl" />}
                    label="Total members"
                    value={stats.totalUsers}
                    detail={`${formatNumber(stats.activeUsers)} active accounts`}
                  />

                  <StatCard
                    icon={<HiShieldCheck className="text-lg sm:text-xl" />}
                    label="Administrators"
                    value={stats.adminUsers}
                    detail="Protected workspace access"
                    tone="sky"
                  />

                  <StatCard
                    icon={<HiHeart className="text-lg sm:text-xl" />}
                    label="Songs saved"
                    value={stats.totalLikes}
                    detail={`${formatNumber(stats.uniqueTracks)} unique tracks`}
                    tone="pink"
                  />

                  <StatCard
                    icon={<HiNoSymbol className="text-lg sm:text-xl" />}
                    label="Suspended"
                    value={stats.suspendedUsers}
                    detail="Accounts currently suspended"
                    tone="emerald"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-4">

                  <StatCard
                    icon={<HiCheckCircle className="text-lg sm:text-xl" />}
                    label="Active accounts"
                    value={stats.activeUsers}
                    detail="Members able to use VerseHana"
                    tone="emerald"
                  />

                  <StatCard
                    icon={<HiNoSymbol className="text-lg sm:text-xl" />}
                    label="Needs review"
                    value={stats.suspendedUsers}
                    detail="Suspended accounts"
                  />

                  <StatCard
                    icon={<HiMusicalNote className="text-lg sm:text-xl" />}
                    label="Unique tracks"
                    value={stats.uniqueTracks}
                    detail="Different saved tracks"
                    tone="sky"
                  />

                  <StatCard
                    icon={<HiClock className="text-lg sm:text-xl" />}
                    label="Admin activity"
                    value={recentActivity.length}
                    detail="Latest visible actions"
                    tone="violet"
                  />
                </div>
              </section>

              {/* POPULAR + MEMBERS */}
              <section className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">

                <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
                  <SectionHeading
                    eyebrow="Engagement"
                    title="Popular saved tracks"
                    description="Most frequently saved by your community."
                    action={
                      <button
                        type="button"
                        onClick={() => showView("engagement")}
                        className="text-xs font-semibold text-violet-300 transition hover:text-violet-200 sm:text-sm"
                      >
                        View all
                      </button>
                    }
                  />

                  <div className="mt-4 divide-y divide-[var(--border)] sm:mt-5">
                    {popularTracks.length ? (
                      popularTracks
                        .slice(0, 5)
                        .map((track, index) => (
                          <div
                            key={track._id}
                            className="flex items-center gap-3 py-3 sm:gap-4"
                          >
                            <span className="w-4 text-xs font-bold text-[var(--text-muted)] sm:w-5 sm:text-sm">
                              {index + 1}
                            </span>

                            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-fuchsia-500/10 text-fuchsia-300 sm:h-10 sm:w-10">
                              <HiMusicalNote />
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="truncate text-xs font-semibold sm:text-sm">
                                {track.title}
                              </p>

                              <p className="truncate text-[11px] text-[var(--text-secondary)] sm:text-xs">
                                {track.artist || "Unknown artist"}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs font-bold sm:text-sm">
                                {formatNumber(track.likes)}
                              </p>

                              <p className="text-[10px] text-[var(--text-muted)] sm:text-xs">
                                saves
                              </p>
                            </div>
                          </div>
                        ))
                    ) : (
                      <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                        Saved tracks will appear here as your community listens.
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
                  <SectionHeading
                    eyebrow="Access"
                    title="Newest members"
                    description="Recently created VerseHana accounts."
                    action={
                      <button
                        type="button"
                        onClick={() => showView("members")}
                        className="text-xs font-semibold text-violet-300 transition hover:text-violet-200 sm:text-sm"
                      >
                        Review
                      </button>
                    }
                  />

                  <div className="mt-4 space-y-3 sm:mt-5 sm:space-y-4">
                    {recentUsers.length ? (
                      recentUsers.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center gap-3"
                        >
                          <UserAvatar
                            name={member.name}
                            size="sm"
                          />

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold sm:text-sm">
                              {member.name}
                            </p>

                            <p className="truncate text-[11px] text-[var(--text-secondary)] sm:text-xs">
                              Joined {formatDate(member.createdAt)}
                            </p>
                          </div>

                          <StatusBadge status={member.status} />
                        </div>
                      ))
                    ) : (
                      <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                        No members yet.
                      </p>
                    )}
                  </div>
                </article>
              </section>

              {/* ACTIVITY */}
              <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
                <SectionHeading
                  eyebrow="Audit trail"
                  title="Recent administration activity"
                  description="Role and account access changes are recorded here."
                  action={
                    <button
                      type="button"
                      onClick={() => showView("activity")}
                      className="text-xs font-semibold text-violet-300 transition hover:text-violet-200 sm:text-sm"
                    >
                      Open activity log
                    </button>
                  }
                />

                <div className="mt-3 divide-y divide-[var(--border)] sm:mt-4">
                  {recentActivity.length ? (
                    recentActivity.map((entry) => (
                      <ActivityItem
                        key={entry._id}
                        activity={entry}
                      />
                    ))
                  ) : (
                    <p className="py-8 text-center text-sm text-[var(--text-secondary)]">
                      Changes you make to roles or account status will appear here.
                    </p>
                  )}
                </div>
              </article>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* MEMBERS                                                          */}
          {/* ---------------------------------------------------------------- */}

          {activeView === "members" && (
            <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
              <SectionHeading
                eyebrow="Member directory"
                title="Manage people and access"
                description="Promote trusted teammates, or suspend accounts when action is needed."
              />

              <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg shadow-black/5 sm:rounded-3xl">

                <form
                  onSubmit={applyMemberFilters}
                  className="grid gap-2.5 border-b border-[var(--border)] p-4 sm:gap-3 sm:p-5 lg:grid-cols-[minmax(0,1fr)_150px_160px_auto_auto]"
                >
                  <div className="relative">
                    <HiMagnifyingGlass className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-lg text-[var(--text-muted)]" />

                    <input
                      value={memberFilters.search}
                      onChange={(event) =>
                        setMemberFilters((current) => ({
                          ...current,
                          search: event.target.value,
                        }))
                      }
                      placeholder="Search name or email"
                      className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] py-2.5 pl-10 pr-3 text-xs outline-none transition placeholder:text-[var(--text-muted)] focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 sm:text-sm"
                    />
                  </div>

                  <select
                    value={memberFilters.role}
                    onChange={(event) =>
                      setMemberFilters((current) => ({
                        ...current,
                        role: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs outline-none focus:border-violet-500 sm:text-sm"
                  >
                    <option value="">All roles</option>
                    <option value="admin">Admins</option>
                    <option value="user">Members</option>
                  </select>

                  <select
                    value={memberFilters.status}
                    onChange={(event) =>
                      setMemberFilters((current) => ({
                        ...current,
                        status: event.target.value,
                      }))
                    }
                    className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2.5 text-xs outline-none focus:border-violet-500 sm:text-sm"
                  >
                    <option value="">All statuses</option>
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                  </select>

                  <button
                    type="submit"
                    disabled={loadingMembers}
                    className="rounded-xl bg-violet-600 px-4 py-2.5 text-xs font-semibold text-white transition hover:bg-violet-500 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
                  >
                    Apply
                  </button>

                  <button
                    type="button"
                    onClick={resetMemberFilters}
                    disabled={loadingMembers}
                    className="rounded-xl border border-[var(--border)] px-4 py-2.5 text-xs font-semibold text-[var(--text-secondary)] transition hover:border-violet-500/40 hover:text-violet-300 disabled:opacity-60 sm:text-sm"
                  >
                    Reset
                  </button>
                </form>

                <div className="flex items-center justify-between px-4 py-3 sm:px-5 sm:py-4">
                  <p className="text-xs text-[var(--text-secondary)] sm:text-sm">
                    <span className="font-semibold text-[var(--text-primary)]">
                      {formatNumber(memberPagination.total)}
                    </span>{" "}
                    matching members
                  </p>

                  {loadingMembers && (
                    <span className="inline-flex items-center gap-2 text-[11px] text-violet-300 sm:text-xs">
                      <HiArrowPath className="animate-spin" />
                      Updating
                    </span>
                  )}
                </div>

                <div className="overflow-x-auto">
                  <table className="min-w-[820px] w-full border-collapse text-left">
                    <thead className="border-y border-[var(--border)] bg-[var(--surface)]/70 text-[10px] uppercase tracking-wider text-[var(--text-muted)] sm:text-xs">
                      <tr>
                        <th className="px-5 py-3 font-semibold">
                          Member
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          Joined
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          Role
                        </th>
                        <th className="px-5 py-3 font-semibold">
                          Status
                        </th>
                        <th className="px-5 py-3 text-right font-semibold">
                          Actions
                        </th>
                      </tr>
                    </thead>

                    <tbody className="divide-y divide-[var(--border)]">
                      {members.length ? (
                        members.map((member) => {
                          const isCurrentUser =
                            member._id === user?.id;

                          const changingRole =
                            updatingKey ===
                            `${member._id}-role`;

                          const changingStatus =
                            updatingKey ===
                            `${member._id}-status`;

                          return (
                            <tr
                              key={member._id}
                              className="transition hover:bg-violet-500/[0.03]"
                            >
                              <td className="px-5 py-4">
                                <div className="flex items-center gap-3">
                                  <UserAvatar
                                    name={member.name}
                                  />

                                  <div className="min-w-0">
                                    <div className="flex items-center gap-2">
                                      <p className="max-w-[190px] truncate text-sm font-semibold">
                                        {member.name}
                                      </p>

                                      {isCurrentUser && (
                                        <span className="text-xs text-violet-300">
                                          You
                                        </span>
                                      )}
                                    </div>

                                    <p className="max-w-[230px] truncate text-xs text-[var(--text-secondary)]">
                                      {member.email}
                                    </p>
                                  </div>
                                </div>
                              </td>

                              <td className="px-5 py-4 text-sm text-[var(--text-secondary)]">
                                {formatDate(member.createdAt)}
                              </td>

                              <td className="px-5 py-4">
                                <RoleBadge role={member.role} />
                              </td>

                              <td className="px-5 py-4">
                                <StatusBadge status={member.status} />
                              </td>

                              <td className="px-5 py-4">
                                {isCurrentUser ? (
                                  <p className="text-right text-xs text-[var(--text-muted)]">
                                    Your access is protected
                                  </p>
                                ) : (
                                  <div className="flex justify-end gap-2">
                                    <select
                                      value={member.role}
                                      onChange={(event) =>
                                        updateMember(
                                          member,
                                          "role",
                                          event.target.value
                                        )
                                      }
                                      disabled={
                                        changingRole ||
                                        changingStatus
                                      }
                                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-semibold outline-none focus:border-violet-500 disabled:cursor-wait disabled:opacity-60"
                                    >
                                      <option value="user">
                                        Member
                                      </option>
                                      <option value="admin">
                                        Admin
                                      </option>
                                    </select>

                                    <select
                                      value={member.status}
                                      onChange={(event) =>
                                        updateMember(
                                          member,
                                          "status",
                                          event.target.value
                                        )
                                      }
                                      disabled={
                                        changingRole ||
                                        changingStatus
                                      }
                                      className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-2 text-xs font-semibold outline-none focus:border-violet-500 disabled:cursor-wait disabled:opacity-60"
                                    >
                                      <option value="active">
                                        Active
                                      </option>
                                      <option value="suspended">
                                        Suspend
                                      </option>
                                    </select>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td
                            colSpan="5"
                            className="px-5 py-12 text-center text-sm text-[var(--text-secondary)]"
                          >
                            No members match these filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <Pagination
                  pagination={memberPagination}
                  onPageChange={changeMemberPage}
                  loading={loadingMembers}
                />
              </article>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ENGAGEMENT                                                       */}
          {/* ---------------------------------------------------------------- */}

          {activeView === "engagement" && (
            <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
              <SectionHeading
                eyebrow="Listening signals"
                title="Community engagement"
                description="Understand what your listeners save and return to."
              />

              <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
                <StatCard
                  icon={<HiHeart className="text-lg sm:text-xl" />}
                  label="All-time saves"
                  value={stats.totalLikes}
                  detail="Likes recorded by the platform"
                  tone="pink"
                />

                <StatCard
                  icon={<HiMusicalNote className="text-lg sm:text-xl" />}
                  label="Unique tracks"
                  value={stats.uniqueTracks}
                  detail="Different tracks receiving saves"
                  tone="sky"
                />

                <StatCard
                  icon={<HiUserGroup className="text-lg sm:text-xl" />}
                  label="Active listeners"
                  value={stats.activeUsers}
                  detail="Accounts currently in good standing"
                  tone="emerald"
                />
              </section>

              <section className="grid gap-5 xl:grid-cols-2">
                <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
                  <SectionHeading
                    eyebrow="Ranking"
                    title="Most saved tracks"
                    description="A real-time ranking across all member saves."
                  />

                  <div className="mt-4 space-y-2 sm:mt-5">
                    {popularTracks.length ? (
                      popularTracks.map((track, index) => (
                        <div
                          key={track._id}
                          className="flex items-center gap-3 rounded-2xl border border-[var(--border)] p-3 sm:gap-4 sm:p-4"
                        >
                          <span className="w-5 text-xs font-bold text-violet-300 sm:text-sm">
                            {index + 1}
                          </span>

                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10 text-violet-300 sm:h-10 sm:w-10">
                            <HiMusicalNote />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold sm:text-sm">
                              {track.title}
                            </p>

                            <p className="truncate text-[11px] text-[var(--text-secondary)] sm:text-xs">
                              {track.artist || "Unknown artist"}
                            </p>
                          </div>

                          <div className="rounded-xl bg-fuchsia-500/10 px-2.5 py-1.5 text-right sm:px-3 sm:py-2">
                            <p className="text-xs font-bold text-fuchsia-200 sm:text-sm">
                              {formatNumber(track.likes)}
                            </p>

                            <p className="text-[10px] text-fuchsia-300">
                              saves
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-10 text-center text-sm text-[var(--text-secondary)]">
                        No saved music yet.
                      </p>
                    )}
                  </div>
                </article>

                <article className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-lg shadow-black/5 sm:rounded-3xl sm:p-6">
                  <SectionHeading
                    eyebrow="Live feed"
                    title="Latest saves"
                    description="The most recent listening signals from your members."
                  />

                  <div className="mt-4 divide-y divide-[var(--border)] sm:mt-5">
                    {recentLikes.length ? (
                      recentLikes.map((like) => (
                        <div
                          key={like._id}
                          className="flex items-center gap-3 py-3.5"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-pink-500/10 text-pink-300 sm:h-10 sm:w-10">
                            <HiHeart />
                          </div>

                          <div className="min-w-0 flex-1">
                            <p className="truncate text-xs font-semibold sm:text-sm">
                              {like.title}
                            </p>

                            <p className="truncate text-[11px] text-[var(--text-secondary)] sm:text-xs">
                              {like.artist || "Unknown artist"}
                            </p>
                          </div>

                          <div className="max-w-[110px] text-right sm:max-w-[130px]">
                            <p className="truncate text-[11px] text-[var(--text-secondary)] sm:text-xs">
                              {like.user?.name || "Deleted member"}
                            </p>

                            <p className="mt-1 text-[10px] text-[var(--text-muted)] sm:text-[11px]">
                              {formatDateTime(like.createdAt)}
                            </p>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="py-10 text-center text-sm text-[var(--text-secondary)]">
                        No saved music yet.
                      </p>
                    )}
                  </div>
                </article>
              </section>
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* MANAGE DATA                                                      */}
          {/* ---------------------------------------------------------------- */}

          {activeView === "manage" && (
            <div className="pt-6 sm:pt-8">
              <ManagementWorkspace
                onDataChanged={loadDashboard}
              />
            </div>
          )}

          {/* ---------------------------------------------------------------- */}
          {/* ACTIVITY                                                         */}
          {/* ---------------------------------------------------------------- */}

          {activeView === "activity" && (
            <div className="space-y-5 pt-6 sm:space-y-6 sm:pt-8">
              <SectionHeading
                eyebrow="Audit trail"
                title="Administration activity"
                description="Every role, account status, creation, update, and deletion is recorded with its administrator."
              />

              <ActivityAnalytics
                analytics={activityAnalytics}
                loading={loadingAnalytics}
              />

              <article className="overflow-hidden rounded-2xl border border-[var(--border)] bg-[var(--card)] shadow-lg shadow-black/5 sm:rounded-3xl">
                <div className="px-4 py-3 text-xs text-[var(--text-secondary)] sm:px-5 sm:py-4 sm:text-sm">
                  <span className="font-semibold text-[var(--text-primary)]">
                    {formatNumber(activityPagination.total)}
                  </span>{" "}
                  recorded admin actions
                </div>

                <div className="divide-y divide-[var(--border)] px-4 sm:px-5">
                  {loadingActivity ? (
                    <div className="flex items-center gap-3 py-10 text-sm text-[var(--text-secondary)]">
                      <HiArrowPath className="animate-spin text-violet-300" />
                      Loading activity…
                    </div>
                  ) : activity.length ? (
                    activity.map((entry) => (
                      <ActivityItem
                        key={entry._id}
                        activity={entry}
                      />
                    ))
                  ) : (
                    <p className="py-12 text-center text-sm text-[var(--text-secondary)]">
                      No admin actions have been recorded yet.
                    </p>
                  )}
                </div>

                <Pagination
                  pagination={activityPagination}
                  onPageChange={changeActivityPage}
                  loading={loadingActivity}
                />
              </article>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}

export default AdminDashboard;