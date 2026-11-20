import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface ContributionDay {
  color: string;
  contributionCount: number;
  date: string;
  weekday: number;
  opacity: number;
}

export interface ContributionWeek {
  contributionDays: ContributionDay[];
}

export interface ContributionCalendar {
  totalContributions: number;
  weeks: ContributionWeek[];
}

export interface Repository {
  id: string;
  name: string;
  description: string | null;
  stargazers_count: number;
  html_url: string;
  language: string | null;
  private: boolean;
}

export interface GitHubData {
  user: {
    name: string;
    login: string;
    avatar_url: string;
    bio: string | null;
    public_repos: number;
    followers: number;
    following: number;
    html_url: string;
  };
  contributionCalendar: ContributionCalendar;
  repos: Repository[];
}

interface GitHubState {
  data: GitHubData | null;
  loading: boolean;
  error: string | null;
  fetchedAt: number | null;
}

const initialState: GitHubState = {
  data: null,
  loading: false,
  error: null,
  fetchedAt: null,
};

export const githubSlice = createSlice({
  name: 'github',
  initialState,
  reducers: {
    setGitHubLoading: (state) => {
      state.loading = true;
      state.error = null;
    },
    setGitHubData: (state, action: PayloadAction<GitHubData>) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
      state.fetchedAt = Date.now();
    },
    setGitHubError: (state, action: PayloadAction<string>) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { setGitHubLoading, setGitHubData, setGitHubError } = githubSlice.actions;
export default githubSlice.reducer;