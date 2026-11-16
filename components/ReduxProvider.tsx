// components/ReduxProvider.tsx
'use client'

import { Provider } from 'react-redux'
import { makeStore, AppStore } from '@/lib/store'

// Created at module evaluation time (outside React's render phase),
// so Next.js does not flag combineReducers's Math.random() probe during render,
// AND <Provider> is always present for ContextMenu and all child components.
const store: AppStore = makeStore()

export default function ReduxProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <Provider store={store}>{children}</Provider>
}