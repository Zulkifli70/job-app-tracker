import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { stages } from '../data/seedJobs'
import { jobActions, selectors } from '../store/jobStore'
import { SectionCard } from './SectionCard'

const formatDate = (value) =>
  new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', year: 'numeric' }).format(
    new Date(value),
  )

export function ApplicationDetails() {
  const dispatch = useDispatch()
  const selectedJob = useSelector(selectors.selectedJob)
  const [note, setNote] = useState('')
  const [contactForm, setContactForm] = useState({
    recruiter: '',
    contactEmail: '',
  })

  if (!selectedJob) {
    return (
      <SectionCard title="Application details" eyebrow="Focus view">
        <p className="empty-state">Select a role to inspect the full application record.</p>
      </SectionCard>
    )
  }

  useEffect(() => {
    setContactForm({
      recruiter: selectedJob.recruiter ?? '',
      contactEmail: selectedJob.contactEmail ?? '',
    })
  }, [selectedJob])

  const handleAddNote = (event) => {
    event.preventDefault()

    const trimmedNote = note.trim()
    if (!trimmedNote) {
      return
    }

    dispatch(jobActions.addNote(selectedJob.id, trimmedNote))
    setNote('')
  }

  const handleMetaSubmit = (event) => {
    event.preventDefault()

    dispatch(
      jobActions.updateJobMeta(selectedJob.id, {
        recruiter: contactForm.recruiter,
        contactEmail: contactForm.contactEmail,
      }),
    )
  }

  const handleDeleteJob = () => {
    dispatch(jobActions.deleteJob(selectedJob.id))
  }

  return (
    <SectionCard
      title="Application details"
      eyebrow="Deep dive"
      action={
        <div className="details-actions">
          <span className={`status-pill status-pill--${selectedJob.stage.toLowerCase()}`}>
            {selectedJob.stage}
          </span>
          <button type="button" className="danger-button" onClick={handleDeleteJob}>
            Delete job
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
              <span>Compensation</span>
              <strong>{selectedJob.salary}</strong>
            </div>
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
            <h3>Documents</h3>
            <div className="chip-list">
              {selectedJob.documents.length ? (
                selectedJob.documents.map((document) => (
                  <span key={document.id} className="document-chip">
                    {document.type}: {document.label}
                  </span>
                ))
              ) : (
                <p className="empty-state">No documents attached.</p>
              )}
            </div>
          </div>

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
            <h3>Recruiter and contact</h3>
            <form className="note-form" onSubmit={handleMetaSubmit}>
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
                Contact email
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
                Save contact info
              </button>
            </form>
          </div>

          <div className="details-panel">
            <h3>Notes</h3>
            <form className="note-form" onSubmit={handleAddNote}>
              <textarea
                rows="4"
                value={note}
                onChange={(event) => setNote(event.target.value)}
                placeholder="Capture prep notes, follow-ups, or compensation questions."
              />
              <button className="primary-button" type="submit">
                Add note
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
                <p className="empty-state">No notes yet for this application.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </SectionCard>
  )
}
