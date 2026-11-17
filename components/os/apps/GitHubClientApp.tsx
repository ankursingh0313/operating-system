'use client'

import React, { useState, useEffect } from 'react'
import { COLOR_PACKAGES } from '@/lib/themes/colorPackages'
import { useAppSelector } from '@/lib/hooks'

interface GitHubUser {
  name: string
  login: string
  avatar_url: string
  bio: string
  public_repos: number
  followers: number
  following: number
  html_url: string
}

interface Repository {
  id: number
  name: string
  description: string
  stargazers_count: number
  html_url: string
  language: string
  updated_at: string
}

interface CommitEvent {
  id: string
  repo: { name: string }
  payload: {
    commits?: { message: string }[]
  }
  created_at: string
}

export default function GitHubClientApp() {
  const [username] = useState('ankursingh0313') // 👈 Change to your GitHub username (e.g., 'nkursingh0313')
  const [user, setUser] = useState<GitHubUser | null>(null)
  const [repos, setRepos] = useState<Repository[]>([])
  const [events, setEvents] = useState<CommitEvent[]>([])
  const [tab, setTab] = useState<'overview' | 'repos' | 'activity'>('overview')
  const [loading, setLoading] = useState(true)

  const { accent, hydrated } = useAppSelector((state) => state.theme)
  const theme = COLOR_PACKAGES[hydrated ? accent : 'blue']

  useEffect(() => {
    async function fetchGitHubData() {
      try {
        setLoading(true)
        const [userRes, reposRes, eventsRes] = await Promise.all([
          fetch(`https://api.github.com/users/${username}`),
          fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=6`),
          fetch(`https://api.github.com/users/${username}/events/public?per_page=5`),
        ])

        if (userRes.ok) setUser(await userRes.json())
        if (reposRes.ok) setRepos(await reposRes.json())
        if (eventsRes.ok) setEvents(await eventsRes.json())
      } catch (err) {
        console.error('Failed to load GitHub data', err)
      } finally {
        setLoading(false)
      }
    }

    fetchGitHubData()
  }, [username])

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
        <div 
          className="w-6 h-6 border-2 border-white/20 border-t-transparent rounded-full animate-spin"
          style={{ borderTopColor: theme.rgb }}
        />
        <span className="text-xs font-mono opacity-60">Syncing with GitHub API...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full gap-4 text-gray-200">
      {/* Profile Header Card */}
      {user && (
        <div className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.04] border border-white/10">
          <img 
            src={user.avatar_url} 
            alt={user.name} 
            className="w-16 h-16 rounded-full border-2 border-white/20 shadow-md" 
          />
          <div className="flex flex-col">
            <h2 className="font-bold text-base text-white">{user.name || user.login}</h2>
            <span className="text-xs opacity-60 font-mono">@{user.login}</span>
            <p className="text-xs opacity-80 mt-1 line-clamp-1">{user.bio || 'Full-stack software developer building things for the web.'}</p>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex gap-2 border-b border-white/10 pb-2 text-xs">
        <button
          onClick={() => setTab('overview')}
          className={`px-3 py-1 rounded-lg transition font-medium ${tab === 'overview' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setTab('repos')}
          className={`px-3 py-1 rounded-lg transition font-medium ${tab === 'repos' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100'}`}
        >
          Repositories ({user?.public_repos || 0})
        </button>
        <button
          onClick={() => setTab('activity')}
          className={`px-3 py-1 rounded-lg transition font-medium ${tab === 'activity' ? 'bg-white/10 text-white' : 'opacity-60 hover:opacity-100'}`}
        >
          Activity Stream
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-auto">
        {tab === 'overview' && user && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs opacity-50 block">Public Repos</span>
                <span className="text-lg font-bold font-mono">{user.public_repos}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs opacity-50 block">Followers</span>
                <span className="text-lg font-bold font-mono">{user.followers}</span>
              </div>
              <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-xs opacity-50 block">Following</span>
                <span className="text-lg font-bold font-mono">{user.following}</span>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <span className="text-xs font-semibold opacity-60 uppercase tracking-wider">Pinned Repositories</span>
              <div className="grid grid-cols-1 gap-2">
                {repos.slice(0, 4).map((repo) => (
                  <a
                    key={repo.id}
                    href={repo.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col gap-1 group"
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold group-hover:underline" style={{ color: theme.rgb }}>
                        {repo.name}
                      </span>
                      <span className="text-[10px] opacity-50 font-mono">⭐ {repo.stargazers_count}</span>
                    </div>
                    <p className="text-xs opacity-70 line-clamp-1">{repo.description || 'No description available.'}</p>
                  </a>
                ))}
              </div>
            </div>
          </div>
        )}

        {tab === 'repos' && (
          <div className="grid grid-cols-1 gap-2.5">
            {repos.map((repo) => (
              <a
                key={repo.id}
                href={repo.html_url}
                target="_blank"
                rel="noopener noreferrer"
                className="p-3 rounded-xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 transition flex flex-col gap-1.5 group"
              >
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold group-hover:underline" style={{ color: theme.rgb }}>
                    {repo.name}
                  </span>
                  <span className="text-[10px] opacity-50 font-mono">⭐ {repo.stargazers_count}</span>
                </div>
                <p className="text-xs opacity-75">{repo.description || 'No description.'}</p>
                {repo.language && (
                  <span className="w-max px-1.5 py-0.5 rounded text-[10px] bg-white/10 opacity-70 font-mono">
                    {repo.language}
                  </span>
                )}
              </a>
            ))}
          </div>
        )}

        {tab === 'activity' && (
          <div className="flex flex-col gap-2">
            <span className="text-xs font-semibold opacity-60 uppercase tracking-wider mb-1">Recent Public Commit Events</span>
            {events.length === 0 ? (
              <p className="text-xs opacity-50">No recent public commit events found.</p>
            ) : (
              events.map((ev) => (
                <div key={ev.id} className="p-3 rounded-xl bg-white/[0.03] border border-white/10 flex flex-col gap-1 text-xs">
                  <div className="flex justify-between opacity-50 font-mono text-[10px]">
                    <span>{ev.repo.name}</span>
                    <span>{new Date(ev.created_at).toLocaleDateString()}</span>
                  </div>
                  <p className="font-medium">
                    {ev.payload.commits?.[0]?.message || 'Performed public repository event'}
                  </p>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}