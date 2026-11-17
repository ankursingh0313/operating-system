'use client'

import React from 'react'
import GitHubClientApp from './GitHubClientApp';
import GitHubProfileApp from './GitHubProfileApp';
import IframeApp from './IframeApp';

interface AppContentProps {
  appId: string
}

export default function AppContent({ appId }: AppContentProps) {
  switch (appId) {
    case 'email':
      return (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base">Inbox</h3>
          <p className="opacity-70 text-xs">No new messages. Your full-stack backend telemetry is running smoothly.</p>
        </div>
      )
    case 'github':
      return <GitHubProfileApp />;
    case 'available':
      return (
        <IframeApp src='https://available-six.vercel.app/' title='Available' />
      )
    case 'profile':
      return (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base">User Profile</h3>
          <p className="opacity-70 text-xs">Ankur Singh — Full Stack Developer & Founder of Leafnx Technologies.</p>
        </div>
      )
    case 'apps':
      return (
        <div className="flex flex-col gap-3">
          <h3 className="font-bold text-base">Applications Manager</h3>
          <p className="opacity-70 text-xs">All local OS sub-modules and utilities are running normally.</p>
        </div>
      )
    default:
      return (
        <div className="flex flex-col gap-2">
          <h3 className="font-bold text-base">Application</h3>
          <p className="opacity-70 text-xs">App content not found.</p>
        </div>
      )
  }
}