'use client'

import { useState } from 'react'
import Link from 'next/link'
import CampaignTab from '@/components/CampaignTab'
import CampaignReportsTab from '@/components/CampaignReportsTab'

type Tab = 'send' | 'reports'

export default function CampaignsClient() {
  const [tab, setTab] = useState<Tab>('send')

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
            Admin
          </Link>
          <span className="text-slate-300">/</span>
          <h1 className="text-xl font-bold text-slate-900">Campaigns</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
          <TabButton active={tab === 'send'} onClick={() => setTab('send')}>Send</TabButton>
          <TabButton active={tab === 'reports'} onClick={() => setTab('reports')}>Reports</TabButton>
        </div>

        {tab === 'send' && <CampaignTab />}
        {tab === 'reports' && <CampaignReportsTab />}
      </div>
    </div>
  )
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600 hover:text-slate-900'
      }`}
    >
      {children}
    </button>
  )
}
