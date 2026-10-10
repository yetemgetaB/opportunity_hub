import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import Icon from '../ui/Icon'
import ApplicationStatusBadge from './ApplicationStatusBadge'
import type { ApplicationItem } from '../../types/application'
import { applicationDateLabel, applicationOrganizationName } from '../../utils/applicationData'

type Props = {
  item: ApplicationItem
  onClose: () => void
  onWithdraw?: (applicationId: string) => Promise<void>
}

export default function ApplicationDetailsModal({ item, onClose, onWithdraw }: Props) {
  const [withdrawing, setWithdrawing] = useState(false)
  const [confirmWithdraw, setConfirmWithdraw] = useState(false)
  const canWithdraw = !['ACCEPTED', 'REJECTED', 'WITHDRAWN'].includes(item.status)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  async function handleWithdraw() {
    if (!onWithdraw) return
    setWithdrawing(true)
    try {
      await onWithdraw(item.id)
      setConfirmWithdraw(false)
      onClose()
    } catch {
      // Handled by parent or toast
    } finally {
      setWithdrawing(false)
    }
  }

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

        <div className="px-6 py-5 space-y-5">
          {/* Status Pipeline Visualizer */}
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">Application Progress</p>
            <div className="space-y-3">
              {[
                { stage: 'SUBMITTED', title: 'Application Submitted', desc: `Submitted on ${applicationDateLabel(item.appliedAt)}` },
                { stage: 'UNDER_REVIEW', title: 'Under Recruiter Review', desc: 'The hiring team is reviewing your profile and skills' },
                { stage: 'SHORTLISTED', title: 'Shortlisted for Next Steps', desc: 'Candidate shortlisted for interview or assessment' },
                { stage: 'ACCEPTED', title: 'Offer Extended / Accepted', desc: 'Congratulations! Selected for this opportunity' },
              ].map((step, idx) => {
                const isRejected = item.status === 'REJECTED'
                const statusOrder = ['SUBMITTED', 'UNDER_REVIEW', 'SHORTLISTED', 'ACCEPTED']
                const currentIdx = statusOrder.indexOf(item.status)
                const isComplete = !isRejected && currentIdx >= idx
                const isCurrent = !isRejected && item.status === step.stage

                return (
                  <div key={step.stage} className="flex items-start gap-3 relative">
                    {idx < 3 && (
                      <div
                        className={`absolute left-3.5 top-7 bottom-0 w-0.5 -mb-3 ${
                          isComplete && currentIdx > idx ? 'bg-amber-400' : 'bg-slate-200'
                        }`}
                      />
                    )}
                    <div
                      className={`grid size-7 shrink-0 place-items-center rounded-full text-xs font-bold transition z-10 ${
                        isComplete
                          ? 'bg-amber-500 text-white shadow-xs'
                          : 'bg-slate-100 text-slate-400'
                      }`}
                    >
                      {isComplete ? '✓' : idx + 1}
                    </div>
                    <div className="min-w-0 flex-1 pt-0.5">
                      <p className={`text-xs font-bold ${isCurrent ? 'text-navy' : isComplete ? 'text-slate-800' : 'text-slate-400'}`}>
                        {step.title}
                      </p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{step.desc}</p>
                    </div>
                  </div>
                )
              })}
              {item.status === 'REJECTED' && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs text-red-700 mt-2">
                  <p className="font-bold">Application Status: Not Selected</p>
                  <p className="mt-0.5 text-red-600">The organization has chosen not to move forward at this time.</p>
                </div>
              )}
            </div>
          </div>

          <dl className="grid grid-cols-2 gap-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3.5">
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Date Applied</dt>
              <dd className="mt-0.5 text-xs font-bold text-navy">{applicationDateLabel(item.appliedAt)}</dd>
            </div>
            <div>
              <dt className="text-[11px] font-medium text-slate-400">Current Status</dt>
              <dd className="mt-0.5">
                <ApplicationStatusBadge status={item.status} />
              </dd>
            </div>
          </dl>
        </div>

        {confirmWithdraw && (
          <div className="border-t border-amber-200 bg-amber-50/70 p-4 text-xs text-amber-950 space-y-2">
            <p className="font-bold">Withdraw this application?</p>
            <p className="text-amber-800">
              The organization will be notified that you have withdrawn from consideration. This action cannot be undone.
            </p>
            <div className="flex gap-2 pt-1">
              <button
                type="button"
                onClick={handleWithdraw}
                disabled={withdrawing}
                className="rounded-lg bg-red-600 px-3 py-1.5 font-bold text-white shadow-xs hover:bg-red-700 disabled:opacity-50"
              >
                {withdrawing ? 'Withdrawing…' : 'Yes, Withdraw'}
              </button>
              <button
                type="button"
                onClick={() => setConfirmWithdraw(false)}
                disabled={withdrawing}
                className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50"
              >
                Keep Application
              </button>
            </div>
          </div>
        )}

        <div className="flex items-center gap-2.5 border-t border-slate-100 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl border border-slate-200 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition active:scale-[0.98]"
          >
            Close
          </button>
          {canWithdraw && !confirmWithdraw && onWithdraw && (
            <button
              type="button"
              onClick={() => setConfirmWithdraw(true)}
              className="rounded-xl border border-red-200/90 px-3 py-2.5 text-xs font-semibold text-red-600 hover:bg-red-50/60 transition active:scale-[0.98]"
            >
              Withdraw
            </button>
          )}
          {item.opportunityId && (
            <Link
              to={`/student/opportunities/${item.opportunityId}`}
              className="flex-1 rounded-xl bg-navy py-2.5 text-center text-xs font-bold !text-white shadow-xs hover:bg-navy-light transition active:scale-[0.98] dark-button-dark"
            >
              View Opportunity
            </Link>
          )}
        </div>
      </div>
    </div>
  )
}