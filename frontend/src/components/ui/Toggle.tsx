type Props = { checked: boolean; onChange: (checked: boolean) => void; label: string }

export default function Toggle({ checked, onChange, label }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      style={{ backgroundColor: checked ? '#f5a623' : '#e2e8f0' }}
      className="relative inline-block h-5 w-9 shrink-0 rounded-full transition-colors"
    >
      <span
        style={{
          position: 'absolute',
          top: '2px',
          left: '2px',
          height: '16px',
          width: '16px',
          borderRadius: '9999px',
          backgroundColor: '#ffffff',
          boxShadow: '0 1px 2px rgba(0,0,0,0.2)',
          transform: checked ? 'translateX(16px)' : 'translateX(0px)',
          transition: 'transform 150ms ease',
        }}
      />
    </button>
  )
}