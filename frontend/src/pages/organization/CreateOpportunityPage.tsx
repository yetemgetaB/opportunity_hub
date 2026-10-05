import { useState } from 'react'
import TextField from '../../components/ui/TextField'
import Select from '../../components/ui/Select'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
import OpportunitySkillTags from '../../components/opportunities/OpportunitySkillTags'
import { OpportunityFormSection, OpportunityTextarea } from '../../components/opportunities/OpportunityFormSection'
import type { PostOpportunityFormState } from '../../types/organization'
import { DEFAULT_OPPORTUNITY_FORM, EDUCATION_LEVELS, EXPERIENCE_LEVELS, OPPORTUNITY_TYPES } from '../../utils/organizationData'

export default function CreateOpportunityPage() {
  const [form, setForm] = useState<PostOpportunityFormState>(DEFAULT_OPPORTUNITY_FORM)

  function update<K extends keyof PostOpportunityFormState>(key: K, value: PostOpportunityFormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  function handleSubmit() {
    // TODO: send `form` to opportunityService.create(...)
    console.log('Publishing opportunity', form)
  }

  return (
    <div>
      <header className="mb-8">
        <h2 className="font-display text-3xl font-bold text-slate-900">Create a New Opportunity</h2>
        <p className="mt-1.5 text-base text-gray-500">
          Post an internship, job, fellowship, or event. Opportunity Hub will match qualified applicants.
        </p>
      </header>

      <div className="space-y-6">
        <OpportunityFormSection icon="info" title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Opportunity Title"
              required
              placeholder="e.g. AI Research Associate Intern"
              value={form.title}
              className="!h-[46px] !rounded-lg !px-4 !py-3"
              onChange={(e) => update('title', e.target.value)}
            />
            <Select
              label="Type"
              required
              options={OPPORTUNITY_TYPES}
              value={form.type}
              className="!h-[46px] !rounded-lg !bg-white !px-4 !py-3"
              onChange={(e) => update('type', e.target.value)}
            />
          </div>
          <OpportunityTextarea
            label="Description"
            required
            placeholder="Describe the role, expectations, and unique learning possibilities offered by this opportunity..."
            rows={4}
            value={form.description}
            onChange={(value) => update('description', value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Location"
              placeholder="e.g. Stanford, CA (Hybrid)"
              value={form.location}
              className="!h-[46px] !rounded-lg !px-4 !py-3"
              onChange={(e) => update('location', e.target.value)}
            />
            <TextField
              label="Field / Discipline"
              placeholder="e.g. Computer Science / AI"
              value={form.field}
              className="!h-[46px] !rounded-lg !px-4 !py-3"
              onChange={(e) => update('field', e.target.value)}
            />
          </div>
        </OpportunityFormSection>

        <OpportunityFormSection icon="check" title="Requirements & Matching Settings">
          <OpportunitySkillTags
            label="Required Skills"
            items={form.requiredSkills}
            required
            onAdd={(v) => update('requiredSkills', [...form.requiredSkills, v])}
            onRemove={(i) => update('requiredSkills', form.requiredSkills.filter((_, idx) => idx !== i))}
          />
          <OpportunitySkillTags
            label="Preferred Skills"
            items={form.preferredSkills}
            onAdd={(v) => update('preferredSkills', [...form.preferredSkills, v])}
            onRemove={(i) => update('preferredSkills', form.preferredSkills.filter((_, idx) => idx !== i))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Minimum Education Level"
              options={EDUCATION_LEVELS}
              value={form.educationLevel}
              className="!h-[46px] !rounded-lg !bg-white !px-4 !py-3"
              onChange={(e) => update('educationLevel', e.target.value)}
            />
            <Select
              label="Experience Level"
              options={EXPERIENCE_LEVELS}
              value={form.experienceLevel}
              className="!h-[46px] !rounded-lg !bg-white !px-4 !py-3"
              onChange={(e) => update('experienceLevel', e.target.value)}
            />
          </div>
          <OpportunityTextarea
            label="Responsibilities (Bulleted List)"
            placeholder={'- Design and implement neural networks under faculty mentor direction...'}
            rows={3}
            value={form.responsibilities}
            onChange={(value) => update('responsibilities', value)}
          />
        </OpportunityFormSection>

        <OpportunityFormSection icon="calendar" title="Application & Timeline Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Application Deadline"
              type="date"
              value={form.applicationDeadline}
              className="!h-[46px] !rounded-lg !px-4 !py-3"
              onChange={(e) => update('applicationDeadline', e.target.value)}
            />
            <TextField
              label="Max Applicant Limit"
              type="number"
              placeholder="e.g. 50"
              value={form.maxApplicants}
              className="!h-[46px] !rounded-lg !px-4 !py-3"
              onChange={(e) => update('maxApplicants', e.target.value)}
            />
          </div>
        </OpportunityFormSection>
      </div>

      <div className="mt-6 flex justify-end pt-2">
        <Button onClick={handleSubmit} className="h-12 rounded-full px-8 text-base font-bold">
          <span className="flex items-center gap-2">
            Publish Opportunity <Icon name="arrowRight" className="size-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}