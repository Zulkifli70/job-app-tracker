import { seedJobs, stages } from "../data/seedJobs";

const STORAGE_KEY = "job-tracker-state-v3";

const actionTypes = {
  selectJob: "jobs/selectJob",
  moveJobStage: "jobs/moveJobStage",
  updateJobStage: "jobs/updateJobStage",
  updateJobMeta: "jobs/updateJobMeta",
  addNote: "jobs/addNote",
  addJob: "jobs/addJob",
  deleteJob: "jobs/deleteJob",
};

const buildInitialState = () => ({
  jobs: seedJobs,
  selectedJobId: seedJobs[0]?.id ?? null,
});

const readStoredState = () => {
  if (typeof window === "undefined") {
    return buildInitialState();
  }

  try {
    const rawState = window.localStorage.getItem(STORAGE_KEY);

    if (!rawState) {
      return buildInitialState();
    }

    const parsedState = JSON.parse(rawState);
    return {
      ...buildInitialState(),
      ...parsedState,
    };
  } catch {
    return buildInitialState();
  }
};

const persistState = (state) => {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
};

const createId = (prefix) =>
  `${prefix}-${Math.random().toString(36).slice(2, 8)}-${Date.now().toString(36)}`;

const addTimelineEvent = (job, label, date) => ({
  ...job,
  timeline: [
    {
      id: createId("event"),
      date,
      label,
    },
    ...job.timeline,
  ],
});

const reducer = (state, action) => {
  switch (action.type) {
    case actionTypes.selectJob:
      return {
        ...state,
        selectedJobId: action.payload,
      };

    case actionTypes.moveJobStage: {
      const { jobId, direction } = action.payload;

      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== jobId) {
            return job;
          }

          const currentIndex = stages.indexOf(job.stage);
          const nextIndex = Math.min(
            Math.max(currentIndex + direction, 0),
            stages.length - 1,
          );
          const nextStage = stages[nextIndex];

          if (nextStage === job.stage) {
            return job;
          }

          return addTimelineEvent(
            {
              ...job,
              stage: nextStage,
            },
            `Moved to ${nextStage}`,
            new Date().toISOString().slice(0, 10),
          );
        }),
      };
    }

    case actionTypes.updateJobStage: {
      const { jobId, stage } = action.payload;

      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== jobId || job.stage === stage) {
            return job;
          }

          return addTimelineEvent(
            {
              ...job,
              stage,
            },
            `Stage updated to ${stage}`,
            new Date().toISOString().slice(0, 10),
          );
        }),
      };
    }

    case actionTypes.updateJobMeta: {
      const { jobId, recruiter, contactEmail } = action.payload;

      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== jobId) {
            return job;
          }

          return {
            ...job,
            recruiter: recruiter.trim() || "Pending",
            contactEmail: contactEmail.trim(),
          };
        }),
      };
    }

    case actionTypes.addNote: {
      const { jobId, content } = action.payload;

      return {
        ...state,
        jobs: state.jobs.map((job) => {
          if (job.id !== jobId) {
            return job;
          }

          return {
            ...job,
            notes: [
              {
                id: createId("note"),
                createdAt: new Date().toISOString(),
                content,
              },
              ...job.notes,
            ],
            timeline: [
              {
                id: createId("event"),
                date: new Date().toISOString().slice(0, 10),
                label: "Added a note",
              },
              ...job.timeline,
            ],
          };
        }),
      };
    }

    case actionTypes.addJob: {
      const {
        company,
        role,
        location,
        salary,
        stage,
        summary,
        recruiter,
        contactEmail,
      } = action.payload;
      const id = createId("job");
      const today = new Date().toISOString().slice(0, 10);
      const newJob = {
        id,
        company,
        role,
        location,
        salary,
        stage,
        appliedOn: stage === "Saved" ? "" : today,
        nextInterview: "",
        recruiter: recruiter.trim() || "Pending",
        contactEmail: contactEmail.trim(),
        jobUrl: "",
        summary,
        notes: [],
        documents: [],
        timeline: [
          {
            id: createId("event"),
            date: today,
            label:
              stage === "Saved"
                ? "Saved role to pipeline"
                : "Added application",
          },
        ],
      };

      return {
        ...state,
        jobs: [newJob, ...state.jobs],
        selectedJobId: id,
      };
    }

    case actionTypes.deleteJob: {
      const nextJobs = state.jobs.filter((job) => job.id !== action.payload);

      return {
        ...state,
        jobs: nextJobs,
        selectedJobId:
          state.selectedJobId === action.payload
            ? (nextJobs[0]?.id ?? null)
            : state.selectedJobId,
      };
    }

    default:
      return state;
  }
};

const createStore = (rootReducer, preloadedState) => {
  let currentState = preloadedState;
  const listeners = new Set();

  return {
    getState: () => currentState,
    dispatch: (action) => {
      currentState = rootReducer(currentState, action);
      listeners.forEach((listener) => listener());
      return action;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export const jobActions = {
  selectJob: (jobId) => ({ type: actionTypes.selectJob, payload: jobId }),
  moveJobStage: (jobId, direction) => ({
    type: actionTypes.moveJobStage,
    payload: { jobId, direction },
  }),
  updateJobStage: (jobId, stage) => ({
    type: actionTypes.updateJobStage,
    payload: { jobId, stage },
  }),
  updateJobMeta: (jobId, payload) => ({
    type: actionTypes.updateJobMeta,
    payload: { jobId, ...payload },
  }),
  addNote: (jobId, content) => ({
    type: actionTypes.addNote,
    payload: { jobId, content },
  }),
  addJob: (payload) => ({
    type: actionTypes.addJob,
    payload,
  }),
  deleteJob: (jobId) => ({
    type: actionTypes.deleteJob,
    payload: jobId,
  }),
};

export const selectors = {
  jobs: (state) => state.jobs,
  selectedJobId: (state) => state.selectedJobId,
  selectedJob: (state) =>
    state.jobs.find((job) => job.id === state.selectedJobId) ??
    state.jobs[0] ??
    null,
};

export const store = createStore(reducer, readStoredState());

store.subscribe(() => {
  persistState(store.getState());
});
