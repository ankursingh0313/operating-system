'use client'

import React, { useState, useEffect } from 'react'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { useAppSelector } from '@/lib/hooks'

interface Repository {
  id: number
  name: string
  description: string | null
  stargazers_count: number
  html_url: string
  language: string | null
  private: boolean
}

export default function GitHubProfileApp() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  useEffect(() => {
    fetch('/api/github')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile from server route')
        return res.json()
      })
      .then((resData) => {
        setData(resData)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20 bg-[#0d1117]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: theme.rgb }} />
        <span className="text-xs font-mono text-gray-400">Loading GitHub profile...</span>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex items-center justify-center h-full text-red-400 text-xs bg-[#0d1117] p-6">
        ⚠️ Error: {error || 'No data returned'}
      </div>
    )
  }

  const { user, repos } = data

  return (
    <div className="flex flex-col md:flex-row h-full bg-[#0d1117] text-gray-200 p-4 md:p-6 gap-6 overflow-auto">
      {/* Left Sidebar: Profile Card */}
      <div className="flex flex-col w-full md:w-72 shrink-0 gap-4">
        <div className="relative">
          <img
            src={user.avatar_url}
            alt={user.name}
            className="w-32 h-32 md:w-full md:h-auto aspect-square rounded-full border border-gray-700 shadow-xl object-cover bg-gray-800"
          />
        </div>

        <div>
          <h1 className="text-xl font-bold text-white leading-tight">{user.name}</h1>
          <p className="text-sm font-light text-gray-400">{user.login} · he/him</p>
          <p className="text-xs font-semibold text-gray-300 mt-1">Full Stack Developer</p>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">{user.bio || 'Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture.'}</p>

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
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Contribution Graph Simulated Header */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 flex flex-col gap-3">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span>Recent Contribution Activity</span>
            <span className="font-mono">{user.public_repos} public repos</span>
          </div>
          {/* Simulated Contribution Matrix */}
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 py-2">
            {Array.from({ length: 48 }).map((_, i) => (
              <div
                key={i}
                className={`h-3 rounded-sm ${i % 3 === 0 ? 'bg-emerald-600/80' : i % 5 === 0 ? 'bg-emerald-500' : 'bg-[#21262d]'}`}
              />
            ))}
          </div>
        </div>

        {/* Repositories List */}
        <div className="flex flex-col gap-3">
          <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-800 pb-2">Pinned Repositories</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {repos.map((repo: Repository) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-4 rounded-xl bg-[#161b22] hover:bg-[#1f242c] border border-gray-800 transition flex flex-col justify-between gap-3 group"
              >
                <div className="flex flex-col gap-1">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-semibold group-hover:underline" style={{ color: theme.rgb }}>
                      {repo.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-400">
                      {repo.private ? 'Private' : 'Public'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 line-clamp-2">{repo.description || 'No description available.'}</p>
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
  )
}