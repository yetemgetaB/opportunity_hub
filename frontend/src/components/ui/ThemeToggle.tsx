import { useTheme } from '../../context/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <div className="inline-flex items-center gap-0.5 rounded-full bg-white/10 p-0.5" role="group" aria-label="Theme">
      <button
        type="button"
        onClick={() => isDark && toggleTheme()}
        aria-label="Light mode"
        aria-pressed={!isDark}
        className={`grid h-5 w-5 place-items-center rounded-full text-[11px] transition ${
          !isDark ? 'bg-brand text-navy' : 'text-slate-400 hover:text-white'
        }`}
      >
        ☀
      </button>
      <button
        type="button"
        onClick={() => !isDark && toggleTheme()}
        aria-label="Dark mode"
        aria-pressed={isDark}
        className={`grid h-5 w-5 place-items-center rounded-full text-[11px] transition ${
          isDark ? 'bg-brand text-navy' : 'text-slate-400 hover:text-white'
        }`}
      >
        ☾
      </button>
    </div>
  )
}