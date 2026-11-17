// app/api/github/route.ts
import { NextResponse } from 'next/server'

interface GraphQLRepositoryNode {
  id: string
  name: string
  description: string | null
  stargazerCount: number
  url: string
  primaryLanguage: { name: string } | null
  isPrivate: boolean
}

export async function GET() {
  const token = process.env.GITHUB_TOKEN
  const username = 'ankursingh0313'

  if (!token) {
    return NextResponse.json({ error: 'GitHub token is missing in environment variables' }, { status: 500 })
  }

  // Corrected GraphQL query using orderBy instead of sort
  const query = `
    query($username: String!) {
      user(login: $username) {
        name
        login
        avatarUrl
        bio
        url
        publicRepos: repositories(first: 1) {
          totalCount
        }
        followers {
          totalCount
        }
        following {
          totalCount
        }
        contributionsCollection {
          contributionCalendar {
            totalContributions
            weeks {
              contributionDays {
                color
                contributionCount
                date
                weekday
              }
            }
          }
        }
        repositories(orderBy: {field: UPDATED_AT, direction: DESC}, first: 20) {
          nodes {
            id
            name
            description
            stargazerCount
            url
            primaryLanguage {
              name
            }
            isPrivate
          }
        }
      }
    }
  `

  try {
    const response = await fetch('https://api.github.com/graphql', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-Portfolio-OS',
      },
      body: JSON.stringify({
        query,
        variables: { username },
      }),
      cache: 'no-store',
    })

    const result = await response.json()

    if (result.errors) {
      console.error('GitHub GraphQL Errors:', result.errors)
      return NextResponse.json({ error: result.errors[0].message }, { status: 500 })
    }

    const apiUser = result.data.user
    const calendar = apiUser.contributionsCollection.contributionCalendar
    const last4WeeksWeeks = calendar.weeks.slice(-12)
    const modifiedCalendar = modifyContributionCalendar({ ...calendar, weeks: last4WeeksWeeks })

    return NextResponse.json({
      user: {
        name: apiUser.name,
        login: apiUser.login,
        avatar_url: apiUser.avatarUrl,
        bio: apiUser.bio,
        html_url: apiUser.url,
        public_repos: apiUser.publicRepos.totalCount,
        followers: apiUser.followers.totalCount,
        following: apiUser.following.totalCount,
      },
      contributionCalendar: {
        totalContributions: calendar.totalContributions,
        weeks: modifiedCalendar.weeks,
      },
      repos: apiUser.repositories.nodes.map((repo: GraphQLRepositoryNode) => ({
        id: repo.id,
        name: repo.name,
        description: repo.description,
        stargazers_count: repo.stargazerCount,
        html_url: repo.url,
        language: repo.primaryLanguage?.name || null,
        private: repo.isPrivate,
      })),
    })
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred'
    console.error('API Route Catch Error:', errorMessage)
    return NextResponse.json({ error: errorMessage }, { status: 500 })
  }
}


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
function modifyContributionCalendar(calendar: ContributionCalendar) {
    const maxontributionInADay = Math.max(...calendar.weeks.flatMap(week => week.contributionDays.map(day => day.contributionCount)));
const modifiedWeeks = calendar.weeks.map((week) => {
    const modifiedContributionDays = week.contributionDays.map((day) => {
        return { ...day, opacity: day.contributionCount / maxontributionInADay }; 
    })
    return { ...week, contributionDays: modifiedContributionDays }
  })

  return { ...calendar, weeks: modifiedWeeks }

}