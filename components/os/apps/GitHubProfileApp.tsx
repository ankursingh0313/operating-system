"use client";

import React, { useState, useMemo } from "react";
import { COLOR_PACKAGES, getSurfacePackage } from "@/lib/themes/colorPackages";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    setGitHubLoading,
    setGitHubData,
    setGitHubError,
    type GitHubData,
} from "@/lib/features/githubSlice";

import { IoIosStar, IoMdPeople, IoMdRefresh } from "react-icons/io";
import { MdArrowOutward } from "react-icons/md";

const LANGUAGE_COLORS: Record<string, string> = {
    Python: "#3572A5",
    JavaScript: "#f1e05a",
    TypeScript: "#3178c6",
    Java: "#b07219",
    HTML: "#e34c26",
    CSS: "#563d7c",
    Ruby: "#701516",
    Swift: "#F05138",
    C: "#555555",
    "C++": "#f34b7d",
    "C#": "#7355dd",
    Go: "#00ADD8",
    Rust: "#dea584",
    PHP: "#4F5D95",
    Shell: "#89e051",
    Kotlin: "#A97BFF",
};

interface WeeklyPoint {
    index: number;
    label: string;
    total: number;
}

export default function GitHubProfileApp() {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.github);
    const { accent, mode, hydrated } = useAppSelector((state) => state.theme);
    const { maximizedApps } = useAppSelector((state) => state.dock);

    const activeAccent = hydrated ? accent : "blue";
    const activeMode = hydrated ? mode : "dark";
    const isLight = activeMode === "light";

    const theme = COLOR_PACKAGES[activeAccent];
    const surface = getSurfacePackage(activeMode);
    const isFullscreen = maximizedApps.includes("github");

    const [hoveredPoint, setHoveredPoint] = useState<{
        point: WeeklyPoint;
        xPct: number;
        yPct: number;
    } | null>(null);

    const weeklyPoints = useMemo<WeeklyPoint[]>(() => {
        const weeks = data?.contributionCalendar?.weeks ?? [];
        return weeks.map((week, idx) => {
            const total = week.contributionDays.reduce(
                (sum, day) => sum + (day.contributionCount || 0),
                0,
            );
            const firstDate = week.contributionDays[0]?.date;
            const label = firstDate
                ? new Date(firstDate).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                  })
                : `W${idx + 1}`;
            return { index: idx, label, total };
        });
    }, [data]);

    const chartGeometry = useMemo(() => {
        const width = 320;
        const height = 136;
        const padX = 10;
        const padTop = 14;
        const padBottom = 18;
        const innerW = width - padX * 2;
        const innerH = height - padTop - padBottom;

        if (weeklyPoints.length === 0) {
            return {
                width,
                height,
                linePath: "",
                areaPath: "",
                maxVal: 0,
                coords: [] as Array<{
                    x: number;
                    y: number;
                    point: WeeklyPoint;
                }>,
            };
        }

        const maxVal = Math.max(1, ...weeklyPoints.map((p) => p.total));
        const stepX =
            weeklyPoints.length > 1 ? innerW / (weeklyPoints.length - 1) : 0;

        const coords = weeklyPoints.map((point, idx) => {
            const x = padX + idx * stepX;
            const y = padTop + innerH - (point.total / maxVal) * innerH;
            return { x, y, point };
        });

        const linePath = coords
            .map(
                (c, i) =>
                    `${i === 0 ? "M" : "L"} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`,
            )
            .join(" ");

        const last = coords[coords.length - 1];
        const first = coords[0];
        const baselineY = padTop + innerH;
        const areaPath = `${linePath} L ${last.x.toFixed(1)} ${baselineY} L ${first.x.toFixed(1)} ${baselineY} Z`;

        return { width, height, linePath, areaPath, maxVal, coords };
    }, [weeklyPoints]);

    const handleRefresh = async () => {
        if (loading) return;
        dispatch(setGitHubLoading());

        try {
            const res = await fetch("/api/github", { cache: "no-store" });
            if (!res.ok)
                throw new Error("Failed to load profile from GraphQL route");
            const resData: GitHubData = await res.json();
            dispatch(setGitHubData(resData));
        } catch (err: unknown) {
            const errorMessage =
                err instanceof Error
                    ? err.message
                    : "An unknown error occurred";
            dispatch(setGitHubError(errorMessage));
        }
    };

    const shellBg = isLight ? "bg-slate-50" : "bg-[#0d1117]";
    const panelBg = isLight ? "bg-white" : "bg-[#161b22]";
    const insetBg = isLight ? "bg-slate-100/90" : "bg-[#0d1117]";
    const cellBackingBg = isLight ? "bg-slate-200/80" : "bg-gray-900";
    const actionBtnClass = isLight
        ? "bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800"
        : "bg-[#21262d] hover:bg-[#30363d] border-gray-700 text-gray-200";
    const repoHoverClass = isLight ? "hover:bg-slate-50" : "hover:bg-[#1f242c]";

    if (loading || (!data && !error)) {
        return (
            <div
                className={`flex flex-col items-center justify-center h-full gap-3 py-20 ${shellBg}`}
            >
                <div
                    className={`w-6 h-6 border-2 border-t-transparent rounded-full animate-spin ${
                        isLight ? "border-slate-900/20" : "border-white/20"
                    }`}
                    style={{ borderTopColor: theme.rgb }}
                />
                <span className={`text-xs font-mono ${surface.textMuted}`}>
                    Loading GitHub profile &amp; contribution history...
                </span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div
                className={`flex flex-col items-center justify-center gap-3 h-full text-xs ${shellBg} p-6 ${
                    isLight ? "text-red-600" : "text-red-400"
                }`}
            >
                <span>⚠️ Error: {error || "No data returned"}</span>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className={`px-3 py-1 rounded-lg border transition cursor-pointer ${actionBtnClass}`}
                >
                    ↻ Retry
                </button>
            </div>
        );
    }

    const { user, contributionCalendar, repos } = data;
    const peakWeekly = Math.max(0, ...weeklyPoints.map((p) => p.total));
    const avgWeekly =
        weeklyPoints.length > 0
            ? (
                  weeklyPoints.reduce((acc, p) => acc + p.total, 0) /
                  weeklyPoints.length
              ).toFixed(1)
            : "0.0";

    const gradientId = `contrib-grad-${activeAccent}`;

    return (
        <div
            className={`flex flex-col md:flex-row h-full p-4 md:p-6 gap-6 overflow-hidden transition-colors duration-200 ${shellBg} ${surface.textPrimary}`}
        >
            {/* Left Sidebar: Profile Card */}
            <div className="flex flex-col w-full md:w-72 shrink-0 gap-4 overflow-y-auto">
                <div className="relative">
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className={`w-32 h-32 md:w-full md:h-auto aspect-square rounded-full border shadow-xl object-cover ${surface.border} ${
                            isLight ? "bg-slate-200" : "bg-gray-800"
                        }`}
                    />
                </div>

                <div>
                    <h1
                        className={`text-xl font-bold leading-tight ${surface.textPrimary}`}
                    >
                        {user.name}
                    </h1>
                    <p className={`text-sm font-light ${surface.textMuted}`}>
                        {user.login} · he/him
                    </p>
                    <p
                        className={`text-xs font-semibold mt-1 ${surface.textSecondary}`}
                    >
                        Full-stack software developer specializing in MERN
                        stack, Web3 systems, and high-throughput backend
                        architecture.
                    </p>
                </div>

                <p className={`text-xs leading-relaxed ${surface.textSecondary}`}>
                    {user.bio ||
                        "Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture."}
                </p>

                <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition flex items-center justify-center gap-1 cursor-pointer ${actionBtnClass}`}
                >
                    View on GitHub <MdArrowOutward className="text-sm" />
                </a>

                <div
                    className={`flex items-center gap-2 text-xs border-t pt-4 ${surface.textMuted} ${surface.borderSubtle}`}
                >
                    <span className="flex items-center gap-1">
                        <IoMdPeople /> {user.followers} followers
                    </span>
                    <span>·</span>
                    <span>{user.following} following</span>
                </div>
            </div>

            {/* Right Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-6 shrink-0">
                    {/* Contribution Calendar + Fullscreen Line Chart Row */}
                    <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 shrink-0">
                        {/* Contribution Calendar Heatmap Card */}
                        <div
                            className={`${
                                isFullscreen
                                    ? "xl:col-span-7"
                                    : "xl:col-span-12"
                            } p-4 rounded-xl border flex flex-col justify-between gap-3 shadow-lg ${panelBg} ${surface.borderSubtle}`}
                        >
                            <div
                                className={`flex flex-wrap justify-between items-center gap-2 text-xs ${surface.textMuted}`}
                            >
                                <span
                                    className={`font-medium ${surface.textSecondary}`}
                                >
                                    {contributionCalendar.totalContributions.toLocaleString()}{" "}
                                    Contributions in the last year.
                                </span>
                                <div className="flex items-center gap-2.5">
                                    <span className="font-mono">
                                        {user.public_repos} Public + Private
                                        Repos
                                    </span>
                                </div>
                            </div>

                            {/* Scrollable Contribution Matrix Graph */}
                            <div
                                className={`overflow-x-auto py-2 grid grid-cols-3 gap-0 p-2 rounded-sm border ${insetBg} ${surface.borderSubtle}`}
                            >
                                {contributionCalendar.weeks.map(
                                    (week, wIndex) => (
                                        <div
                                            key={wIndex}
                                            className="flex flex-row gap-1 justify-around p-1 rounded-sm"
                                        >
                                            {week.contributionDays.map(
                                                (day, dIndex) => (
                                                    <div
                                                        key={dIndex}
                                                        className={`flex-1 rounded-sm ${cellBackingBg}`}
                                                        style={{
                                                            boxShadow:
                                                                theme.rawPrimary,
                                                        }}
                                                    >
                                                        <div
                                                            title={`${day.contributionCount} contributions on ${day.date}`}
                                                            className="flex-1 h-3 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                                                            style={{
                                                                backgroundColor:
                                                                    theme.rgb,
                                                                opacity:
                                                                    day.opacity,
                                                            }}
                                                        />
                                                    </div>
                                                ),
                                            )}
                                        </div>
                                    ),
                                )}
                            </div>

                            <div
                                className={`flex justify-between items-center text-[10px] pt-1 ${surface.textMuted}`}
                            >
                                <button
                                    type="button"
                                    onClick={handleRefresh}
                                    disabled={loading}
                                    title="Refresh GitHub data"
                                    className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md border text-[11px] font-medium transition disabled:opacity-50 cursor-pointer ${actionBtnClass}`}
                                >
                                    <span
                                        className={
                                            loading
                                                ? "animate-spin inline-block"
                                                : "inline-block"
                                        }
                                    >
                                        <IoMdRefresh />
                                    </span>
                                    <span>Refresh</span>
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <span>Less</span>
                                    {[0, 0.25, 0.5, 0.75, 1].map((opacity) => (
                                        <span
                                            key={opacity}
                                            className={`w-2.5 h-2.5 rounded-sm border overflow-hidden ${cellBackingBg} ${surface.borderSubtle}`}
                                        >
                                            <span
                                                className="w-full h-full block"
                                                style={{
                                                    backgroundColor: theme.rgb,
                                                    opacity,
                                                }}
                                            />
                                        </span>
                                    ))}
                                    <span>More</span>
                                </div>
                            </div>
                        </div>

                        {/* Right Side Line Chart: Only Visible When GitHub Window Is Fullscreen */}
                        {isFullscreen && (
                            <div
                                className={`xl:col-span-5 p-4 rounded-xl border flex flex-col justify-between gap-2 shadow-lg ${panelBg} ${surface.borderSubtle}`}
                            >
                                <div className="flex items-center justify-between gap-2 text-xs">
                                    <div>
                                        <span
                                            className={`font-medium block ${surface.textPrimary}`}
                                        >
                                            Weekly Trend
                                        </span>
                                        <span
                                            className={`text-[10px] font-mono ${surface.textMuted}`}
                                        >
                                            Avg {avgWeekly}/wk · Peak{" "}
                                            {peakWeekly}/wk
                                        </span>
                                    </div>
                                    <span
                                        className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${surface.borderSubtle}`}
                                        style={{ color: theme.rgb }}
                                    >
                                        {weeklyPoints.length}w
                                    </span>
                                </div>

                                <div
                                    className={`relative w-full h-[112px] rounded-lg border p-2 ${insetBg} ${surface.borderSubtle}`}
                                >
                                    {hoveredPoint && (
                                        <div
                                            className={`pointer-events-none absolute z-10 px-2 py-1 rounded border text-[10px] font-mono shadow-md whitespace-nowrap ${panelBg} ${surface.border} ${surface.textPrimary}`}
                                            style={{
                                                left: `${Math.min(72, Math.max(8, hoveredPoint.xPct))}%`,
                                                top: "6px",
                                            }}
                                        >
                                            <span style={{ color: theme.rgb }}>
                                                {hoveredPoint.point.total}
                                            </span>{" "}
                                            commits · {hoveredPoint.point.label}
                                        </div>
                                    )}

                                    <svg
                                        viewBox={`0 0 ${chartGeometry.width} ${chartGeometry.height}`}
                                        preserveAspectRatio="none"
                                        className="w-full h-full block overflow-visible"
                                        onMouseLeave={() =>
                                            setHoveredPoint(null)
                                        }
                                    >
                                        <defs>
                                            <linearGradient
                                                id={gradientId}
                                                x1="0"
                                                y1="0"
                                                x2="0"
                                                y2="1"
                                            >
                                                <stop
                                                    offset="0%"
                                                    stopColor={theme.rgb}
                                                    stopOpacity="0.35"
                                                />
                                                <stop
                                                    offset="100%"
                                                    stopColor={theme.rgb}
                                                    stopOpacity="0.0"
                                                />
                                            </linearGradient>
                                        </defs>

                                        {/* Subtle horizontal reference lines */}
                                        <line
                                            x1="10"
                                            x2={chartGeometry.width - 10}
                                            y1={chartGeometry.height - 18}
                                            y2={chartGeometry.height - 18}
                                            stroke={
                                                isLight
                                                    ? "rgba(15,23,42,0.1)"
                                                    : "rgba(255,255,255,0.08)"
                                            }
                                            strokeWidth="1"
                                        />
                                        <line
                                            x1="10"
                                            x2={chartGeometry.width - 10}
                                            y1="14"
                                            y2="14"
                                            stroke={
                                                isLight
                                                    ? "rgba(15,23,42,0.08)"
                                                    : "rgba(255,255,255,0.05)"
                                            }
                                            strokeDasharray="3 3"
                                            strokeWidth="1"
                                        />

                                        {chartGeometry.areaPath && (
                                            <path
                                                d={chartGeometry.areaPath}
                                                fill={`url(#${gradientId})`}
                                            />
                                        )}

                                        {chartGeometry.linePath && (
                                            <path
                                                d={chartGeometry.linePath}
                                                fill="none"
                                                stroke={theme.rgb}
                                                strokeWidth="2"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        )}

                                        {/* Interactive hover columns for each week */}
                                        {chartGeometry.coords.map((c) => {
                                            const colW =
                                                chartGeometry.coords.length > 1
                                                    ? (chartGeometry.width -
                                                          20) /
                                                      chartGeometry.coords
                                                          .length
                                                    : 12;
                                            const isHovered =
                                                hoveredPoint?.point.index ===
                                                c.point.index;

                                            return (
                                                <g key={c.point.index}>
                                                    {isHovered && (
                                                        <circle
                                                            cx={c.x}
                                                            cy={c.y}
                                                            r="3.5"
                                                            fill={theme.rgb}
                                                            stroke={
                                                                isLight
                                                                    ? "#f1f5f9"
                                                                    : "#0d1117"
                                                            }
                                                            strokeWidth="1.5"
                                                        />
                                                    )}
                                                    <rect
                                                        x={c.x - colW / 2}
                                                        y={0}
                                                        width={Math.max(
                                                            4,
                                                            colW,
                                                        )}
                                                        height={
                                                            chartGeometry.height
                                                        }
                                                        fill="transparent"
                                                        className="cursor-crosshair"
                                                        onMouseEnter={() =>
                                                            setHoveredPoint({
                                                                point: c.point,
                                                                xPct:
                                                                    (c.x /
                                                                        chartGeometry.width) *
                                                                    100,
                                                                yPct:
                                                                    (c.y /
                                                                        chartGeometry.height) *
                                                                    100,
                                                            })
                                                        }
                                                    />
                                                </g>
                                            );
                                        })}
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Repositories List Container */}
                    <div className="flex flex-col flex-1 overflow-hidden gap-3">
                        <h3
                            className={`text-sm font-semibold border-b pb-2 shrink-0 ${surface.textPrimary} ${surface.borderSubtle}`}
                        >
                            Pinned Repositories
                        </h3>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 ">
                            {repos.map((repo) => (
                                <a
                                    key={repo.id}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 group h-36 ${panelBg} ${repoHoverClass} ${surface.borderSubtle}`}
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span
                                                className="text-xs font-semibold group-hover:underline truncate max-w-[180px]"
                                                style={{ color: theme.rgb }}
                                            >
                                                {repo.name}
                                            </span>
                                            <span
                                                className={`text-[10px] px-2 py-0.5 rounded-full border shrink-0 ${surface.border} ${surface.textMuted}`}
                                            >
                                                {repo.private
                                                    ? "Private"
                                                    : "Public"}
                                            </span>
                                        </div>
                                        <p
                                            className={`text-xs line-clamp-2 ${surface.textMuted}`}
                                        >
                                            {repo.description ||
                                                "No description available."}
                                        </p>
                                    </div>

                                    <div
                                        className={`flex items-center justify-between text-[11px] font-mono ${surface.textMuted}`}
                                    >
                                        <div className="flex items-center gap-2">
                                            {repo.language && (
                                                <span className="flex items-center gap-1">
                                                    <span
                                                        className="w-2 h-2 rounded-full inline-block"
                                                        style={{
                                                            backgroundColor:
                                                                LANGUAGE_COLORS[
                                                                    repo
                                                                        .language
                                                                ] ??
                                                                "#fbbf24",
                                                        }}
                                                    />
                                                    {repo.language}
                                                </span>
                                            )}
                                        </div>
                                        {repo.stargazers_count > 0 && (
                                            <span
                                                className={`inline-flex items-center gap-1 ${
                                                    isLight
                                                        ? "text-amber-600"
                                                        : "text-amber-300"
                                                }`}
                                            >
                                                <span>
                                                    {repo.stargazers_count}
                                                </span>
                                                <IoIosStar className="w-3.5 h-3.5 shrink-0" />
                                            </span>
                                        )}
                                    </div>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}