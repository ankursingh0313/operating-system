import { NextResponse } from 'next/server'

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const username = 'ankursingh0313'

  const headers: HeadersInit = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    'User-Agent': 'NextJS-Portfolio-OS',
    'Accept': 'application/vnd.github.v3+json',
  }

  try {
    const [userRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${username}`, { headers, cache: 'no-store' }),
      fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=20`, { headers, cache: 'no-store' }),
    ])

    // Log the exact status codes to your terminal for debugging
    if (!userRes.ok || !reposRes.ok) {
      const userErr = await userRes.text()
      const reposErr = await reposRes.text()
      console.error('GitHub API Error Response:', { userStatus: userRes.status, userErr, repoStatus: reposRes.status, reposErr })
      throw new Error(`GitHub API failed with status User: ${userRes.status}, Repos: ${reposRes.status}`)
    }

    const userData = await userRes.json()
    const reposData = await reposRes.json()

    return NextResponse.json({
      user: userData,
      repos: reposData,
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('API Route Catch Error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}