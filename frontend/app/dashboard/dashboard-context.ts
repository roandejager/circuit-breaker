'use client';

import { createContext, useContext } from 'react';
import type { User } from '@supabase/supabase-js';

export type AccountTier = 'free' | 'pro';

export interface DashboardContextValue {
  user: User;
  tier: AccountTier;
}

export const DashboardContext = createContext<DashboardContextValue | null>(null);

export function useDashboardContext() {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboardContext must be used within the dashboard layout.');
  }
  return context;
}
