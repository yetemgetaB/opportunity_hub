import { useRef, useState, type DragEvent } from 'react'
import Icon from './Icon'

type Props = {
  hint: string
  fileName: string | null
  onFile: (name: string) => void
  onClear: () => void
  compact?: boolean
  accept: string[] // e.g. ['pdf', 'docx']
  maxSizeMB: number
}

export default function Dropzone({ hint, fileName, onFile, onClear, compact, accept, maxSizeMB }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragOver, setDragOver] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const acceptLabel = accept.map((a) => a.toUpperCase()).join(', ')
  const acceptAttr = accept.map((a) => `.${a}`).join(',')

  function validate(file: File): string | null {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? ''
    if (!accept.includes(ext)) {
      return `"${file.name}" isn't a supported format. Use ${acceptLabel}.`
    }
    if (file.size > maxSizeMB * 1024 * 1024) {
      return `"${file.name}" is over the ${maxSizeMB}MB limit.`
    }
    return null
  }

  function handleFile(file: File) {
    const problem = validate(file)
    if (problem) {
      setError(problem)
      return
    }
    setError(null)
    onFile(file.name)
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`rounded-xl border-2 border-dashed p-6 text-center transition ${
          dragOver ? 'border-brand bg-amber-50' : error ? 'border-red-300' : 'border-slate-200'
        }`}
      >
        {fileName ? (
          <div className="flex items-center justify-center gap-3 text-sm">
            <Icon name="file" className="h-5 w-5 text-brand" />
            <span className="font-medium text-navy">{fileName}</span>
            <button
              type="button"
              onClick={() => { onClear(); setError(null) }}
              aria-label="Remove file"
              className="text-slate-400 hover:text-red-500"
            >
              <Icon name="x" className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <>
            <Icon name="upload" className={`mx-auto text-brand ${compact ? 'h-6 w-6' : 'h-8 w-8'}`} />
            <p className={`mt-3 ${compact ? 'text-xs font-semibold text-navy' : 'text-sm text-slate-600'}`}>
              {compact ? hint : <>Drag and drop your CV here<br /><span className="text-xs text-slate-400">or</span></>}
            </p>
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-3 rounded-md bg-brand px-4 py-2 text-xs font-semibold text-navy hover:brightness-110"
            >
              Choose File
            </button>
            {compact && <span className="ml-2 text-xs text-slate-400">or drag and drop</span>}
            <input
              ref={inputRef}
              type="file"
              accept={acceptAttr}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFile(file)
              }}
            />
          </>
        )}
      </div>
      <p className="mt-2 text-xs text-slate-400">
        Accepted formats: {acceptLabel} · Max size: {maxSizeMB}MB
      </p>
      {error && <p role="alert" className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  )
}