import { useState } from 'react'
import TextField from '../../components/ui/TextField'
import Textarea from '../../components/ui/Textarea'
import Select from '../../components/ui/Select'
import TagList from '../../components/ui/TagList'
import SectionCard from '../../components/ui/SectionCard'
import Button from '../../components/ui/Button'
import Icon from '../../components/ui/Icon'
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
      <h2 className="text-2xl font-bold text-navy">Create a New Opportunity</h2>
      <p className="mt-1 text-sm text-slate-500">
        Post an internship, job, fellowship, or event. Opportunity Hub will match qualified applicants.
      </p>

      <div className="mt-6 space-y-6">
        <SectionCard icon="info" title="Basic Information">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Opportunity Title"
              required
              placeholder="e.g. AI Research Associate Intern"
              value={form.title}
              onChange={(e) => update('title', e.target.value)}
            />
            <Select
              label="Type"
              required
              options={OPPORTUNITY_TYPES}
              value={form.type}
              onChange={(e) => update('type', e.target.value)}
            />
          </div>
          <Textarea
            label="Description"
            required
            placeholder="Describe the role, expectations, and unique learning possibilities offered by this opportunity..."
            rows={3}
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Location"
              placeholder="e.g. Stanford, CA (Hybrid)"
              value={form.location}
              onChange={(e) => update('location', e.target.value)}
            />
            <TextField
              label="Field / Discipline"
              placeholder="e.g. Computer Science / AI"
              value={form.field}
              onChange={(e) => update('field', e.target.value)}
            />
          </div>
        </SectionCard>

        <SectionCard icon="check" title="Requirements & Matching Settings">
          <TagList
            label="Required Skills"
            items={form.requiredSkills}
            addLabel="Add Skill"
            onAdd={(v) => update('requiredSkills', [...form.requiredSkills, v])}
            onRemove={(i) => update('requiredSkills', form.requiredSkills.filter((_, idx) => idx !== i))}
          />
          <TagList
            label="Preferred Skills"
            items={form.preferredSkills}
            addLabel="Add Skill"
            onAdd={(v) => update('preferredSkills', [...form.preferredSkills, v])}
            onRemove={(i) => update('preferredSkills', form.preferredSkills.filter((_, idx) => idx !== i))}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              label="Minimum Education Level"
              options={EDUCATION_LEVELS}
              value={form.educationLevel}
              onChange={(e) => update('educationLevel', e.target.value)}
            />
            <Select
              label="Experience Level"
              options={EXPERIENCE_LEVELS}
              value={form.experienceLevel}
              onChange={(e) => update('experienceLevel', e.target.value)}
            />
          </div>
          <Textarea
            label="Responsibilities (Bulleted List)"
            placeholder={'- Design and implement neural networks under faculty mentor direction...'}
            rows={3}
            value={form.responsibilities}
            onChange={(e) => update('responsibilities', e.target.value)}
          />
        </SectionCard>

        <SectionCard icon="calendar" title="Application & Timeline Settings">
          <div className="grid gap-4 sm:grid-cols-2">
            <TextField
              label="Application Deadline"
              type="date"
              value={form.applicationDeadline}
              onChange={(e) => update('applicationDeadline', e.target.value)}
              action={<Icon name="calendar" className="h-4 w-4 text-slate-400" />}
            />
            <TextField
              label="Max Applicant Limit"
              type="number"
              placeholder="e.g. 50"
              value={form.maxApplicants}
              onChange={(e) => update('maxApplicants', e.target.value)}
            />
          </div>
        </SectionCard>
      </div>

      <div className="mt-6 flex justify-end">
        <Button onClick={handleSubmit}>
          <span className="flex items-center gap-2">
            Publish Opportunity <Icon name="arrowRight" className="h-4 w-4" />
          </span>
        </Button>
      </div>
    </div>
  )
}