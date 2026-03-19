import { useDispatch, useSelector } from 'react-redux'
import { stages } from '../data/seedJobs'
import { jobActions, selectors } from '../store/jobStore'
import { SectionCard } from './SectionCard'

function PipelineCard({ job }) {
  const dispatch = useDispatch()
  const currentStageIndex = stages.indexOf(job.stage)

  return (
    <article className="pipeline-card">
      <button
        type="button"
        className="pipeline-card__main"
        onClick={() => dispatch(jobActions.selectJob(job.id))}
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
          Back
        </button>
        <button
          type="button"
          disabled={currentStageIndex === stages.length - 1}
          onClick={() => dispatch(jobActions.moveJobStage(job.id, 1))}
        >
          Forward
        </button>
      </div>
    </article>
  )
}

export function PipelineBoard() {
  const jobs = useSelector(selectors.jobs)

  return (
    <SectionCard title="Pipeline board" eyebrow="Kanban">
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
                  <p className="empty-state">No roles in this stage.</p>
                )}
              </div>
            </section>
          )
        })}
      </div>
    </SectionCard>
  )
}
