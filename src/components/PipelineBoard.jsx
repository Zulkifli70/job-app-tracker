import { useEffect, useMemo, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stages } from "../data/seedJobs";
import { jobActions, selectors } from "../store/jobStore";
import { SectionCard } from "./SectionCard";

const getPageSize = (viewportWidth) => {
  if (viewportWidth <= 560) {
    return 6;
  }

  if (viewportWidth <= 760) {
    return 8;
  }

  if (viewportWidth <= 1180) {
    return 9;
  }

  return 12;
};

const getColumnCount = (viewportWidth) => {
  if (viewportWidth <= 560) {
    return 1;
  }

  if (viewportWidth <= 760) {
    return 2;
  }

  return 3;
};

const stageDisplayMap = {
  Wishlist: "Wishlist",
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
    const savedEvent = job.timeline.find(
      (item) => item.label === "Saved role to wishlist",
    );
    return savedEvent?.date ?? "";
  }

  if (stage === "Applied") {
    const appliedEvent = job.timeline.find(
      (item) =>
        item.label === "Added application" || item.label === "Moved to Applied",
    );
    return job.appliedOn || appliedEvent?.date || "";
  }

  return (
    job.timeline.find((item) => item.label === `Moved to ${stage}`)?.date ?? ""
  );
};

const createOfferForm = (job) => ({
  contractType: job?.offerDetails?.contractType ?? "",
  offeredSalary: job?.offerDetails?.offeredSalary ?? "",
  payPeriod: job?.offerDetails?.payPeriod ?? "monthly",
  benefits: job?.offerDetails?.benefits ?? "",
  workModel: job?.offerDetails?.workModel ?? "",
  startDate: job?.offerDetails?.startDate ?? "",
  responseDeadline: job?.offerDetails?.responseDeadline ?? "",
});

function PipelineCardSkeleton({ count }) {
  return Array.from({ length: count }, (_, index) => (
    <article
      key={`pipeline-skeleton-${index}`}
      className="pipeline-card pipeline-card--grid pipeline-card--skeleton"
      aria-hidden="true"
    >
      <div className="pipeline-skeleton pipeline-skeleton__row pipeline-skeleton__row--wide" />
      <div className="pipeline-skeleton pipeline-skeleton__row" />
      <div className="pipeline-skeleton pipeline-skeleton__row pipeline-skeleton__row--short" />
      <div className="pipeline-skeleton pipeline-skeleton__button" />
    </article>
  ));
}

function PipelineCard({ job, onOpen }) {
  return (
    <article className="pipeline-card pipeline-card--grid">
      <button
        type="button"
        className="pipeline-card__main"
        onClick={() => onOpen(job.id)}
      >
        <div className="pipeline-card__topline">
          <strong>{job.company}</strong>
          <span className={`status-pill ${getStageClassName(job.stage)}`}>
            {getStageLabel(job.stage)}
          </span>
        </div>
        <h3>{job.role}</h3>
        <div className="pipeline-card__meta">
          <span>{formatDate(job.appliedOn)}</span>
        </div>
      </button>
      <button
        type="button"
        className="primary-button pipeline-card__view"
        onClick={() => onOpen(job.id)}
      >
        Details
      </button>
    </article>
  );
}

function PipelineDetailPanel({ job, note, onNoteChange, onAddNote }) {
  const dispatch = useDispatch();
  const [offerForm, setOfferForm] = useState(() => createOfferForm(job));

  useEffect(() => {
    setOfferForm(createOfferForm(job));
  }, [job]);

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
  const handleOfferSubmit = (event) => {
    event.preventDefault();
    dispatch(jobActions.updateOfferDetails(job.id, offerForm));
  };

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
          <strong>
            {["Rejected", "Ghosted"].includes(job.stage) ? job.stage : "Active"}
          </strong>
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
        <h4>Offer Details</h4>
        {job.stage === "Offer" ? (
          <form className="note-form pipeline-offer-form" onSubmit={handleOfferSubmit}>
            <label>
              Contract Type
              <select
                value={offerForm.contractType}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    contractType: event.target.value,
                  }))
                }
              >
                <option value="">Select contract type</option>
                <option value="Permanent">Permanent</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
                <option value="Internship">Internship</option>
                <option value="Freelance">Freelance</option>
              </select>
            </label>

            <div className="pipeline-offer-form__row">
              <label>
                Offered Salary
                <input
                  value={offerForm.offeredSalary}
                  onChange={(event) =>
                    setOfferForm((current) => ({
                      ...current,
                      offeredSalary: event.target.value,
                    }))
                  }
                  placeholder="e.g. Rp 18.000.000"
                />
              </label>

              <label>
                Pay Period
                <select
                  value={offerForm.payPeriod}
                  onChange={(event) =>
                    setOfferForm((current) => ({
                      ...current,
                      payPeriod: event.target.value,
                    }))
                  }
                >
                  <option value="hourly">Hourly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                  <option value="project-based">Project-based</option>
                </select>
              </label>
            </div>

            <div className="pipeline-offer-form__row">
              <label>
                Work Model
                <select
                  value={offerForm.workModel}
                  onChange={(event) =>
                    setOfferForm((current) => ({
                      ...current,
                      workModel: event.target.value,
                    }))
                  }
                >
                  <option value="">Select work model</option>
                  <option value="On-site">On-site</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="Remote">Remote</option>
                </select>
              </label>

              <label>
                Start Date
                <input
                  type="date"
                  value={offerForm.startDate}
                  onChange={(event) =>
                    setOfferForm((current) => ({
                      ...current,
                      startDate: event.target.value,
                    }))
                  }
                />
              </label>
            </div>

            <label>
              Response Deadline
              <input
                type="date"
                value={offerForm.responseDeadline}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    responseDeadline: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Benefits
              <textarea
                rows="4"
                value={offerForm.benefits}
                onChange={(event) =>
                  setOfferForm((current) => ({
                    ...current,
                    benefits: event.target.value,
                  }))
                }
                placeholder="Health insurance, THR, bonus, laptop, stock option, leave, etc."
              />
            </label>

            <button className="primary-button" type="submit">
              Save Offer Details
            </button>
          </form>
        ) : (
          <p className="empty-state">
            Move this application to <strong>Offer</strong> to record contract type,
            salary, benefits, deadline, and onboarding details.
          </p>
        )}
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
            <p className="empty-state">
              No notes have been added to this application yet.
            </p>
          )}
        </div>
      </div>
    </aside>
  );
}

export function PipelineBoard() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectors.jobs);
  const selectedJob = useSelector(selectors.selectedJob);
  const loadMoreRef = useRef(null);
  const loadTimeoutRef = useRef(null);
  const [activeStage, setActiveStage] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [viewportWidth, setViewportWidth] = useState(() =>
    typeof window === "undefined" ? 1280 : window.innerWidth,
  );
  const [visibleCount, setVisibleCount] = useState(() =>
    getPageSize(typeof window === "undefined" ? 1280 : window.innerWidth),
  );
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [note, setNote] = useState("");

  const stageCounts = useMemo(
    () =>
      Object.fromEntries(
        stages.map((stage) => [
          stage,
          jobs.filter((job) => job.stage === stage).length,
        ]),
      ),
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
    const handleResize = () => {
      setViewportWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const pageSize = getPageSize(viewportWidth);
  const skeletonCount = getColumnCount(viewportWidth);

  useEffect(() => {
    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
      loadTimeoutRef.current = null;
    }

    setVisibleCount(pageSize);
    setIsLoadingMore(false);
  }, [activeStage, pageSize, searchTerm]);

  useEffect(() => {
    return () => {
      if (loadTimeoutRef.current) {
        window.clearTimeout(loadTimeoutRef.current);
      }
    };
  }, []);

  const effectiveVisibleCount = Math.min(visibleCount, filteredJobs.length);
  const visibleJobs = filteredJobs.slice(0, effectiveVisibleCount);
  const hasMore = effectiveVisibleCount < filteredJobs.length;

  const loadNextBatch = () => {
    if (!hasMore || isLoadingMore) {
      return;
    }

    setIsLoadingMore(true);

    if (loadTimeoutRef.current) {
      window.clearTimeout(loadTimeoutRef.current);
    }

    loadTimeoutRef.current = window.setTimeout(() => {
      setVisibleCount((current) =>
        Math.min(current + pageSize, filteredJobs.length),
      );
      setIsLoadingMore(false);
      loadTimeoutRef.current = null;
    }, 450);
  };

  useEffect(() => {
    if (!loadMoreRef.current || !hasMore) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          loadNextBatch();
        }
      },
      {
        rootMargin: "0px 0px 280px 0px",
      },
    );

    observer.observe(loadMoreRef.current);

    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, pageSize, filteredJobs.length]);

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

      <div
        className="pipeline-tabs"
        role="tablist"
        aria-label="Application stages"
      >
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
          <div className="pipeline-list-status">
            <span>
              Showing {visibleJobs.length} of {filteredJobs.length}
            </span>
            {isLoadingMore ? <strong>Loading more...</strong> : null}
          </div>

          {visibleJobs.length ? (
            <div className="pipeline-grid">
              {visibleJobs.map((job) => (
                <PipelineCard
                  key={job.id}
                  job={job}
                  onOpen={handleOpenDetails}
                />
              ))}
              {isLoadingMore ? (
                <PipelineCardSkeleton count={skeletonCount} />
              ) : null}
            </div>
          ) : (
            <div className="pipeline-empty">
              <p className="empty-state">
                No applications match this stage and search combination.
              </p>
            </div>
          )}

          {hasMore ? <div ref={loadMoreRef} className="pipeline-scroll-sentinel" aria-hidden="true" /> : null}
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
