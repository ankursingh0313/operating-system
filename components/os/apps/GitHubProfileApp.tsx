"use client";

import React from "react";
import { COLOR_PACKAGES } from "@/lib/themes/colorPackages";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    setGitHubLoading,
    setGitHubData,
    setGitHubError,
    type GitHubData,
} from "@/lib/features/githubSlice";

export default function GitHubProfileApp() {
    const dispatch = useAppDispatch();
    const { data, loading, error } = useAppSelector((state) => state.github);
    const { accent, hydrated } = useAppSelector((state) => state.theme);
    const theme = COLOR_PACKAGES[hydrated ? accent : "blue"];

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

    if (loading || (!data && !error)) {
        return (
            <div className="flex flex-col items-center justify-center h-full gap-3 py-20 bg-[#0d1117]">
                <div
                    className="w-6 h-6 border-2 border-white/20 border-t-transparent rounded-full animate-spin"
                    style={{ borderTopColor: theme.rgb }}
                />
                <span className="text-xs font-mono text-gray-400">
                    Loading GitHub profile & contribution history...
                </span>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="flex flex-col items-center justify-center gap-3 h-full text-red-400 text-xs bg-[#0d1117] p-6">
                <span>⚠️ Error: {error || "No data returned"}</span>
                <button
                    type="button"
                    onClick={handleRefresh}
                    className="px-3 py-1 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-gray-700 text-gray-200 transition cursor-pointer"
                >
                    ↻ Retry
                </button>
            </div>
        );
    }

    const { user, contributionCalendar, repos } = data;

    return (
        <div className="flex flex-col md:flex-row h-full bg-[#0d1117] text-gray-200 p-4 md:p-6 gap-6 overflow-hidden">
            {/* Left Sidebar: Profile Card */}
            <div className="flex flex-col w-full md:w-72 shrink-0 gap-4 overflow-y-auto">
                <div className="relative">
                    <img
                        src={user.avatar_url}
                        alt={user.name}
                        className="w-32 h-32 md:w-full md:h-auto aspect-square rounded-full border border-gray-700 shadow-xl object-cover bg-gray-800"
                    />
                </div>

                <div>
                    <h1 className="text-xl font-bold text-white leading-tight">
                        {user.name}
                    </h1>
                    <p className="text-sm font-light text-gray-400">
                        {user.login} · he/him
                    </p>
                    <p className="text-xs font-semibold text-gray-300 mt-1">
                        Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture.
                    </p>
                </div>

                <p className="text-xs text-gray-300 leading-relaxed">
                    {user.bio ||
                        "Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture."}
                </p>

                <a
                    href={user.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-1.5 px-3 rounded-lg bg-[#21262d] hover:bg-[#30363d] border border-gray-700 text-xs font-medium text-center text-gray-200 transition"
                >
                    View on GitHub ↗
                </a>

                <div className="flex items-center gap-2 text-xs text-gray-400 border-t border-gray-800 pt-4">
                    <span>👥 {user.followers} followers</span>
                    <span>·</span>
                    <span>{user.following} following</span>
                </div>
            </div>

            {/* Right Main Content Area */}
            <div className="flex-1 overflow-y-auto pr-2">
                <div className="flex flex-col gap-6 shrink-0">
                    {/* Real Contribution Calendar Heatmap Section */}
                    <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 flex flex-col gap-3 shrink-0 shadow-lg">
                        <div className="flex flex-wrap justify-between items-center gap-2 text-xs text-gray-400">
                            <span className="font-medium text-gray-300">
                                {contributionCalendar.totalContributions.toLocaleString()}{" "}
                                Contributions in the last year.
                            </span>
                            <div className="flex items-center gap-2.5">
                                <span className="font-mono">
                                    {user.public_repos} Public + Private Repos
                                </span>
                            </div>
                        </div>

                        {/* Scrollable Contribution Matrix Graph */}
                        <div className="overflow-x-auto py-2 grid grid-cols-3 gap-0 scrollbar-thin scrollbar-thumb-gray-700 bg-[#0d1117] p-2 rounded-sm">
                            {contributionCalendar.weeks.map((week, wIndex) => (
                                <div
                                    key={wIndex}
                                    className="flex flex-row gap-1 justify-around p-1 rounded-sm"
                                >
                                    {week.contributionDays.map(
                                        (day, dIndex) => (
                                            <div
                                                key={dIndex}
                                                className="flex-1 rounded-sm bg-gray-900"
                                                style={{
                                                    boxShadow: theme.rawPrimary,
                                                }}
                                            >
                                                <div
                                                    title={`${day.contributionCount} contributions on ${day.date}`}
                                                    className="flex-1 h-3 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                                                    style={{
                                                        backgroundColor:
                                                            theme.rgb,
                                                        opacity: day.opacity,
                                                    }}
                                                />
                                            </div>
                                        ),
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
                            <button
                                type="button"
                                onClick={handleRefresh}
                                disabled={loading}
                                title="Refresh GitHub data"
                                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-[#21262d] hover:bg-[#30363d] border border-gray-700 text-[11px] font-medium text-gray-200 transition disabled:opacity-50 cursor-pointer"
                            >
                                <span
                                    className={
                                        loading
                                            ? "animate-spin inline-block"
                                            : "inline-block"
                                    }
                                >
                                    ↻
                                </span>
                                <span>Refresh</span>
                            </button>
                            <div className="flex items-center gap-1.5">
                                <span>Less</span>
                                <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-gray-800 overflow-hidden">
                                    <span
                                        className="w-full h-full block"
                                        style={{
                                            backgroundColor: theme.rgb,
                                            opacity: 0,
                                        }}
                                    />
                                </span>
                                <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-gray-800 overflow-hidden">
                                    <span
                                        className="w-full h-full block"
                                        style={{
                                            backgroundColor: theme.rgb,
                                            opacity: 0.25,
                                        }}
                                    />
                                </span>
                                <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-gray-800 overflow-hidden">
                                    <span
                                        className="w-full h-full block"
                                        style={{
                                            backgroundColor: theme.rgb,
                                            opacity: 0.5,
                                        }}
                                    />
                                </span>
                                <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-gray-800 overflow-hidden">
                                    <span
                                        className="w-full h-full block"
                                        style={{
                                            backgroundColor: theme.rgb,
                                            opacity: 0.75,
                                        }}
                                    />
                                </span>
                                <span className="w-2.5 h-2.5 rounded-sm bg-gray-900 border border-gray-800 overflow-hidden">
                                    <span
                                        className="w-full h-full block"
                                        style={{
                                            backgroundColor: theme.rgb,
                                            opacity: 1,
                                        }}
                                    />
                                </span>
                                <span>More</span>
                            </div>
                        </div>
                    </div>

                    {/* Repositories List Container */}
                    <div className="flex flex-col flex-1 overflow-hidden gap-3">
                        <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-800 pb-2 shrink-0">
                            Pinned Repositories
                        </h3>

                        <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3 ">
                            {repos.map((repo) => (
                                <a
                                    key={repo.id}
                                    href={repo.html_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-4 rounded-xl bg-[#161b22] hover:bg-[#1f242c] border border-gray-800 transition flex flex-col justify-between gap-3 group h-36"
                                >
                                    <div className="flex flex-col gap-1">
                                        <div className="flex justify-between items-start">
                                            <span
                                                className="text-xs font-semibold group-hover:underline truncate max-w-[180px]"
                                                style={{ color: theme.rgb }}
                                            >
                                                {repo.name}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 shrink-0">
                                                {repo.private
                                                    ? "Private"
                                                    : "Public"}
                                            </span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2">
                                            {repo.description ||
                                                "No description available."}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between text-[11px] text-gray-400 font-mono">
                                        <div className="flex items-center gap-2">
                                            {repo.language && (
                                                <span className="flex items-center gap-1">
                                                    <span className="w-2 h-2 rounded-full bg-amber-400 inline-block" />
                                                    {repo.language}
                                                </span>
                                            )}
                                        </div>
                                        <span>⭐ {repo.stargazers_count}</span>
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
