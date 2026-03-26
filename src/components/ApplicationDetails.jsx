import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stages } from '../data/seedJobs'
import { jobActions, selectors } from '../store/jobStore'
import { SectionCard } from './SectionCard'

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  )

function ContactInfoForm({ job, onSave }) {
  const [contactForm, setContactForm] = useState({
    recruiter: job.recruiter ?? '',
    contactEmail: job.contactEmail ?? '',
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    onSave(contactForm)
  }

  return (
    <form className="note-form" onSubmit={handleSubmit}>
      <label>
        Recruiter
        <input
          value={contactForm.recruiter}
          onChange={(event) =>
            setContactForm((current) => ({
              ...current,
              recruiter: event.target.value,
            }))
          }
          placeholder="Recruiter name"
        />
      </label>
      <label>
        Contact Email
        <input
          type="email"
          value={contactForm.contactEmail}
          onChange={(event) =>
            setContactForm((current) => ({
              ...current,
              contactEmail: event.target.value,
            }))
          }
          placeholder="recruiter@company.com"
        />
      </label>
      <button className="primary-button" type="submit">
        Save Contact Information
      </button>
    </form>
  )
}

export function ApplicationDetails() {
  const dispatch = useDispatch()
  const selectedJob = useSelector(selectors.selectedJob)
  const [note, setNote] = useState('')

  if (!selectedJob) {
    return (
      <SectionCard id="application-details" title="Application Details" eyebrow="Details">
        <p className="empty-state">Select an application to view its full record.</p>
      </SectionCard>
    )
  }

  const handleAddNote = (event) => {
    event.preventDefault()

    const trimmedNote = note.trim()
    if (!trimmedNote) {
      return
    }

    dispatch(jobActions.addNote(selectedJob.id, trimmedNote))
    setNote('')
  }

  const handleMetaSubmit = (payload) => {
    dispatch(
      jobActions.updateJobMeta(selectedJob.id, {
        recruiter: payload.recruiter,
        contactEmail: payload.contactEmail,
      }),
    )
  }

  const handleDeleteJob = () => {
    dispatch(jobActions.deleteJob(selectedJob.id))
  }

  return (
    <SectionCard
      id="application-details"
      title="Application Details"
      eyebrow="Details"
      action={
        <div className="details-actions">
          <span className={`status-pill status-pill--${selectedJob.stage.toLowerCase()}`}>
            {selectedJob.stage}
          </span>
          <button type="button" className="danger-button" onClick={handleDeleteJob}>
            Delete Application
          </button>
        </div>
      }
    >
      <div className="details-grid">
        <div className="details-grid__summary">
          <div className="details-heading">
            <div>
              <h3>{selectedJob.role}</h3>
              <p>
                {selectedJob.company} - {selectedJob.location}
              </p>
            </div>
            <select
              value={selectedJob.stage}
              onChange={(event) =>
                dispatch(jobActions.updateJobStage(selectedJob.id, event.target.value))
              }
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </div>

          <p className="details-summary">{selectedJob.summary}</p>

          <div className="detail-stats">
            <div>
              <span>Applied</span>
              <strong>{selectedJob.appliedOn ? formatDate(selectedJob.appliedOn) : 'Not yet'}</strong>
            </div>
            <div>
              <span>Recruiter</span>
              <strong>{selectedJob.recruiter}</strong>
            </div>
            <div>
              <span>Contact</span>
              <strong>{selectedJob.contactEmail || 'Not added'}</strong>
            </div>
          </div>
        </div>

        <div className="details-grid__column">
          <div className="details-panel">
            <h3>Timeline</h3>
            <div className="timeline-list">
              {selectedJob.timeline.map((item) => (
                <div key={item.id} className="timeline-item">
                  <span>{item.date}</span>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="details-grid__column">
          <div className="details-panel">
            <h3>Recruiter Information</h3>
            <ContactInfoForm
              key={selectedJob.id}
              job={selectedJob}
              onSave={handleMetaSubmit}
            />
          </div>

          <div className="details-panel">
            <h3>Notes</h3>
            <form className="note-form" onSubmit={handleAddNote}>
              <textarea
                rows="4"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Record interview preparation notes, follow-up actions, or important context."
              />
              <button className="primary-button" type="submit">
                Add Note
              </button>
            </form>
            <div className="notes-list">
              {selectedJob.notes.length ? (
                selectedJob.notes.map((item) => (
                  <article key={item.id} className="note-card">
                    <span>{formatDate(item.createdAt)}</span>
                    <p>{item.content}</p>
                  </article>
                ))
              ) : (
                <p className="empty-state">No notes have been added to this application yet.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
