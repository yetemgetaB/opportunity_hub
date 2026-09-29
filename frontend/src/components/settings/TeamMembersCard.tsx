import Icon from '../ui/Icon'
import { TEAM_MEMBERS } from '../../utils/organizationData'

export default function TeamMembersCard() {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="grid h-6 w-6 place-items-center rounded-full bg-amber-100 text-brand">
            <Icon name="users" className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-sm font-bold text-navy">Team Members</h2>
        </div>
        {/* TODO: wire this up to a real invite flow */}
        <button className="flex items-center gap-1 text-xs font-semibold text-brand hover:underline">
          <Icon name="plus" className="h-3.5 w-3.5" />
          Invite Member
        </button>
      </div>

      <ul className="mt-3 divide-y divide-slate-100">
        {TEAM_MEMBERS.map((m) => (
          <li key={m.id} className="flex items-center justify-between gap-3 py-3.5">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-[11px] font-bold text-white">
                {m.initials}
              </span>
              <div>
                <p className="text-sm font-medium text-navy">{m.name}</p>
                <p className="text-xs text-slate-400">{m.email}</p>
              </div>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-medium ${
                m.role === 'Admin' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {m.role}
            </span>
          </li>
        ))}
      </ul>
    </section>
  )
}