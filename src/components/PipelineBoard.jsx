import { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stages } from "../data/seedJobs";
import { jobActions, selectors } from "../store/jobStore";
import { SectionCard } from "./SectionCard";

const PAGE_SIZE = 9;

const stageDisplayMap = {
  Wishlist: "Waitlist",
};

const formatDate = (value) => {
  if (!value) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
};

const getStageClassName = (stage) =>
  `status-pill--${stage.toLowerCase().replace(/\s+/g, "-")}`;

const getStageLabel = (stage) => stageDisplayMap[stage] ?? stage;

const getTimelineDateForStage = (job, stage) => {
  if (stage === "Wishlist") {
    const savedEvent = job.timeline.find((item) => item.label === "Saved role to wishlist");
    return savedEvent?.date ?? "";
  }

  if (stage === "Applied") {
    const appliedEvent = job.timeline.find(
      (item) => item.label === "Added application" || item.label === "Moved to Applied",
    );
    return job.appliedOn || appliedEvent?.date || "";
  }

  return (
    job.timeline.find((item) => item.label === `Moved to ${stage}`)?.date ?? ""
  );
};

function PipelineCard({ job, onOpen }) {
  return (
    <article className="pipeline-card pipeline-card--grid">
      <button type="button" className="pipeline-card__main" onClick={() => onOpen(job.id)}>
        <div className="pipeline-card__topline">
          <strong>{job.company}</strong>
          <span className={`status-pill ${getStageClassName(job.stage)}`}>
            {getStageLabel(job.stage)}
          </span>
        </div>
        <h3>{job.role}</h3>
        <div className="pipeline-card__meta">
          <span>Applied {formatDate(job.appliedOn)}</span>
        </div>
      </button>
      <button type="button" className="primary-button pipeline-card__view" onClick={() => onOpen(job.id)}>
        View Details
      </button>
    </article>
  );
}

function PipelineDetailPanel({ job, note, onNoteChange, onAddNote }) {
  const dispatch = useDispatch();

  if (!job) {
    return (
      <aside className="pipeline-detail pipeline-detail--empty">
        <h3>Application Details</h3>
        <p className="empty-state">
          Select an application to review its timeline, notes, and next stage.
        </p>
      </aside>
    );
  }

  const currentStageIndex = stages.indexOf(job.stage);

  return (
    <aside className="pipeline-detail">
      <div className="pipeline-detail__header">
        <div>
          <span className="pipeline-detail__eyebrow">Selected Application</span>
          <h3>{job.role}</h3>
          <p>
            {job.company} • {job.location}
          </p>
        </div>
        <span className={`status-pill ${getStageClassName(job.stage)}`}>
          {getStageLabel(job.stage)}
        </span>
      </div>

      <div className="pipeline-detail__actions">
        <button
          type="button"
          className="pipeline-detail__stage-button"
          disabled={currentStageIndex === 0}
          onClick={() => dispatch(jobActions.moveJobStage(job.id, -1))}
        >
          Move Back
        </button>
        <button
          type="button"
          className="primary-button"
          disabled={currentStageIndex === stages.length - 1}
          onClick={() => dispatch(jobActions.moveJobStage(job.id, 1))}
        >
          Move Forward
        </button>
      </div>

      <div className="pipeline-detail__stats">
        <div>
          <span>Applied</span>
          <strong>{formatDate(job.appliedOn)}</strong>
        </div>
        <div>
          <span>Recruiter</span>
          <strong>{job.recruiter || "Pending"}</strong>
        </div>
        <div>
          <span>Contact</span>
          <strong>{job.contactEmail || "Not added"}</strong>
        </div>
        <div>
          <span>Status</span>
          <strong>{["Rejected", "Ghosted"].includes(job.stage) ? job.stage : "Active"}</strong>
        </div>
      </div>

      <div className="pipeline-progress">
        {stages.map((stage, index) => {
          const isReached = index <= currentStageIndex;
          const isCurrent = stage === job.stage;
          const stageDate = getTimelineDateForStage(job, stage);

          return (
            <div
              key={stage}
              className={`pipeline-progress__item${isReached ? " pipeline-progress__item--reached" : ""}${isCurrent ? " pipeline-progress__item--current" : ""}`}
            >
              <div className="pipeline-progress__marker" />
              <div>
                <strong>{getStageLabel(stage)}</strong>
                <span>{stageDate ? formatDate(stageDate) : "Pending"}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="pipeline-detail__panel">
        <h4>Notes</h4>
        <form className="note-form" onSubmit={onAddNote}>
          <textarea
            rows="3"
            value={note}
            onChange={(event) => onNoteChange(event.target.value)}
            placeholder="Add follow-up details, prep notes, or recruiter updates."
          />
          <button className="primary-button" type="submit">
            Add Note
          </button>
        </form>
        <div className="notes-list">
          {job.notes.length ? (
            job.notes.map((item) => (
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

      <div className="pipeline-detail__panel">
        <h4>Additional Details</h4>
        <p className="pipeline-detail__summary">{job.summary}</p>
        <div className="timeline-list">
          {job.timeline.map((item) => (
            <div key={item.id} className="timeline-item">
              <span>{formatDate(item.date)}</span>
              <p>{item.label}</p>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}

export function PipelineBoard() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectors.jobs);
  const selectedJob = useSelector(selectors.selectedJob);
  const [activeStage, setActiveStage] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [note, setNote] = useState("");

  const stageCounts = useMemo(
    () =>
      Object.fromEntries(stages.map((stage) => [stage, jobs.filter((job) => job.stage === stage).length])),
    [jobs],
  );

  const filteredJobs = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    return jobs.filter((job) => {
      const matchesStage = activeStage === "All" || job.stage === activeStage;
      const matchesSearch =
        !query ||
        job.company.toLowerCase().includes(query) ||
        job.role.toLowerCase().includes(query);

      return matchesStage && matchesSearch;
    });
  }, [activeStage, jobs, searchTerm]);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeStage, searchTerm]);

  const visibleJobs = filteredJobs.slice(0, visibleCount);
  const hasMore = visibleCount < filteredJobs.length;

  const handleOpenDetails = (jobId) => {
    dispatch(jobActions.selectJob(jobId));
  };

  const handleAddNote = (event) => {
    event.preventDefault();

    if (!selectedJob || !note.trim()) {
      return;
    }

    dispatch(jobActions.addNote(selectedJob.id, note.trim()));
    setNote("");
  };

  return (
    <SectionCard title="Application Pipeline" eyebrow="Pipeline">
      <div className="pipeline-toolbar">
        <label className="pipeline-search">
          Search
          <input
            type="search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search company or position"
          />
        </label>
        <div className="pipeline-results">
          <strong>{filteredJobs.length}</strong>
          <span>matching applications</span>
        </div>
      </div>

      <div className="pipeline-tabs" role="tablist" aria-label="Application stages">
        <button
          type="button"
          className={`pipeline-tab${activeStage === "All" ? " pipeline-tab--active" : ""}`}
          onClick={() => setActiveStage("All")}
        >
          All ({jobs.length})
        </button>
        {stages.map((stage) => (
          <button
            key={stage}
            type="button"
            className={`pipeline-tab${activeStage === stage ? " pipeline-tab--active" : ""}`}
            onClick={() => setActiveStage(stage)}
          >
            {getStageLabel(stage)} ({stageCounts[stage]})
          </button>
        ))}
      </div>

      <div className="pipeline-layout">
        <div className="pipeline-content">
          {visibleJobs.length ? (
            <div className="pipeline-grid">
              {visibleJobs.map((job) => (
                <PipelineCard key={job.id} job={job} onOpen={handleOpenDetails} />
              ))}
            </div>
          ) : (
            <div className="pipeline-empty">
              <p className="empty-state">No applications match this stage and search combination.</p>
            </div>
          )}

          {hasMore ? (
            <button
              type="button"
              className="pipeline-load-more"
              onClick={() => setVisibleCount((current) => current + PAGE_SIZE)}
            >
              Load More
            </button>
          ) : null}
        </div>

        <PipelineDetailPanel
          job={selectedJob}
          note={note}
          onNoteChange={setNote}
          onAddNote={handleAddNote}
        />
      </div>
    </SectionCard>
  );
}
