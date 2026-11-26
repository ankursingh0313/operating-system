"use client";

import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    setAllAppsOpen,
    type AppIconKey,
    type OSAppItem,
} from "@/lib/features/appsSlice";
import { openApp, closeApp } from "@/lib/features/dockSlice";
import { COLOR_PACKAGES } from "@/lib/themes/colorPackages";
import {
    FaGithub,
    FaEnvelope,
    FaUserAstronaut,
    FaShareAlt,
    FaPalette,
    FaThLarge,
    FaSearch,
    FaTimes,
} from "react-icons/fa";
import Image from "next/image";

function renderAppIcon(iconKey: AppIconKey) {
    switch (iconKey) {
        case "github":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/socials/gitIcon-1.png"
                    alt="Github"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "email":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/email/emailIcon-2.png"
                    alt="Email"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "profile":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/profile/Profile.png"
                    alt="Profile"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "available":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/available/Available.png"
                    alt="Available"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "appearance":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/themesIcon.png"
                    alt="Appearance"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "widgets":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/widgetsIcon.png"
                    alt="Widgets"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "terminal":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/terminalIcon.png"
                    alt="Terminal"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "calculator":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/calculator-4.png"
                    alt="Calculator"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "resume":
            return (
                <Image
                    className="select-none object-contain w-10 h-10 sm:w-12 sm:h-12"
                    src="/icons/resume.png"
                    alt="Resume"
                    width={48}
                    height={48}
                    priority
                />
            );
        case "apps":
        default:
            return <FaThLarge className="w-6 h-6" />;
    }
}

export default function AllAppsView() {
    const dispatch = useAppDispatch();
    const { items, isAllAppsOpen } = useAppSelector((state) => state.apps);
    const { openApps } = useAppSelector((state) => state.dock);
    const { accent, hydrated } = useAppSelector((state) => state.theme);
    const theme = COLOR_PACKAGES[hydrated ? accent : "blue"];

    const isVisible = isAllAppsOpen || openApps.includes("apps");
    const [query, setQuery] = useState("");

    const handleClose = useCallback(() => {
        dispatch(setAllAppsOpen(false));
        dispatch(closeApp("apps"));
    }, [dispatch]);

    useEffect(() => {
        if (!isVisible) return;
        const onKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                handleClose();
            }
        };
        window.addEventListener("keydown", onKeyDown);
        return () => window.removeEventListener("keydown", onKeyDown);
    }, [isVisible, handleClose]);

    const installedApps = useMemo(() => {
        const list = Object.values(items).filter((app) => app.installed);
        const trimmed = query.trim().toLowerCase();
        if (!trimmed) return list;
        return list.filter(
            (app) =>
                app.title.toLowerCase().includes(trimmed) ||
                app.description.toLowerCase().includes(trimmed) ||
                app.category.toLowerCase().includes(trimmed),
        );
    }, [items, query]);

    if (!isVisible) return null;

    const handleLaunchApp = (app: OSAppItem) => {
        dispatch(openApp(app.id));
        handleClose();
    };

    return (
        <div
            onClick={handleClose}
            className="fixed inset-0 z-[950] bg-slate-950/55 backdrop-blur-2xl flex flex-col p-6 sm:p-10 select-none"
        >
            <div
                onClick={(e) => e.stopPropagation()}
                className="w-full max-w-5xl mx-auto flex flex-col gap-6 flex-1 overflow-hidden"
            >
                {/* Top Bar: Title + Search + Close */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-white">
                            All Apps
                        </h2>
                        <p className="text-xs text-white/60">
                            {installedApps.length} installed{" "}
                            {installedApps.length === 1 ? "app" : "apps"}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="relative flex-1 sm:w-64">
                            <FaSearch className="w-3.5 h-3.5 text-white/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            <input
                                type="text"
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                placeholder="Search apps..."
                                className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/10 focus:bg-white/15 text-xs sm:text-sm text-white placeholder:text-white/45 outline-none transition"
                            />
                        </div>

                        <button
                            type="button"
                            onClick={handleClose}
                            title="Close (Esc)"
                            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white/80 hover:text-white transition cursor-pointer shrink-0"
                        >
                            <FaTimes className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Installed Apps Grid */}
                <div className="flex-1 overflow-y-auto pr-1">
                    {installedApps.length === 0 ? (
                        <div className="h-64 flex flex-col items-center justify-center text-white/55 text-sm gap-2">
                            <span>
                                No installed apps match &ldquo;{query}&rdquo;
                            </span>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 pb-6">
                            {installedApps.map((app) => (
                                <button
                                    key={app.id}
                                    type="button"
                                    onClick={() => handleLaunchApp(app)}
                                    className="group p-4 rounded-2xl bg-white/[0.06] hover:bg-white/[0.13] transition flex flex-col items-start text-left gap-3 cursor-pointer"
                                >
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform duration-150 group-hover:scale-105"
                                        style={{
                                            background: `linear-gradient(135deg, rgba(${theme.rgb}, 0.55), rgba(15, 23, 42, 0.85))`,
                                        }}
                                    >
                                        {renderAppIcon(app.iconKey)}
                                    </div>

                                    <div className="flex flex-col gap-1 min-w-0 w-full">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="text-sm font-semibold text-white truncate">
                                                {app.title}
                                            </span>
                                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-white/65 shrink-0">
                                                {app.category}
                                            </span>
                                        </div>
                                        <p className="text-xs text-white/60 line-clamp-2 leading-relaxed">
                                            {app.description}
                                        </p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
