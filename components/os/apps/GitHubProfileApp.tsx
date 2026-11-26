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
    SVG: "#ff9900",
};

interface WeeklyPoint {
    index: number;
    label: string;
    total: number;
}

interface LanguagePoint {
    name: string;
    count: number;
    color: string;
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

    const [hoveredLang, setHoveredLang] = useState<{
        lang: LanguagePoint;
        x: number;
        y: number;
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

    const languagePoints = useMemo<LanguagePoint[]>(() => {
        const rawMap =
            (
                data as
                    | (GitHubData & { languageUsage?: Record<string, number> })
                    | null
            )?.languageUsage ?? {};

        return Object.entries(rawMap)
            .filter(
                ([name, count]) => Boolean(name?.trim()) && Number(count) > 0,
            )
            .map(([name, count]) => {
                const cleanName = name.trim();
                return {
                    name: cleanName,
                    count: Number(count),
                    color: LANGUAGE_COLORS[cleanName] ?? theme.rgb,
                };
            })
            .sort((a, b) => b.count - a.count);
    }, [data, theme.rgb]);

    const spiderGeometry = useMemo(() => {
        const size = 240;
        const cx = size / 2;
        const cy = size / 2;
        const radius = 88;
        const labelRadius = radius + 22;
        const axes = languagePoints.slice(0, 8);
        const count = axes.length;

        if (count === 0) {
            return {
                size,
                cx,
                cy,
                radius,
                maxCount: 0,
                rings: [] as string[],
                spokes: [] as Array<{
                    x: number;
                    y: number;
                    lx: number;
                    ly: number;
                    anchor: "start" | "middle" | "end";
                    lang: LanguagePoint;
                }>,
                polygonPoints: "",
                vertices: [] as Array<{
                    x: number;
                    y: number;
                    lang: LanguagePoint;
                }>,
            };
        }

        const maxCount = Math.max(1, ...axes.map((a) => a.count));
        const ringLevels = [0.25, 0.5, 0.75, 1];

        const angleFor = (idx: number) =>
            -Math.PI / 2 + (idx * 2 * Math.PI) / count;

        const rings = ringLevels.map((level) =>
            axes
                .map((_, idx) => {
                    const angle = angleFor(idx);
                    const r = radius * level;
                    const x = cx + r * Math.cos(angle);
                    const y = cy + r * Math.sin(angle);
                    return `${x.toFixed(1)},${y.toFixed(1)}`;
                })
                .join(" "),
        );

        const spokes = axes.map((lang, idx) => {
            const angle = angleFor(idx);
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const x = cx + radius * cos;
            const y = cy + radius * sin;
            const lx = cx + labelRadius * cos;
            const ly = cy + labelRadius * sin;

            let anchor: "start" | "middle" | "end" = "middle";
            if (cos > 0.25) anchor = "start";
            else if (cos < -0.25) anchor = "end";

            return { x, y, lx, ly, anchor, lang };
        });

        const vertices = axes.map((lang, idx) => {
            const angle = angleFor(idx);
            const ratio = lang.count / maxCount;
            const r = radius * ratio;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            return { x, y, lang };
        });

        const polygonPoints = vertices
            .map((v) => `${v.x.toFixed(1)},${v.y.toFixed(1)}`)
            .join(" ");

        return {
            size,
            cx,
            cy,
            radius,
            maxCount,
            rings,
            spokes,
            polygonPoints,
            vertices,
        };
    }, [languagePoints]);

    const chartGeometry = useMemo(() => {
        const width = 320;
        const height = 200;
        const padX = 0;
        const padTop = 0;
        const padBottom = 0;
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

    const totalRepoLanguages = languagePoints.reduce(
        (sum, item) => sum + item.count,
        0,
    );

    const gradientId = `contrib-grad-${activeAccent}`;
    const spiderFillId = `spider-fill-${activeAccent}`;

    return (
        <div
            className={`flex flex-col md:flex-row h-full p-4 md:p-6 gap-6 overflow-hidden transition-colors duration-200 ${shellBg} ${surface.textPrimary}`}
        >
            {/* Left Sidebar: Profile Card + Fullscreen Language Spider Graph */}
            <div className="flex flex-col w-full md:w-72 shrink-0 gap-4 overflow-y-auto pr-1">
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

                <p
                    className={`text-xs leading-relaxed ${surface.textSecondary}`}
                >
                    {user.bio ||
                        "Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture."}
                </p>
                <div
                    className={`flex items-center gap-2 text-xs  pt-4 ${surface.textMuted} `}
                >
                    <span className="flex items-center gap-1">
                        <IoMdPeople /> {user.followers} followers
                    </span>
                    <span>·</span>
                    <span>{user.following} following</span>
                </div>

                <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`w-full py-1.5 px-3 rounded-lg border text-xs font-medium text-center transition flex items-center justify-center gap-1 cursor-pointer ${actionBtnClass}`}
                >
                    View on GitHub <MdArrowOutward className="text-sm" />
                </a>

                {/* Language Spider Graph in Left Panel Below Followers & Following (Fullscreen Mode) */}
                {isFullscreen && (
                    <div
                        className={`p-0 pt-3 border flex flex-col border-0  border-t ${surface.borderSubtle} overflow-clip`}
                    >
                        <div
                            className={`relative w-full h-[200px] flex items-center justify-center ${insetBg} border-none`}
                        >
                            {hoveredLang && (
                                <div
                                    className={`pointer-events-none absolute z-10 px-2 py-1 rounded border text-[10px] font-mono shadow-md whitespace-nowrap ${panelBg} ${surface.border} ${surface.textPrimary}`}
                                    style={{
                                        top: "6px",
                                        right: "6px",
                                    }}
                                >
                                    <span
                                        className="inline-block w-2 h-2 rounded-full mr-1.5"
                                        style={{
                                            backgroundColor:
                                                hoveredLang.lang.color,
                                        }}
                                    />
                                    <strong>{hoveredLang.lang.name}</strong>:{" "}
                                    {hoveredLang.lang.count}
                                </div>
                            )}

                            {spiderGeometry.vertices.length >= 3 ? (
                                <svg
                                    viewBox={`0 0 ${spiderGeometry.size} ${spiderGeometry.size}`}
                                    className="w-full h-full max-h-[200px] block overflow-visible"
                                    onMouseLeave={() => setHoveredLang(null)}
                                >
                                    <defs>
                                        <radialGradient
                                            id={spiderFillId}
                                            cx="50%"
                                            cy="50%"
                                            r="55%"
                                        >
                                            <stop
                                                offset="0%"
                                                stopColor={theme.rgb}
                                                stopOpacity="0.42"
                                            />
                                            <stop
                                                offset="100%"
                                                stopColor={theme.rgb}
                                                stopOpacity="0.12"
                                            />
                                        </radialGradient>
                                    </defs>

                                    {spiderGeometry.rings.map((pts, idx) => (
                                        <polygon
                                            key={idx}
                                            points={pts}
                                            fill="none"
                                            stroke={
                                                isLight
                                                    ? "rgba(15,23,42,0.14)"
                                                    : "rgba(255,255,255,0.12)"
                                            }
                                            strokeWidth="1"
                                        />
                                    ))}

                                    {spiderGeometry.spokes.map((spoke) => (
                                        <g key={spoke.lang.name}>
                                            <line
                                                x1={spiderGeometry.cx}
                                                y1={spiderGeometry.cy}
                                                x2={spoke.x}
                                                y2={spoke.y}
                                                stroke={
                                                    isLight
                                                        ? "rgba(15,23,42,0.14)"
                                                        : "rgba(255,255,255,0.12)"
                                                }
                                                strokeWidth="1"
                                            />
                                            <text
                                                x={spoke.lx}
                                                y={spoke.ly}
                                                textAnchor={spoke.anchor}
                                                dominantBaseline="central"
                                                className="text-[8.5px] font-mono"
                                                fill={
                                                    isLight
                                                        ? "#475569"
                                                        : "#9ca3af"
                                                }
                                            >
                                                {spoke.lang.name} (
                                                {spoke.lang.count})
                                            </text>
                                        </g>
                                    ))}

                                    <polygon
                                        points={spiderGeometry.polygonPoints}
                                        fill={`url(#${spiderFillId})`}
                                        stroke={theme.rgb}
                                        strokeWidth="1.75"
                                        strokeLinejoin="round"
                                    />

                                    {spiderGeometry.vertices.map((v) => {
                                        const active =
                                            hoveredLang?.lang.name ===
                                            v.lang.name;
                                        return (
                                            <g
                                                key={v.lang.name}
                                                className="cursor-pointer"
                                                onMouseEnter={() =>
                                                    setHoveredLang({
                                                        lang: v.lang,
                                                        x: v.x,
                                                        y: v.y,
                                                    })
                                                }
                                            >
                                                <circle
                                                    cx={v.x}
                                                    cy={v.y}
                                                    r={active ? "4.5" : "3"}
                                                    fill={v.lang.color}
                                                    stroke={
                                                        isLight
                                                            ? "#ffffff"
                                                            : "#0d1117"
                                                    }
                                                    strokeWidth="1.25"
                                                />
                                                <circle
                                                    cx={v.x}
                                                    cy={v.y}
                                                    r="9"
                                                    fill="transparent"
                                                />
                                            </g>
                                        );
                                    })}
                                </svg>
                            ) : (
                                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] font-mono">
                                    {languagePoints.map((lang) => (
                                        <span
                                            key={lang.name}
                                            className={`px-2 py-1 rounded border ${surface.borderSubtle}`}
                                        >
                                            {lang.name}: {lang.count}
                                        </span>
                                    ))}
                                    {languagePoints.length === 0 && (
                                        <span className={surface.textMuted}>
                                            No language usage data
                                        </span>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                )}
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

                        <div
                            className="flex-1 grid gap-3"
                            style={{
                                gridTemplateColumns:
                                    "repeat(auto-fill, minmax(220px, 1fr))",
                            }}
                        >
                            {repos.map((repo) => (
                                <a
                                    key={repo.id}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`p-4 rounded-xl border transition flex flex-col justify-between gap-3 group min-h-36 min-w-0 ${panelBg} ${repoHoverClass} ${surface.borderSubtle}`}
                                >
                                    <div className="flex flex-col gap-1 min-w-0">
                                        <div className="flex justify-between items-start gap-2">
                                            <span
                                                className="text-xs font-semibold group-hover:underline truncate min-w-0"
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
                                        <div className="flex items-center gap-2 min-w-0">
                                            {repo.language && (
                                                <span className="flex items-center gap-1 truncate">
                                                    <span
                                                        className="w-2 h-2 rounded-full inline-block shrink-0"
                                                        style={{
                                                            backgroundColor:
                                                                LANGUAGE_COLORS[
                                                                    repo
                                                                        .language
                                                                ] ?? "#fbbf24",
                                                        }}
                                                    />
                                                    <span className="truncate">
                                                        {repo.language}
                                                    </span>
                                                </span>
                                            )}
                                        </div>
                                        {repo.stargazers_count > 0 && (
                                            <span
                                                className={`inline-flex items-center gap-1 shrink-0 ${
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
