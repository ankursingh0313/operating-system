"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { useAppSelector } from "@/lib/hooks";
import { COLOR_PACKAGES, getSurfacePackage } from "@/lib/themes/colorPackages";
import { IoMdPause, IoMdPlay } from "react-icons/io";
import {
    TbPlayerSkipBackFilled,
    TbPlayerSkipForwardFilled,
} from "react-icons/tb";
import { SiApplemusic } from "react-icons/si";
import { GiMusicalNotes } from "react-icons/gi";
import { RiFolderShield2Fill } from "react-icons/ri";

interface AudioTrack {
    id: string;
    name: string;
    url: string;
    sizeMB: string;
}

const AUDIO_EXTENSIONS = [
    ".mp3",
    ".wav",
    ".ogg",
    ".m4a",
    ".aac",
    ".flac",
    ".webm",
    ".opus",
];

function isPlayableAudioFile(file: File): boolean {
    if (file.type && file.type.startsWith("audio/")) return true;
    const lower = file.name.toLowerCase();
    return AUDIO_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

function formatTrackTitle(filename: string): string {
    return filename.replace(/\.[^/.]+$/, "").replace(/[_-]+/g, " ");
}

function formatTime(seconds: number): string {
    if (!Number.isFinite(seconds) || seconds < 0) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export default function MusicWidget() {
    const { accent, mode, hydrated } = useAppSelector((state) => state.theme);
    const activeAccent = hydrated ? accent : "blue";
    const activeMode = hydrated ? mode : "dark";
    const isLight = activeMode === "light";

    const theme = COLOR_PACKAGES[activeAccent];
    const surface = getSurfacePackage(activeMode);
    const accentRgbClean = theme.rgb.replace(/[^\d,]/g, "");

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const tracksRef = useRef<AudioTrack[]>([]);

    const [folderName, setFolderName] = useState<string | null>(null);
    const [tracks, setTracks] = useState<AudioTrack[]>([]);
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);
    const [statusMessage, setStatusMessage] = useState<string | null>(null);

    useEffect(() => {
        tracksRef.current = tracks;
    }, [tracks]);

    // Clean up object URLs on unmount
    useEffect(() => {
        return () => {
            tracksRef.current.forEach((track) =>
                URL.revokeObjectURL(track.url),
            );
        };
    }, []);

    const loadFilesIntoPlaylist = useCallback(
        (files: File[], dirLabel: string) => {
            tracksRef.current.forEach((track) =>
                URL.revokeObjectURL(track.url),
            );

            const playable = files
                .filter(
                    (f) => !f.name.startsWith(".") && isPlayableAudioFile(f),
                )
                .sort((a, b) =>
                    a.name.localeCompare(b.name, undefined, { numeric: true }),
                );

            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
            }

            setIsPlaying(false);
            setCurrentTime(0);
            setDuration(0);
            setFolderName(dirLabel);

            if (playable.length === 0) {
                setTracks([]);
                setCurrentIndex(-1);
                setStatusMessage(
                    "No playable audio files found in this directory.",
                );
                return;
            }

            const mapped: AudioTrack[] = playable.map((file, idx) => ({
                id: `${file.name}-${file.lastModified}-${idx}`,
                name: file.name,
                url: URL.createObjectURL(file),
                sizeMB: (file.size / (1024 * 1024)).toFixed(1),
            }));

            setStatusMessage(null);
            setTracks(mapped);
            setCurrentIndex(0);
        },
        [],
    );

    const collectFilesFromHandle = async (
        dirHandle: FileSystemDirectoryHandle,
    ): Promise<File[]> => {
        const collected: File[] = [];
        for await (const [, handle] of dirHandle.entries()) {
            if (handle.kind === "file") {
                const file = await (handle as FileSystemFileHandle).getFile();
                collected.push(file);
            } else if (handle.kind === "directory") {
                const nested = await collectFilesFromHandle(
                    handle as FileSystemDirectoryHandle,
                );
                collected.push(...nested);
            }
        }
        return collected;
    };

    const handleChooseDirectory = async () => {
        const picker = (
            window as unknown as {
                showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>;
            }
        ).showDirectoryPicker;

        if (typeof picker === "function") {
            try {
                const dirHandle = await picker();
                const files = await collectFilesFromHandle(dirHandle);
                loadFilesIntoPlaylist(files, dirHandle.name);
                return;
            } catch (err: unknown) {
                if (err instanceof Error && err.name === "AbortError") return;
            }
        }

        fileInputRef.current?.click();
    };

    const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0) return;

        const files = Array.from(fileList);
        const firstPath = files[0]?.webkitRelativePath || "";
        const rootFolder = firstPath.split("/")[0] || "Selected Folder";

        loadFilesIntoPlaylist(files, rootFolder);
        e.target.value = "";
    };

    const currentTrack =
        currentIndex >= 0 && currentIndex < tracks.length
            ? tracks[currentIndex]
            : null;

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (!currentTrack) {
            audio.removeAttribute("src");
            audio.load();
            return;
        }

        audio.src = currentTrack.url;
        audio.load();
        setCurrentTime(0);
        setDuration(0);

        if (isPlaying) {
            audio.play().catch(() => setIsPlaying(false));
        }
    }, [currentTrack]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        if (isPlaying) {
            audio.play().catch(() => setIsPlaying(false));
        } else {
            audio.pause();
        }
    }, [isPlaying, currentTrack]);

    const togglePlayPause = () => {
        if (!currentTrack) {
            if (tracks.length > 0) {
                setCurrentIndex(0);
                setIsPlaying(true);
            } else {
                handleChooseDirectory();
            }
            return;
        }
        setIsPlaying((prev) => !prev);
    };

    const handlePrev = () => {
        if (tracks.length === 0) return;
        const audio = audioRef.current;
        if (audio && audio.currentTime > 3) {
            audio.currentTime = 0;
            return;
        }
        setCurrentIndex((prev) => (prev - 1 + tracks.length) % tracks.length);
        setIsPlaying(true);
    };

    const handleNext = useCallback(() => {
        if (tracks.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % tracks.length);
        setIsPlaying(true);
    }, [tracks.length]);

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        const audio = audioRef.current;
        if (!audio || !duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(
            0,
            Math.min(1, (e.clientX - rect.left) / rect.width),
        );
        audio.currentTime = ratio * duration;
        setCurrentTime(audio.currentTime);
    };

    const progressPercent =
        duration > 0 ? Math.min(100, (currentTime / duration) * 100) : 0;

    return (
        <div
            className={`p-4 w-[280px] sm:w-[320px] flex flex-col gap-3 cursor-grab active:cursor-grabbing ${surface.textPrimary}`}
        >
            <audio
                ref={audioRef}
                onTimeUpdate={(e) =>
                    setCurrentTime(e.currentTarget.currentTime)
                }
                onLoadedMetadata={(e) =>
                    setDuration(e.currentTarget.duration || 0)
                }
                onEnded={handleNext}
            />

            <input
                ref={fileInputRef}
                type="file"
                multiple
                onChange={handleFileInputChange}
                className="hidden"
                {...({
                    webkitdirectory: "",
                    directory: "",
                } as React.InputHTMLAttributes<HTMLInputElement>)}
            />

            {/* Header + Choose Directory Button */}
            <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                    <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-lg font-bold shadow-inner shrink-0 text-white"
                        style={{
                            background: `linear-gradient(135deg, rgba(${accentRgbClean}, 0.55), rgba(15, 23, 42, 0.85))`,
                        }}
                    >
                        {isPlaying ? <GiMusicalNotes /> : <SiApplemusic />}
                    </div>
                    <div className="flex flex-col min-w-0">
                        <span
                            className={`text-xs font-semibold truncate ${surface.textPrimary}`}
                        >
                            {currentTrack
                                ? formatTrackTitle(currentTrack.name)
                                : "No Track Loaded"}
                        </span>
                        <span
                            className={`text-[11px] truncate ${surface.textMuted}`}
                        >
                            {folderName ? (
                                <span className="flex items-center gap-1.5">
                                    <RiFolderShield2Fill className="shrink-0" />
                                    <span className="truncate">
                                        {folderName} ({tracks.length})
                                    </span>
                                </span>
                            ) : (
                                "Choose a folder to play"
                            )}
                        </span>
                    </div>
                </div>

                <button
                    type="button"
                    onMouseDown={(e) => e.stopPropagation()}
                    onTouchStart={(e) => e.stopPropagation()}
                    onClick={handleChooseDirectory}
                    title="Choose audio directory"
                    className={`px-2.5 py-1 rounded-lg border text-[11px] font-medium transition shrink-0 cursor-pointer ${surface.subtleBg} ${surface.borderSubtle} ${surface.textPrimary} ${surface.cardHoverBg}`}
                >
                    Folder
                </button>
            </div>

            {/* Seekable Progress Bar & Timestamps */}
            <div
                className="flex flex-col gap-1"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                <div
                    onClick={handleSeek}
                    title="Seek"
                    className={`w-full h-1.5 rounded-full overflow-hidden cursor-pointer ${
                        isLight ? "bg-slate-900/10" : "bg-white/10"
                    }`}
                >
                    <div
                        className="h-full rounded-full transition-[width] duration-150"
                        style={{
                            width: `${progressPercent}%`,
                            backgroundColor: theme.rgb,
                        }}
                    />
                </div>
                <div
                    className={`flex justify-between text-[10px] font-mono ${surface.textMuted}`}
                >
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>

            {/* Transport Controls */}
            <div
                className="flex justify-center items-center gap-6"
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
            >
                <button
                    type="button"
                    onClick={handlePrev}
                    disabled={tracks.length === 0}
                    title="Previous track"
                    className={`${surface.textSecondary} hover:opacity-100 opacity-75 disabled:opacity-30 transition text-sm cursor-pointer disabled:cursor-not-allowed`}
                >
                    <TbPlayerSkipBackFilled />
                </button>
                <button
                    type="button"
                    onClick={togglePlayPause}
                    title={isPlaying ? "Pause" : "Play"}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-white shadow-lg transition transform active:scale-95 cursor-pointer"
                    style={{ backgroundColor: theme.rgb }}
                >
                    {isPlaying ? <IoMdPause /> : <IoMdPlay />}
                </button>
                <button
                    type="button"
                    onClick={handleNext}
                    disabled={tracks.length === 0}
                    title="Next track"
                    className={`${surface.textSecondary} hover:opacity-100 opacity-75 disabled:opacity-30 transition text-sm cursor-pointer disabled:cursor-not-allowed`}
                >
                    <TbPlayerSkipForwardFilled />
                </button>
            </div>

            {/* Directory Track List */}
            <div
                onMouseDown={(e) => e.stopPropagation()}
                onTouchStart={(e) => e.stopPropagation()}
                className={`max-h-36 overflow-y-auto flex flex-col gap-1 border-t pt-2 pr-0.5 cursor-default ${surface.borderSubtle}`}
            >
                {tracks.length === 0 ? (
                    <button
                        type="button"
                        onClick={handleChooseDirectory}
                        className={`py-3 px-2 rounded-lg border border-dashed text-[11px] transition text-center cursor-pointer ${surface.subtleBg} ${surface.border} ${surface.textMuted} ${surface.cardHoverBg}`}
                    >
                        {statusMessage ||
                            'Click "Folder" to select a directory with audio files'}
                    </button>
                ) : (
                    tracks.map((track, idx) => {
                        const active = idx === currentIndex;
                        return (
                            <button
                                key={track.id}
                                type="button"
                                onClick={() => {
                                    setCurrentIndex(idx);
                                    setIsPlaying(true);
                                }}
                                className={`w-full flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-lg text-left text-xs transition cursor-pointer ${
                                    active
                                        ? `${surface.inputBg} ${surface.textPrimary} font-medium`
                                        : `${surface.cardHoverBg} ${surface.textSecondary}`
                                }`}
                            >
                                <span className="truncate flex items-center gap-1.5">
                                    <span
                                        className="text-[10px] w-3 shrink-0"
                                        style={{
                                            color: active
                                                ? theme.rgb
                                                : undefined,
                                        }}
                                    >
                                        {active && isPlaying ? (
                                            <IoMdPlay />
                                        ) : (
                                            `${idx + 1}.`
                                        )}
                                    </span>
                                    <span className="truncate">
                                        {formatTrackTitle(track.name)}
                                    </span>
                                </span>
                                <span
                                    className={`text-[10px] font-mono shrink-0 ${surface.textMuted}`}
                                >
                                    {track.sizeMB} MB
                                </span>
                            </button>
                        );
                    })
                )}
            </div>
        </div>
    );
}