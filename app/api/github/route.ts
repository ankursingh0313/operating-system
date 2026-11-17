// app/api/github/route.ts
import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const username = 'nkursingh0313'

  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'User-Agent': 'NextJS-Portfolio-OS',
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, next: { revalidate: 3600 } }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`, { headers, next: { revalidate: 3600 } }),
    ])

    if (!userRes.ok || !reposRes.ok) {
      throw new Error('Failed to fetch data from GitHub API')
    }

    const userData = await userRes.json()
    const reposData = await reposRes.json()

    return NextResponse.json({
      user: userData,
      repos: reposData,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}