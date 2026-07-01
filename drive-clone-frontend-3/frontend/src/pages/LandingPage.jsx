import React from 'react'
import { Link } from 'react-router-dom'
import {
  Cloud,
  FileText,
  Folder,
  HardDrive,
  Lock,
  Search,
  Share2,
  Zap,
} from 'lucide-react'

const features = [
  {
    icon: Cloud,
    title: 'Store Everything',
    desc: 'Upload documents, photos, videos, and project files with room to grow.',
  },
  {
    icon: Zap,
    title: 'Fast Access',
    desc: 'Find and open your files quickly from a focused, familiar workspace.',
  },
  {
    icon: Lock,
    title: 'Private by Default',
    desc: 'Your files stay protected behind account access and secure API calls.',
  },
  {
    icon: Share2,
    title: 'Share Instantly',
    desc: 'Create share links and collaborate without moving files between tools.',
  },
  {
    icon: Folder,
    title: 'Smart Organization',
    desc: 'Create folders, color-code them, and star the items you use most.',
  },
  {
    icon: Search,
    title: 'Instant Search',
    desc: 'Search by name across your drive and jump directly to the right file.',
  },
]

const previewItems = [
  { name: 'Projects', type: 'Folder', color: 'bg-blue-100 text-blue-600' },
  { name: 'Photos', type: 'Folder', color: 'bg-amber-100 text-amber-600' },
  { name: 'Reports', type: 'Folder', color: 'bg-violet-100 text-violet-600' },
  { name: 'budget.xlsx', type: 'Sheet', color: 'bg-emerald-100 text-emerald-600' },
  { name: 'proposal.pdf', type: 'PDF', color: 'bg-red-100 text-red-600' },
  { name: 'notes.txt', type: 'Text', color: 'bg-slate-100 text-slate-600' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-surface-50 text-gray-900">
      <header className="sticky top-0 z-30 border-b border-gray-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link to="/" className="flex min-w-0 items-center gap-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-500">
              <HardDrive className="h-5 w-5 text-white" />
            </div>
            <span className="truncate text-xl font-bold">Drive</span>
          </Link>

          <nav className="hidden items-center gap-6 text-sm font-medium text-gray-500 md:flex">
            <a className="hover:text-gray-900" href="#features">Features</a>
            <a className="hover:text-gray-900" href="#preview">Preview</a>
            <a className="hover:text-gray-900" href="#storage">Storage</a>
          </nav>

          <div className="flex shrink-0 items-center gap-2">
            <Link to="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100">
              Log in
            </Link>
            <Link to="/register" className="rounded-lg bg-primary-500 px-3 py-2 text-sm font-semibold text-white hover:bg-primary-600 sm:px-4">
              Sign up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_0.95fr] lg:py-14">
          <div className="max-w-2xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-sm font-medium text-primary-700">
              <Cloud className="h-4 w-4" />
              15 GB free storage
            </div>
            <h1 className="text-4xl font-bold leading-tight tracking-normal text-gray-950 sm:text-5xl lg:text-6xl">
              Your files, organized and available anywhere.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-gray-600 sm:text-lg">
              A clean file management workspace for uploading, organizing, searching, starring, and sharing the files that matter.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register" className="inline-flex items-center justify-center rounded-lg bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600">
                Get started free
              </Link>
              <Link to="/login" className="inline-flex items-center justify-center rounded-lg border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 shadow-sm hover:bg-gray-50">
                Log in to Drive
              </Link>
            </div>
          </div>

          <div id="preview" className="rounded-lg border border-gray-200 bg-white shadow-xl shadow-gray-200/60">
            <div className="flex items-center gap-2 border-b border-gray-100 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-red-400" />
              <div className="h-3 w-3 rounded-full bg-amber-400" />
              <div className="h-3 w-3 rounded-full bg-emerald-400" />
              <div className="ml-2 min-w-0 flex-1 rounded-md bg-gray-100 px-3 py-1 text-xs text-gray-500">
                drive.app/my-drive
              </div>
            </div>
            <div className="grid gap-0 sm:grid-cols-[160px_1fr]">
              <aside className="hidden border-r border-gray-100 p-4 sm:block">
                {['My Drive', 'Recent', 'Starred', 'Trash'].map((item, index) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-lg px-3 py-2 text-sm ${index === 0 ? 'bg-primary-50 font-semibold text-primary-700' : 'text-gray-500'}`}
                  >
                    {item}
                  </div>
                ))}
                <div id="storage" className="mt-6">
                  <div className="mb-2 h-1.5 overflow-hidden rounded-full bg-gray-200">
                    <div className="h-full w-1/3 rounded-full bg-primary-500" />
                  </div>
                  <p className="text-xs text-gray-500">4.2 GB of 15 GB used</p>
                </div>
              </aside>
              <div className="p-4">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">My Drive</p>
                    <p className="text-xs text-gray-500">Recently updated files</p>
                  </div>
                  <div className="rounded-lg bg-gray-100 px-3 py-2 text-xs font-medium text-gray-500">Grid</div>
                </div>
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                  {previewItems.map((item) => (
                    <div key={item.name} className="rounded-lg border border-gray-100 p-3">
                      <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg ${item.color}`}>
                        {item.type === 'Folder' ? <Folder className="h-5 w-5" /> : <FileText className="h-5 w-5" />}
                      </div>
                      <p className="truncate text-sm font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-400">{item.type}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-4 pb-16 sm:px-6">
          <div className="mb-8 max-w-2xl">
            <p className="text-sm font-semibold uppercase text-primary-600">Everything you need</p>
            <h2 className="mt-2 text-3xl font-bold text-gray-950 sm:text-4xl">Built for everyday file work.</h2>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map(({ icon: Icon, title, desc }) => (
              <article key={title} className="rounded-lg border border-gray-200 bg-white p-5">
                <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="text-base font-semibold text-gray-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{desc}</p>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
