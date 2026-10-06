import { useEffect } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import type { ApplicationItem } from '../../types/application'
import { applicationDateLabel, applicationOrganizationName } from '../../utils/applicationData'

type Props = { item: ApplicationItem; onClose: () => void }

export default function ApplicationDetailsModal({ item, onClose }: Props) {
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/55 p-4"
      role="dialog"
      aria-modal="true"
      aria-label={`${item.opportunity?.title ?? 'Opportunity'} application details`}
      onClick={onClose}
    >
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-3 border-b border-slate-100 px-6 py-5">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-navy text-sm font-bold text-white">
            {applicationOrganizationName(item)[0]}
          </span>
          <div className="min-w-0 flex-1">
            <h2 className="text-base font-bold text-navy">{item.opportunity?.title ?? 'Opportunity'}</h2>
            <p className="text-xs text-slate-500">
              {applicationOrganizationName(item)}
            </p>
          </div>
          <button type="button" onClick={onClose} aria-label="Close" className="text-slate-400 hover:text-navy">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        <dl className="grid grid-cols-2 gap-4 px-6 py-5">
          <div>
            <dt className="text-xs text-slate-400">Applied</dt>
            <dd className="mt-1 text-sm font-semibold text-navy">{applicationDateLabel(item.appliedAt)}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Status</dt>
            <dd className="mt-1">
              <ApplicationStatusBadge status={item.status} />
            </dd>
          </div>
        </dl>

        <div className="flex gap-3 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-md border border-slate-200 py-2.5 text-xs font-semibold text-navy hover:bg-slate-50"
          >
            Close
          </button>
          {item.opportunityId && (
            <Link
              to={`/student/opportunities/${item.opportunityId}`}
              className="flex-1 rounded-md bg-brand py-2.5 text-center text-xs font-semibold text-navy hover:brightness-110"
            >
              View Opportunity
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}