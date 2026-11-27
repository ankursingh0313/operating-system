'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react'
import { useAppSelector } from '@/lib/hooks'
import { COLOR_PACKAGES, getSurfacePackage } from '@/lib/themes/colorPackages'
import {
  FaFolder,
  FaFileAlt,
  FaFilePdf,
  FaFileWord,
  FaHdd,
  FaLock,
  FaFolderPlus,
  FaFileMedical,
  FaUpload,
  FaTrash,
  FaEdit,
  FaSave,
  FaTimes,
  FaArrowUp,
  FaSearch,
  FaDownload,
  FaExternalLinkAlt,
  FaChevronRight,
} from 'react-icons/fa'

// Easily extend this array in the future (e.g., 'md', 'json', 'png', 'mp3')
export const SUPPORTED_EXTENSIONS = ['txt', 'pdf', 'docx'] as const
export type SupportedExt = (typeof SUPPORTED_EXTENSIONS)[number]

type DriveId = 'admin' | 'user'

interface FSNode {
  id: string
  drive: DriveId
  parentId: string | null
  name: string
  type: 'folder' | 'file'
  ext?: SupportedExt
  content?: string // Used for .txt files
  url?: string // Used for static assets or uploaded data URLs (.pdf, .docx)
  size?: string
  updatedAt: string
}

const USER_DRIVE_STORAGE_KEY = 'dossier_os_user_drive_v1'
const MAX_USER_DRIVE_BYTES = 3 * 1024 * 1024 // 3 MB cap to prevent lag & quota errors

// Read-only Admin Drive contents
const ADMIN_DRIVE_NODES: FSNode[] = [
  {
    id: 'admin-docs',
    drive: 'admin',
    parentId: null,
    name: 'Documents',
    type: 'folder',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-resume-pdf',
    drive: 'admin',
    parentId: 'admin-docs',
    name: 'Ankur_Singh_Resume.pdf',
    type: 'file',
    ext: 'pdf',
    url: '/resume/Ankur_Singh_Resume.pdf',
    size: 'PDF',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-resume-docx',
    drive: 'admin',
    parentId: 'admin-docs',
    name: 'Ankur_Singh_Resume.docx',
    type: 'file',
    ext: 'docx',
    url: '/resume/Ankur_Singh_Resume.docx',
    size: 'DOCX',
    updatedAt: 'Nov 2026',
  },
  {
    id: 'admin-readme',
    drive: 'admin',
    parentId: null,
    name: 'README.txt',
    type: 'file',
    ext: 'txt',
    content:
      'Welcome to DossierOS File Manager.\n\n- Admin Drive is read-only: you can browse, preview, and download files.\n- User Drive is your personal workspace: create folders, edit .txt files, upload .pdf/.docx/.txt files, rename, or delete items.\n\nAll User Drive changes are saved locally in your browser (3 MB limit).',
    size: '1 KB',
    updatedAt: 'Nov 2026',
  },
]

// Default starter files for User Drive
const DEFAULT_USER_NODES: FSNode[] = [
  {
    id: 'user-notes-folder',
    drive: 'user',
    parentId: null,
    name: 'Notes',
    type: 'folder',
    updatedAt: 'Today',
  },
  {
    id: 'user-welcome-txt',
    drive: 'user',
    parentId: 'user-notes-folder',
    name: 'scratchpad.txt',
    type: 'file',
    ext: 'txt',
    content: 'Write your notes here and click Save.\n',
    size: '1 KB',
    updatedAt: 'Today',
  },
]

function getExtension(filename: string): SupportedExt | null {
  const parts = filename.toLowerCase().split('.')
  if (parts.length < 2) return null
  const ext = parts[parts.length - 1]
  return (SUPPORTED_EXTENSIONS as readonly string[]).includes(ext)
    ? (ext as SupportedExt)
    : null
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function formatNow(): string {
  return new Date().toLocaleDateString([], {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function FileManagerApp() {
  const { accent, mode, hydrated } = useAppSelector((state) => state.theme)
  const [isMounted, setIsMounted] = useState(false)

  const [activeDrive, setActiveDrive] = useState<DriveId>('admin')
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null)
  const [userNodes, setUserNodes] = useState<FSNode[]>(DEFAULT_USER_NODES)
  const [searchQuery, setSearchQuery] = useState('')

  // Active file viewer / editor state
  const [selectedFile, setSelectedFile] = useState<FSNode | null>(null)
  const [editorText, setEditorText] = useState('')
  const [statusMsg, setStatusMsg] = useState<string | null>(null)

  // Inline create / rename state
  const [creatingType, setCreatingType] = useState<'folder' | 'txt' | null>(null)
  const [newName, setNewName] = useState('')
  const [renamingId, setRenamingId] = useState<string | null>(null)
  const [renameValue, setRenameValue] = useState('')

  const fileInputRef = useRef<HTMLInputElement | null>(null)

  useEffect(() => {
    setIsMounted(true)
    try {
      const saved = localStorage.getItem(USER_DRIVE_STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        if (Array.isArray(parsed)) setUserNodes(parsed)
      }
    } catch {
      // Fallback to default user nodes
    }
  }, [])

  // Persist User Drive changes
  useEffect(() => {
    if (!isMounted) return
    try {
      localStorage.setItem(USER_DRIVE_STORAGE_KEY, JSON.stringify(userNodes))
    } catch {
      // Ignore quota errors
    }
  }, [userNodes, isMounted])

  const showToast = (msg: string) => {
    setStatusMsg(msg)
    setTimeout(() => setStatusMsg(null), 2600)
  }

  const activeAccent = isMounted && hydrated ? accent : 'blue'
  const activeMode = isMounted && hydrated ? mode : 'dark'
  const isLight = activeMode === 'light'

  const theme = COLOR_PACKAGES[activeAccent]
  const surface = getSurfacePackage(activeMode)
  const accentRgbClean = theme.rgb.replace(/[^\d,]/g, '')

  const isReadOnly = activeDrive === 'admin'
  const driveNodes = activeDrive === 'admin' ? ADMIN_DRIVE_NODES : userNodes

  // Live User Drive storage calculation
  const userDriveUsedBytes = useMemo(() => {
    try {
      return new Blob([JSON.stringify(userNodes)]).size
    } catch {
      return 0
    }
  }, [userNodes])

  const usagePercent = Math.min(
    100,
    Math.round((userDriveUsedBytes / MAX_USER_DRIVE_BYTES) * 100)
  )

  // Build breadcrumb trail from root to currentFolderId
  const breadcrumbs = useMemo(() => {
    const trail: FSNode[] = []
    let cursor = currentFolderId
    while (cursor) {
      const found = driveNodes.find((n) => n.id === cursor)
      if (!found) break
      trail.unshift(found)
      cursor = found.parentId
    }
    return trail
  }, [currentFolderId, driveNodes])

  // Items visible in current folder (filtered by search)
  const visibleItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    const list = driveNodes.filter((n) => {
      if (q) return n.name.toLowerCase().includes(q)
      return n.parentId === currentFolderId
    })

    // Sort folders first, then files alphabetically
    return [...list].sort((a, b) => {
      if (a.type !== b.type) return a.type === 'folder' ? -1 : 1
      return a.name.localeCompare(b.name)
    })
  }, [driveNodes, currentFolderId, searchQuery])

  const switchDrive = (drive: DriveId) => {
    setActiveDrive(drive)
    setCurrentFolderId(null)
    setSelectedFile(null)
    setCreatingType(null)
    setRenamingId(null)
    setSearchQuery('')
  }

  const handleOpenNode = (node: FSNode) => {
    if (node.type === 'folder') {
      setCurrentFolderId(node.id)
      setSelectedFile(null)
      setSearchQuery('')
      return
    }
    setSelectedFile(node)
    setEditorText(node.content ?? '')
  }

  const handleGoUp = () => {
    if (!currentFolderId) return
    const current = driveNodes.find((n) => n.id === currentFolderId)
    setCurrentFolderId(current?.parentId ?? null)
  }

  // Create Folder or .txt file in User Drive
  const handleConfirmCreate = () => {
    if (isReadOnly || !creatingType) return
    const trimmed = newName.trim()
    if (!trimmed) return

    const finalName =
      creatingType === 'txt' && !trimmed.toLowerCase().endsWith('.txt')
        ? `${trimmed}.txt`
        : trimmed

    const duplicate = userNodes.some(
      (n) =>
        n.parentId === currentFolderId &&
        n.name.toLowerCase() === finalName.toLowerCase()
    )
    if (duplicate) {
      showToast('An item with that name already exists.')
      return
    }

    const newNode: FSNode =
      creatingType === 'folder'
        ? {
            id: `user-${Date.now()}`,
            drive: 'user',
            parentId: currentFolderId,
            name: finalName,
            type: 'folder',
            updatedAt: formatNow(),
          }
        : {
            id: `user-${Date.now()}`,
            drive: 'user',
            parentId: currentFolderId,
            name: finalName,
            type: 'file',
            ext: 'txt',
            content: '',
            size: '0 B',
            updatedAt: formatNow(),
          }

    const nextNodes = [...userNodes, newNode]
    if (new Blob([JSON.stringify(nextNodes)]).size > MAX_USER_DRIVE_BYTES) {
      showToast('User Drive is full. Delete items to free space.')
      return
    }

    setUserNodes(nextNodes)
    setCreatingType(null)
    setNewName('')

    if (newNode.type === 'file') {
      setSelectedFile(newNode)
      setEditorText('')
    }
    showToast(`Created ${finalName}`)
  }

  // Upload .txt, .pdf, or .docx into User Drive (with strict quota check)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return
    const files = Array.from(e.target.files || [])
    e.target.value = ''
    if (files.length === 0) return

    files.forEach((file) => {
      const ext = getExtension(file.name)
      if (!ext) {
        showToast(`Unsupported file: ${file.name} (only .txt, .pdf, .docx)`)
        return
      }

      // Quick pre-check before reading into memory (base64 adds ~33% overhead)
      const estimatedBytes = ext === 'txt' ? file.size : Math.ceil(file.size * 1.37)
      if (estimatedBytes > MAX_USER_DRIVE_BYTES) {
        showToast(
          `${file.name} exceeds the ${formatBytes(MAX_USER_DRIVE_BYTES)} disk limit.`
        )
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        const result = typeof reader.result === 'string' ? reader.result : ''
        const uploadedNode: FSNode = {
          id: `user-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          drive: 'user',
          parentId: currentFolderId,
          name: file.name,
          type: 'file',
          ext,
          content: ext === 'txt' ? result : undefined,
          url: ext !== 'txt' ? result : undefined,
          size: formatBytes(file.size),
          updatedAt: formatNow(),
        }

        let blocked = false
        setUserNodes((prev) => {
          const next = [...prev, uploadedNode]
          const nextSize = new Blob([JSON.stringify(next)]).size
          if (nextSize > MAX_USER_DRIVE_BYTES) {
            blocked = true
            return prev
          }
          return next
        })

        if (blocked) {
          showToast('Not enough space on User Drive. Delete files to free space.')
        } else {
          showToast(`Uploaded ${file.name}`)
        }
      }

      if (ext === 'txt') {
        reader.readAsText(file)
      } else {
        reader.readAsDataURL(file)
      }
    })
  }

  // Save edited .txt file in User Drive (with quota check)
  const handleSaveTextFile = () => {
    if (isReadOnly || !selectedFile || selectedFile.ext !== 'txt') return
    const updated: FSNode = {
      ...selectedFile,
      content: editorText,
      size: formatBytes(new Blob([editorText]).size),
      updatedAt: formatNow(),
    }

    const nextNodes = userNodes.map((n) => (n.id === updated.id ? updated : n))
    if (new Blob([JSON.stringify(nextNodes)]).size > MAX_USER_DRIVE_BYTES) {
      showToast('Save failed: User Drive storage limit reached.')
      return
    }

    setUserNodes(nextNodes)
    setSelectedFile(updated)
    showToast('File saved')
  }

  // Rename item in User Drive
  const handleConfirmRename = (node: FSNode) => {
    if (isReadOnly) return
    const trimmed = renameValue.trim()
    if (!trimmed) {
      setRenamingId(null)
      return
    }

    let finalName = trimmed
    if (node.type === 'file' && node.ext) {
      const newExt = getExtension(trimmed)
      if (!newExt) {
        finalName = `${trimmed}.${node.ext}`
      } else if (newExt !== node.ext) {
        showToast(`Keep .${node.ext} extension`)
        return
      }
    }

    setUserNodes((prev) =>
      prev.map((n) =>
        n.id === node.id ? { ...n, name: finalName, updatedAt: formatNow() } : n
      )
    )
    if (selectedFile?.id === node.id) {
      setSelectedFile((prev) => (prev ? { ...prev, name: finalName } : null))
    }
    setRenamingId(null)
    showToast(`Renamed to ${finalName}`)
  }

  // Delete file or folder (recursively) in User Drive
  const handleDeleteNode = (node: FSNode) => {
    if (isReadOnly) return
    const idsToDelete = new Set<string>([node.id])

    if (node.type === 'folder') {
      let added = true
      while (added) {
        added = false
        for (const item of userNodes) {
          if (item.parentId && idsToDelete.has(item.parentId) && !idsToDelete.has(item.id)) {
            idsToDelete.add(item.id)
            added = true
          }
        }
      }
    }

    setUserNodes((prev) => prev.filter((n) => !idsToDelete.has(n.id)))
    if (selectedFile && idsToDelete.has(selectedFile.id)) {
      setSelectedFile(null)
    }
    showToast(`Deleted ${node.name}`)
  }

  const handleDownloadFile = (file: FSNode) => {
    if (file.ext === 'txt') {
      const blob = new Blob([file.content ?? ''], { type: 'text/plain;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = file.name
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return
    }
    if (file.url) {
      const a = document.createElement('a')
      a.href = file.url
      a.download = file.name
      a.click()
    }
  }

  const renderIcon = (node: FSNode) => {
    if (node.type === 'folder') {
      return <FaFolder className="w-4 h-4 shrink-0" style={{ color: theme.rgb }} />
    }
    if (node.ext === 'pdf') return <FaFilePdf className="w-4 h-4 shrink-0 text-rose-400" />
    if (node.ext === 'docx') return <FaFileWord className="w-4 h-4 shrink-0 text-sky-400" />
    return <FaFileAlt className={`w-4 h-4 shrink-0 ${surface.textMuted}`} />
  }

  const btnClass = isLight
    ? 'bg-slate-100 hover:bg-slate-200/80 border-slate-300/80 text-slate-800'
    : 'bg-white/[0.06] hover:bg-white/[0.12] border-white/10 text-gray-200'

  return (
    <div
      className={`h-full w-full flex overflow-hidden select-none transition-colors duration-200 ${surface.appBg} ${surface.textPrimary}`}
    >
      {/* Hidden File Input for Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept=".txt,.pdf,.docx"
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Left Sidebar: Drives */}
      <aside
        className={`w-44 sm:w-52 shrink-0 border-r p-3 flex flex-col gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
      >
        <span
          className={`px-2 text-[10px] font-mono font-semibold uppercase tracking-widest ${surface.textMuted}`}
        >
          Drives
        </span>

        {/* Admin Drive */}
        <button
          type="button"
          onClick={() => switchDrive('admin')}
          className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-medium transition cursor-pointer ${
            activeDrive === 'admin'
              ? 'text-white shadow-sm'
              : `${surface.textPrimary} hover:bg-white/[0.06]`
          }`}
          style={
            activeDrive === 'admin'
              ? { backgroundColor: theme.rgb }
              : undefined
          }
        >
          <span className="flex items-center gap-2 truncate">
            <FaHdd className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">Admin Drive</span>
          </span>
          <FaLock className="w-3 h-3 opacity-80 shrink-0" title="Read-Only" />
        </button>

        {/* User Drive */}
        <button
          type="button"
          onClick={() => switchDrive('user')}
          className={`w-full px-3 py-2.5 rounded-xl text-left flex items-center justify-between gap-2 text-xs font-medium transition cursor-pointer ${
            activeDrive === 'user'
              ? 'text-white shadow-sm'
              : `${surface.textPrimary} hover:bg-white/[0.06]`
          }`}
          style={
            activeDrive === 'user'
              ? { backgroundColor: theme.rgb }
              : undefined
          }
        >
          <span className="flex items-center gap-2 truncate">
            <FaHdd className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">User Drive</span>
          </span>
          <span className="text-[9px] font-mono uppercase opacity-80">R/W</span>
        </button>

        {/* User Drive Storage Meter + Supported Types */}
        <div className="mt-auto pt-3 border-t border-current/10 px-2 space-y-2.5">
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className={surface.textMuted}>User Disk</span>
              <span className="font-semibold">{usagePercent}%</span>
            </div>

            <div
              className={`w-full h-1.5 rounded-full overflow-hidden ${
                isLight ? 'bg-slate-200' : 'bg-white/10'
              }`}
            >
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${usagePercent}%`,
                  backgroundColor:
                    usagePercent >= 90
                      ? '#f43f5e'
                      : usagePercent >= 75
                        ? '#f59e0b'
                        : theme.rgb,
                }}
              />
            </div>

            <div className={`text-[10px] font-mono ${surface.textMuted}`}>
              {formatBytes(userDriveUsedBytes)} / {formatBytes(MAX_USER_DRIVE_BYTES)}
            </div>
          </div>

          <div className="pt-2 border-t border-current/10 space-y-1">
            <div className={`text-[10px] font-mono ${surface.textMuted}`}>
              Supported Types
            </div>
            <div className="flex flex-wrap gap-1">
              {SUPPORTED_EXTENSIONS.map((ext) => (
                <span
                  key={ext}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono uppercase border ${surface.borderSubtle}`}
                >
                  .{ext}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
        {/* Top Toolbar */}
        <div
          className={`shrink-0 px-3 sm:px-4 py-2.5 border-b flex flex-wrap items-center justify-between gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
        >
          {/* Navigation & Breadcrumbs */}
          <div className="flex items-center gap-1.5 min-w-0 text-xs font-mono">
            <button
              type="button"
              onClick={handleGoUp}
              disabled={!currentFolderId}
              title="Up One Level"
              className={`w-7 h-7 rounded-lg border flex items-center justify-center transition cursor-pointer disabled:opacity-35 ${btnClass}`}
            >
              <FaArrowUp className="w-3 h-3" />
            </button>

            <button
              type="button"
              onClick={() => {
                setCurrentFolderId(null)
                setSelectedFile(null)
              }}
              className="px-1.5 py-1 rounded hover:underline font-semibold cursor-pointer"
            >
              {activeDrive === 'admin' ? 'Admin Drive' : 'User Drive'}
            </button>

            {breadcrumbs.map((crumb) => (
              <React.Fragment key={crumb.id}>
                <FaChevronRight className={`w-2.5 h-2.5 ${surface.textMuted}`} />
                <button
                  type="button"
                  onClick={() => {
                    setCurrentFolderId(crumb.id)
                    setSelectedFile(null)
                  }}
                  className="px-1 py-0.5 rounded hover:underline truncate max-w-[110px] cursor-pointer"
                >
                  {crumb.name}
                </button>
              </React.Fragment>
            ))}
          </div>

          {/* Right Controls: Search + Actions */}
          <div className="flex items-center gap-1.5">
            <div className="relative">
              <FaSearch
                className={`w-3 h-3 absolute left-2.5 top-1/2 -translate-y-1/2 ${surface.textMuted}`}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search..."
                className={`pl-7 pr-2.5 py-1 rounded-lg border text-xs w-28 sm:w-36 focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
              />
            </div>

            {isReadOnly ? (
              <span
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-mono font-semibold"
                style={{
                  backgroundColor: `rgba(${accentRgbClean}, 0.14)`,
                  color: theme.rgb,
                }}
              >
                <FaLock className="w-2.5 h-2.5" />
                Read-Only
              </span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setCreatingType('folder')
                    setNewName('')
                  }}
                  title="New Folder"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${btnClass}`}
                >
                  <FaFolderPlus className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Folder</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCreatingType('txt')
                    setNewName('')
                  }}
                  title="New .txt File"
                  className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-xs font-medium cursor-pointer ${btnClass}`}
                >
                  <FaFileMedical className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">.txt</span>
                </button>

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload .txt, .pdf, or .docx"
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-white cursor-pointer hover:brightness-110"
                  style={{ backgroundColor: theme.rgb }}
                >
                  <FaUpload className="w-3 h-3" />
                  <span className="hidden sm:inline">Upload</span>
                </button>
              </>
            )}
          </div>
        </div>

        {/* Inline Creation Bar (User Drive Only) */}
        {creatingType && !isReadOnly && (
          <div
            className={`shrink-0 px-4 py-2 border-b flex items-center gap-2 ${surface.subtleBg} ${surface.borderSubtle}`}
          >
            <span className="text-xs font-mono">
              New {creatingType === 'folder' ? 'Folder' : '.txt File'}:
            </span>
            <input
              type="text"
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate()
                if (e.key === 'Escape') setCreatingType(null)
              }}
              placeholder={creatingType === 'folder' ? 'Folder name' : 'notes.txt'}
              className={`flex-1 max-w-xs px-2.5 py-1 rounded-lg border text-xs focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
            />
            <button
              type="button"
              onClick={handleConfirmCreate}
              className="px-3 py-1 rounded-lg text-xs font-semibold text-white cursor-pointer"
              style={{ backgroundColor: theme.rgb }}
            >
              Create
            </button>
            <button
              type="button"
              onClick={() => setCreatingType(null)}
              className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
            >
              <FaTimes className="w-3 h-3" />
            </button>
          </div>
        )}

        {/* Split Body: File List + Preview/Editor Pane */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* File List */}
          <div className="flex-1 min-w-0 overflow-y-auto p-3 space-y-1">
            {visibleItems.length === 0 ? (
              <div
                className={`h-full flex flex-col items-center justify-center text-center gap-2 py-12 ${surface.textMuted}`}
              >
                <FaFolder className="w-8 h-8 opacity-30" />
                <p className="text-xs font-mono">
                  {searchQuery ? 'No matching files' : 'This folder is empty'}
                </p>
              </div>
            ) : (
              visibleItems.map((node) => {
                const isSelected = selectedFile?.id === node.id
                const isRenaming = renamingId === node.id

                return (
                  <div
                    key={node.id}
                    onClick={() => !isRenaming && handleOpenNode(node)}
                    className={`group px-3 py-2 rounded-xl flex items-center justify-between gap-2 text-xs transition cursor-pointer border ${
                      isSelected
                        ? 'border-current/20 bg-white/[0.08]'
                        : 'border-transparent hover:bg-white/[0.04]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {renderIcon(node)}
                      {isRenaming ? (
                        <input
                          type="text"
                          autoFocus
                          value={renameValue}
                          onClick={(e) => e.stopPropagation()}
                          onChange={(e) => setRenameValue(e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleConfirmRename(node)
                            if (e.key === 'Escape') setRenamingId(null)
                          }}
                          onBlur={() => handleConfirmRename(node)}
                          className={`px-2 py-0.5 rounded border text-xs w-44 focus:outline-none ${surface.appBg} ${surface.borderSubtle}`}
                        />
                      ) : (
                        <span className="truncate font-medium">{node.name}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <span
                        className={`hidden md:inline text-[10px] font-mono ${surface.textMuted}`}
                      >
                        {node.type === 'folder' ? 'Folder' : node.size || node.ext?.toUpperCase()}
                      </span>
                      <span
                        className={`hidden lg:inline text-[10px] font-mono ${surface.textMuted}`}
                      >
                        {node.updatedAt}
                      </span>

                      {/* User Drive Row Actions */}
                      {!isReadOnly && !isRenaming && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            title="Rename"
                            onClick={(e) => {
                              e.stopPropagation()
                              setRenamingId(node.id)
                              setRenameValue(node.name)
                            }}
                            className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
                          >
                            <FaEdit className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            title="Delete"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDeleteNode(node)
                            }}
                            className="p-1.5 rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 cursor-pointer"
                          >
                            <FaTrash className="w-3 h-3" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Right Preview / Editor Drawer */}
          {selectedFile && (
            <div
              className={`w-72 sm:w-80 md:w-96 shrink-0 border-l flex flex-col overflow-hidden ${surface.subtleBg} ${surface.borderSubtle}`}
            >
              {/* Preview Header */}
              <div
                className={`px-3.5 py-2.5 border-b flex items-center justify-between gap-2 ${surface.borderSubtle}`}
              >
                <div className="flex items-center gap-2 min-w-0">
                  {renderIcon(selectedFile)}
                  <span className="text-xs font-semibold truncate">
                    {selectedFile.name}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleDownloadFile(selectedFile)}
                    title="Download"
                    className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
                  >
                    <FaDownload className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedFile(null)}
                    title="Close Preview"
                    className={`p-1.5 rounded-lg border cursor-pointer ${btnClass}`}
                  >
                    <FaTimes className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* Preview Body */}
              <div className="flex-1 min-h-0 p-3.5 flex flex-col overflow-auto">
                {selectedFile.ext === 'txt' ? (
                  isReadOnly ? (
                    <pre className="text-xs font-mono whitespace-pre-wrap leading-relaxed select-text">
                      {selectedFile.content || '(Empty file)'}
                    </pre>
                  ) : (
                    <>
                      <textarea
                        value={editorText}
                        onChange={(e) => setEditorText(e.target.value)}
                        className={`flex-1 w-full resize-none rounded-xl border p-3 text-xs font-mono leading-relaxed focus:outline-none select-text ${surface.appBg} ${surface.borderSubtle}`}
                      />
                      <button
                        type="button"
                        onClick={handleSaveTextFile}
                        className="mt-2.5 w-full py-2 rounded-xl text-xs font-semibold text-white flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-110"
                        style={{ backgroundColor: theme.rgb }}
                      >
                        <FaSave className="w-3.5 h-3.5" />
                        <span>Save Changes</span>
                      </button>
                    </>
                  )
                ) : (
                  <div className="my-auto flex flex-col items-center text-center gap-3 p-4">
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center"
                      style={{
                        backgroundColor: `rgba(${accentRgbClean}, 0.14)`,
                      }}
                    >
                      {renderIcon(selectedFile)}
                    </div>
                    <div>
                      <p className="text-xs font-semibold break-all">
                        {selectedFile.name}
                      </p>
                      <p className={`text-[11px] font-mono mt-1 ${surface.textMuted}`}>
                        {selectedFile.ext?.toUpperCase()} Document ·{' '}
                        {selectedFile.size || 'Ready'}
                      </p>
                    </div>
                    {selectedFile.url && (
                      <div className="flex items-center gap-2 mt-1">
                        {selectedFile.ext === 'pdf' && (
                          <a
                            href={selectedFile.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 rounded-xl text-xs font-semibold text-white inline-flex items-center gap-1.5"
                            style={{ backgroundColor: theme.rgb }}
                          >
                            <span>Open PDF</span>
                            <FaExternalLinkAlt className="w-2.5 h-2.5" />
                          </a>
                        )}
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(selectedFile)}
                          className={`px-3 py-1.5 rounded-xl border text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer ${btnClass}`}
                        >
                          <FaDownload className="w-3 h-3" />
                          <span>Download</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Bottom Status Bar */}
        <div
          className={`shrink-0 px-3.5 py-1.5 border-t flex items-center justify-between text-[10px] font-mono ${surface.subtleBg} ${surface.borderSubtle} ${surface.textMuted}`}
        >
          <span>
            {visibleItems.length} item{visibleItems.length === 1 ? '' : 's'} ·{' '}
            {isReadOnly
              ? 'Admin Drive (View Only)'
              : `User Drive (${formatBytes(userDriveUsedBytes)} / ${formatBytes(MAX_USER_DRIVE_BYTES)})`}
          </span>
          {statusMsg && (
            <span style={{ color: theme.rgb }} className="font-semibold">
              {statusMsg}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}