'use client'

import React, { useState, useEffect } from 'react'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { useAppSelector } from '@/lib/hooks'

interface ContributionDay {
  color: string
  contributionCount: number
  date: string
  weekday: number
  opacity: number
}

interface ContributionWeek {
  contributionDays: ContributionDay[]
}

interface ContributionCalendar {
  totalContributions: number
  weeks: ContributionWeek[]
}

interface Repository {
  id: string
  name: string
  description: string | null
  stargazers_count: number
  html_url: string
  language: string | null
  private: boolean
}

interface GitHubData {
  user: {
    name: string
    login: string
    avatar_url: string
    bio: string | null
    public_repos: number
    followers: number
    following: number
    html_url: string
  }
  contributionCalendar: ContributionCalendar
  repos: Repository[]
}

export default function GitHubProfileApp() {
  const [data, setData] = useState<GitHubData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  useEffect(() => {
    fetch('/api/github')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load profile from GraphQL route')
        return res.json()
      })
      .then((resData: GitHubData) => {
        setData(resData)
        setLoading(false)
      })
      .catch((err: unknown) => {
        const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred'
        setError(errorMessage)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-20 bg-[#0d1117]">
        <div className="w-6 h-6 border-2 border-white/20 border-t-transparent rounded-full animate-spin" style={{ borderTopColor: theme.rgb }} />
        <span className="text-xs font-mono text-gray-400">Loading GitHub profile & contribution history...</span>
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

  const { user, contributionCalendar, repos } = data

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
          <h1 className="text-xl font-bold text-white leading-tight">{user.name}</h1>
          <p className="text-sm font-light text-gray-400">{user.login} · he/him</p>
          <p className="text-xs font-semibold text-gray-300 mt-1">Full Stack Developer</p>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed">
          {user.bio || 'Full-stack software developer specializing in MERN stack, Web3 systems, and high-throughput backend architecture.'}
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
      <div className="flex-1 flex flex-col gap-6 overflow-hidden">
        {/* Real Contribution Calendar Heatmap Section */}
        <div className="p-4 rounded-xl bg-[#161b22] border border-gray-800 flex flex-col gap-3 shrink-0 shadow-lg">
          <div className="flex justify-between items-center text-xs text-gray-400">
            <span className="font-medium text-gray-300">
              {contributionCalendar.totalContributions.toLocaleString()} Contributions in the last year.
            </span>
            <span className="font-mono">{user.public_repos} Public + Private Repos</span>
          </div>

          {/* Scrollable Contribution Matrix Graph */}
          <div className="overflow-x-auto py-2 grid grid-cols-3 gap-0 scrollbar-thin scrollbar-thumb-gray-700 bg-[#0d1117] p-2 rounded-sm">
            {contributionCalendar.weeks.map((week, wIndex) => (
              <div key={wIndex} className="flex flex-row gap-1 justify-around p-1 rounded-sm">
                {week.contributionDays.map((day, dIndex) => (
                  <div key={dIndex} className='flex-1 rounded-sm bg-gray-900' style={{boxShadow: theme.rawPrimary}} >
                  <div
                    key={dIndex}
                    title={`${day.contributionCount} contributions on ${day.date}`}
                    className="flex-1 h-3 rounded-sm transition-transform hover:scale-125 cursor-pointer"
                    style={{ backgroundColor: theme.rgb, opacity: day.opacity}}
                  />
                  </div>
                ))}
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center text-[10px] text-gray-500 pt-1">
            <span>Learn how we count contributions</span>
            <div className="flex items-center gap-1.5">
              <span>Less</span>
              <span className="w-2.5 h-2.5 rounded-sm bg-[#ffffff] border border-gray-800" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#0e4429]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#006d32]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#26a641]" />
              <span className="w-2.5 h-2.5 rounded-sm bg-[#39d353]" />
              <span>More</span>
            </div>
          </div>
        </div>

        {/* Repositories List Container */}
        <div className="flex flex-col flex-1 overflow-hidden gap-3">
          <h3 className="text-sm font-semibold text-gray-200 border-b border-gray-800 pb-2 shrink-0">Pinned Repositories</h3>
          
          <div className="flex-1 overflow-y-auto pr-1 grid grid-cols-1 md:grid-cols-2 gap-3 content-start">
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
                    <span className="text-xs font-semibold group-hover:underline truncate max-w-[180px]" style={{ color: theme.rgb }}>
                      {repo.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full border border-gray-700 text-gray-400 shrink-0">
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