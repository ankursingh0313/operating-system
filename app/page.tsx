"use client";

import { useContextMenu } from "@/lib/hooks/useContextMenu";
import { useAppDispatch, useAppSelector } from "@/lib/hooks";
import {
    setWallpaper,
    setAccent,
    toggleMode,
    setMode,
} from "@/lib/features/themeSlice";
import {
    setGitHubLoading,
    setGitHubData,
    setGitHubError,
    type GitHubData,
} from "@/lib/features/githubSlice";
import Wallpaper from "@/components/os/Wallpaper";
import Dock from "@/components/os/Dock";
import DraggableWidget from "@/components/os/DraggableWidget";
import ClockWidget from "@/components/os/widgets/ClockWidget";
import MusicWidget from "@/components/os/widgets/MusicWidget";
import GitWidget from "@/components/os/widgets/GitWidget";
import Window from "@/components/os/Window";
import IframeApp from "@/components/os/apps/IframeApp";
import AppContent from "@/components/os/apps/AppContent";
import GitHubClientApp from "@/components/os/apps/GitHubClientApp";
import GitHubProfileApp from "@/components/os/apps/GitHubProfileApp";
import AppearanceApp from "@/components/os/apps/AppearanceApp";
import { openApp } from "@/lib/features/dockSlice";
import WidgetsApp from "@/components/os/apps/WidgetsApp";
import { useEffect } from "react";

export default function Home() {
    const dispatch = useAppDispatch();
    const { openApps } = useAppSelector((state) => state.dock);
    const { widgets } = useAppSelector((state) => state.widgets);
    const githubState = useAppSelector((state) => state.github);
    const githubData = githubState?.data ?? null;

    useEffect(() => {
        if (githubData) return;

        let cancelled = false;
        dispatch(setGitHubLoading());

        fetch("/api/github")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to load profile from GraphQL route");
                return res.json();
            })
            .then((resData: GitHubData) => {
                if (!cancelled) {
                    dispatch(setGitHubData(resData));
                }
            })
            .catch((err: unknown) => {
                if (!cancelled) {
                    const msg = err instanceof Error ? err.message : "An unknown error occurred";
                    dispatch(setGitHubError(msg));
                }
            });

        return () => {
            cancelled = true;
        };
    }, [dispatch, githubData]);

    // Context menu to test live theme & wallpaper switching
    const desktopMenu = useContextMenu([
        {
            id: "theme-light",
            label: "Set Mode: Light",
            dividerAbove: false,
            onClick: () => dispatch(setMode("light")),
        },
        {
            id: "theme-dark",
            label: "Set Mode: Dark",
            onClick: () => dispatch(setMode("dark")),
        },
        // {
        //   id: 'toggle-mode',
        //   label: 'Toggle Dark/Light Mode',
        //   dividerAbove: true,
        //   onClick: () => dispatch(toggleMode()),
        // },
        {
            id: "apearance",
            label: "Apearance",
            onClick: () => dispatch(openApp("appearance")),
        },
        {
            id: "widgets",
            label: "Widgets",
            onClick: () => dispatch(openApp("widgets")),
        },
    ]);

    return (
        <main
            {...desktopMenu}
            className="w-screen h-screen overflow-hidden relative  text-white select-none flex flex-col justify-between"
        >
            {/* Active Theme-Aware Wallpaper */}
            <Wallpaper />

            {/* Draggable Desktop Widgets Layer - Render dynamically based on Redux state */}
            {Object.values(widgets).map((config) => {
                if (!config.isOpen) return null;

                switch (config.id) {
                    case "clock":
                        return (
                            <DraggableWidget key="clock" id="clock">
                                <ClockWidget />
                            </DraggableWidget>
                        );
                    case "music":
                        return (
                            <DraggableWidget key="music" id="music">
                                <MusicWidget />
                            </DraggableWidget>
                        );
                    case "git":
                        return (
                            <DraggableWidget key="git" id="git">
                                <GitWidget />
                            </DraggableWidget>
                        );
                    default:
                        return null;
                }
            })}
            {/* 🖥️ Dynamic Windows Layer */}
            {openApps.map((appId) => {
                switch (appId) {
                    case "widgets":
                        return (
                            <Window
                                key="widgets"
                                id="widgets"
                                title="System Settings — Widgets"
                                defaultWidth={550}
                                defaultHeight={420}
                            >
                                <WidgetsApp />
                            </Window>
                        );
                    case "github":
                        return (
                            <Window
                                key="github"
                                id="github"
                                title="GitHub Explorer"
                                defaultWidth={750}
                                defaultHeight={500}
                            >
                                <GitHubProfileApp />
                            </Window>
                        );
                    case "email":
                        return (
                            <Window
                                key="email"
                                id="email"
                                title="Email Client"
                                defaultWidth={600}
                                defaultHeight={400}
                            >
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-base">
                                        Inbox
                                    </h3>
                                    <p className="opacity-70 text-xs">
                                        No new messages. Backend telemetry is
                                        nominal.
                                    </p>
                                </div>
                            </Window>
                        );
                    case "available":
                        return (
                            <Window
                                key="available"
                                id="available"
                                title="Available"
                                defaultWidth={650}
                                defaultHeight={450}
                            >
                                <IframeApp
                                    src="https://available-six.vercel.app/"
                                    title="Available"
                                />
                            </Window>
                        );
                    case "profile":
                        return (
                            <Window
                                key="profile"
                                id="profile"
                                title="User Profile"
                                defaultWidth={600}
                                defaultHeight={400}
                            >
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-base">
                                        Ankur Singh
                                    </h3>
                                    <p className="opacity-70 text-xs">
                                        Leafnx Technologies Founder & Full-Stack
                                        Developer.
                                    </p>
                                </div>
                            </Window>
                        );
                    case "apps":
                        return (
                            <Window
                                key="apps"
                                id="apps"
                                title="Applications"
                                defaultWidth={600}
                                defaultHeight={400}
                            >
                                <div className="flex flex-col gap-2">
                                    <h3 className="font-bold text-base">
                                        System Utilities
                                    </h3>
                                    <p className="opacity-70 text-xs">
                                        All OS packages running smoothly.
                                    </p>
                                </div>
                            </Window>
                        );
                    case "appearance":
                        return (
                            <Window
                                key="appearance"
                                id="appearance"
                                title="System Settings — Appearance"
                                defaultWidth={600}
                                defaultHeight={450}
                            >
                                <AppearanceApp />
                            </Window>
                        );
                    default:
                        return null;
                }
            })}

            {/* Bottom Center Floating Dock */}
            <Dock />
        </main>
    );
}
