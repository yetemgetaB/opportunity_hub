type Props = { checked: boolean; onChange: (checked: boolean) => void; label: string }

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors ${checked ? 'toggle-track-on dark-toggle-on' : 'toggle-track-off dark-toggle-off'}`}
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          height: '16px',
          width: '16px',
          borderRadius: '9999px',
          transform: checked ? 'translateX(16px)' : 'translateX(0px)',
          transition: 'transform 150ms ease',
        }}
        className="toggle-knob dark-toggle-knob bg-white"
      />
    </button>
  )
}