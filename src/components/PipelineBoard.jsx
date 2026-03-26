import { useDispatch, useSelector } from 'react-redux'
import { stages } from '../data/seedJobs'
import { jobActions, selectors } from '../store/jobStore'
import { SectionCard } from './SectionCard'

const scrollToApplicationDetails = () => {
  window.requestAnimationFrame(() => {
    document.getElementById('application-details')?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    })
  })
}

function PipelineCard({ job }) {
  const dispatch = useDispatch()
  const currentStageIndex = stages.indexOf(job.stage)
  const handleSelectJob = () => {
    dispatch(jobActions.selectJob(job.id))
    scrollToApplicationDetails()
  }

  return (
    <article className="pipeline-card">
      <button
        type="button"
        className="pipeline-card__main"
        onClick={handleSelectJob}
      >
        <strong>{job.company}</strong>
        <h3>{job.role}</h3>
        <p>{job.location}</p>
        <span>{job.salary}</span>
      </button>
      <div className="pipeline-card__actions">
        <button
          type="button"
          disabled={currentStageIndex === 0}
          onClick={() => dispatch(jobActions.moveJobStage(job.id, -1))}
        >
          Move Back
        </button>
        <button
          type="button"
          disabled={currentStageIndex === stages.length - 1}
          onClick={() => dispatch(jobActions.moveJobStage(job.id, 1))}
        >
          Move Forward
        </button>
      </div>
    </article>
  )
}

export function PipelineBoard() {
  const jobs = useSelector(selectors.jobs)

  return (
    <SectionCard title="Application Pipeline" eyebrow="Pipeline">
      <div className="pipeline-board">
        {stages.map((stage) => {
          const stageJobs = jobs.filter((job) => job.stage === stage)

          return (
            <section key={stage} className="pipeline-column">
              <div className="pipeline-column__header">
                <h3>{stage}</h3>
                <span>{stageJobs.length}</span>
              </div>
              <div className="pipeline-column__body">
                {stageJobs.length ? (
                  stageJobs.map((job) => <PipelineCard key={job.id} job={job} />)
                ) : (
                  <p className="empty-state">No applications are currently in this stage.</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </SectionCard>
  )
}
