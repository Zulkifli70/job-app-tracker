import { useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { stages } from "../data/seedJobs";
import { jobActions, selectors } from "../store/jobStore";
import { MetricCard } from "./MetricCard";
import { SectionCard } from "./SectionCard";

const formatInterviewDate = (value) =>
  new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));

export function DashboardOverview() {
  const dispatch = useDispatch();
  const jobs = useSelector(selectors.jobs);
  const [formData, setFormData] = useState({
    company: "",
    role: "",
    location: "",
    salary: "",
    recruiter: "",
    contactEmail: "",
    stage: "Saved",
    summary: "",
  });

  const metrics = useMemo(() => {
    const interviewCount = jobs.filter(
      (job) => job.stage === "Interview",
    ).length;
    const offerCount = jobs.filter((job) => job.stage === "Offer").length;
    const activeCount = jobs.filter((job) => job.stage !== "Rejected").length;

    return [
      {
        label: "Total applications",
        value: jobs.length,
        detail: `${activeCount} currently active in your search`,
        tone: "default",
      },
      {
        label: "Scheduled interviews",
        value: interviewCount,
        detail: "Applications currently in interview stages",
        tone: "highlight",
      },
      {
        label: "Offers received",
        value: offerCount,
        detail: "Opportunities awaiting evaluation or response",
        tone: "success",
      },
    ];
  }, [jobs]);

  const upcomingInterviews = [...jobs]
    .filter((job) => job.nextInterview)
    .sort((a, b) => new Date(a.nextInterview) - new Date(b.nextInterview))
    .slice(0, 3);

  const recentActivity = [...jobs]
    .flatMap((job) =>
      job.timeline.map((event) => ({
        ...event,
        company: job.company,
        role: job.role,
      })),
    )
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5);

  const handleSubmit = (event) => {
    event.preventDefault();

    if (!formData.company.trim() || !formData.role.trim()) {
      return;
    }

    dispatch(
      jobActions.addJob({
        ...formData,
        company: formData.company.trim(),
        role: formData.role.trim(),
        location: formData.location.trim() || "Not specified",
        salary: formData.salary.trim() || "Not specified",
        summary:
          formData.summary.trim() ||
          "A new opportunity has been added to your application pipeline.",
      }),
    );

    setFormData({
      company: "",
      role: "",
      location: "",
      salary: "",
      recruiter: "",
      contactEmail: "",
      stage: "Saved",
      summary: "",
    });
  };

  return (
    <div className="dashboard-grid">
      <SectionCard
        title="Overview"
        eyebrow="Dashboard"
        className="dashboard-grid__overview"
      >
        <div className="metrics-grid">
          {metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </SectionCard>

      <SectionCard
        title="Upcoming Interviews"
        eyebrow="Schedule"
        className="dashboard-grid__interviews"
      >
        <div className="stack-list">
          {upcomingInterviews.length ? (
            upcomingInterviews.map((job) => (
              <button
                key={job.id}
                type="button"
                className="list-item list-item--button"
                onClick={() => dispatch(jobActions.selectJob(job.id))}
              >
                <div>
                  <strong>{job.company}</strong>
                  <p>{job.role}</p>
                </div>
                <span>{formatInterviewDate(job.nextInterview)}</span>
              </button>
            ))
          ) : (
            <p className="empty-state">
              No interviews have been scheduled yet.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Recent Activity"
        eyebrow="Recent Updates"
        className="dashboard-grid__activity"
      >
        <div className="stack-list">
          {recentActivity.length ? (
            recentActivity.map((item) => (
              <div key={item.id} className="list-item">
                <div>
                  <strong>{item.label}</strong>
                  <p>
                    {item.company} - {item.role}
                  </p>
                </div>
                <span>{item.date}</span>
              </div>
            ))
          ) : (
            <p className="empty-state">
              No activity has been recorded yet. Add your first application to
              begin tracking your progress.
            </p>
          )}
        </div>
      </SectionCard>

      <SectionCard
        title="Add New Application"
        eyebrow="New Entry"
        className="dashboard-grid__form"
      >
        <form className="quick-form" onSubmit={handleSubmit}>
          <label>
            Company
            <input
              value={formData.company}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  company: event.target.value,
                }))
              }
              placeholder="e.g. Google"
            />
          </label>
          <label>
            Role
            <input
              value={formData.role}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  role: event.target.value,
                }))
              }
              placeholder="e.g. Product Manager"
            />
          </label>
          <label>
            Location
            <input
              value={formData.location}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  location: event.target.value,
                }))
              }
              placeholder="e.g. Jakarta, Indonesia / Remote"
            />
          </label>
          <label>
            Salary
            <input
              value={formData.salary}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  salary: event.target.value,
                }))
              }
              placeholder="e.g. IDR 8,000,000 - 12,000,000"
            />
          </label>
          <label>
            Recruiter
            <input
              value={formData.recruiter}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  recruiter: event.target.value,
                }))
              }
              placeholder="e.g. Sarah Chen"
            />
          </label>
          <label>
            Contact Email
            <input
              type="email"
              value={formData.contactEmail}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  contactEmail: event.target.value,
                }))
              }
              placeholder="e.g. recruiter@company.com"
            />
          </label>
          <label>
            Stage
            <select
              value={formData.stage}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  stage: event.target.value,
                }))
              }
            >
              {stages.map((stage) => (
                <option key={stage} value={stage}>
                  {stage}
                </option>
              ))}
            </select>
          </label>
          <label className="quick-form__full">
            Notes
            <textarea
              rows="3"
              value={formData.summary}
              onChange={(event) =>
                setFormData((current) => ({
                  ...current,
                  summary: event.target.value,
                }))
              }
              placeholder="Add context, role highlights, or follow-up notes."
            />
          </label>
          <button className="primary-button quick-form__submit" type="submit">
            Save Application
          </button>
        </form>
      </SectionCard>
    </div>
  );
}
