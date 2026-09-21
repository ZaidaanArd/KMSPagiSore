"use client";

import {
  createContext,
  use,
  useEffect,
  useReducer,
  useState,
  type ReactNode,
} from "react";
import { cloneSeedData } from "@/lib/mock-data";
import type {
  IssueReport,
  KmsData,
  KnowledgeDraftInput,
  KnowledgeItem,
  KnowledgeVersion,
  Role,
} from "@/lib/types";
import { makeId } from "@/lib/utils";

const STORAGE_KEY = "pagi-sore-kms-v1";

type StoreContext = {
  data: KmsData;
  loading: boolean;
  error: string | null;
  setRole: (role: Role) => void;
  saveDraft: (input: KnowledgeDraftInput) => KnowledgeItem;
  submitForReview: (input: KnowledgeDraftInput) => KnowledgeItem;
  approveReview: (reviewId: string) => string | null;
  requestRevision: (reviewId: string) => void;
  submitReport: (input: Omit<IssueReport, "id" | "status" | "createdAt">) => IssueReport;
  resetData: () => void;
  retryLoad: () => void;
};

type Action =
  | { type: "replace"; data: KmsData }
  | { type: "role"; role: Role }
  | { type: "upsert-knowledge"; item: KnowledgeItem; version: KnowledgeVersion; submit: boolean }
  | { type: "approve"; reviewId: string }
  | { type: "revision"; reviewId: string }
  | { type: "report"; report: IssueReport };

function reducer(state: KmsData, action: Action): KmsData {
  if (action.type === "replace") return action.data;
  if (action.type === "role") return { ...state, role: action.role };
  if (action.type === "report") {
    return { ...state, reports: [action.report, ...state.reports] };
  }
  if (action.type === "upsert-knowledge") {
    const exists = state.knowledge.some((item) => item.id === action.item.id);
    const knowledge = exists
      ? state.knowledge.map((item) => (item.id === action.item.id ? action.item : item))
      : [action.item, ...state.knowledge];
    return {
      ...state,
      knowledge,
      versions: [action.version, ...state.versions],
      reviews: action.submit
        ? [
            {
              id: makeId("review"),
              knowledgeId: action.item.id,
              versionId: action.version.id,
              submittedBy: action.item.owner,
              submittedAt: new Date().toISOString(),
              status: "review",
            },
            ...state.reviews,
          ]
        : state.reviews,
    };
  }
  if (action.type === "revision") {
    const review = state.reviews.find((entry) => entry.id === action.reviewId);
    if (!review) return state;
    return {
      ...state,
      reviews: state.reviews.map((entry) =>
        entry.id === action.reviewId ? { ...entry, status: "needs_revision" } : entry,
      ),
      knowledge: state.knowledge.map((item) =>
        item.id === review.knowledgeId ? { ...item, status: "needs_revision" } : item,
      ),
      versions: state.versions.map((version) =>
        version.id === review.versionId ? { ...version, status: "needs_revision" } : version,
      ),
    };
  }
  if (action.type === "approve") {
    const review = state.reviews.find((entry) => entry.id === action.reviewId);
    if (!review) return state;
    const approvedVersion = state.versions.find((version) => version.id === review.versionId);
    return {
      ...state,
      reviews: state.reviews.filter((entry) => entry.id !== action.reviewId),
      knowledge: state.knowledge.map((item) =>
        item.id === review.knowledgeId
          ? {
              ...item,
              content: approvedVersion?.content ?? item.content,
              status: "active",
              activeVersionId: review.versionId,
            }
          : item,
      ),
      versions: state.versions.map((version) => {
        if (version.id === review.versionId) {
          return {
            ...version,
            status: "active",
            reviewer: "Reviewer KMS",
            approvalTime: new Date().toISOString(),
            sourceVerified: true,
          };
        }
        if (version.knowledgeId === review.knowledgeId && version.status === "active") {
          return { ...version, status: "archived" };
        }
        return version;
      }),
    };
  }
  return state;
}

const KmsContext = createContext<StoreContext | null>(null);

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export function KmsProvider({ children }: { children: ReactNode }) {
  const [data, dispatch] = useReducer(reducer, cloneSeedData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hydrated, setHydrated] = useState(false);

  function load() {
    setLoading(true);
    setError(null);
    window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        dispatch({ type: "replace", data: stored ? (JSON.parse(stored) as KmsData) : cloneSeedData() });
      } catch {
        setError("Data tersimpan tidak dapat dibaca. Reset untuk memuat ulang data awal.");
      } finally {
        setHydrated(true);
        setLoading(false);
      }
    }, 520);
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      try {
        const stored = window.localStorage.getItem(STORAGE_KEY);
        dispatch({ type: "replace", data: stored ? (JSON.parse(stored) as KmsData) : cloneSeedData() });
      } catch {
        setError("Data tersimpan tidak dapat dibaca. Reset untuk memuat ulang data awal.");
      } finally {
        setHydrated(true);
        setLoading(false);
      }
    }, 520);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (hydrated && !error) window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data, error, hydrated]);

  function upsert(input: KnowledgeDraftInput, submit: boolean) {
    const id = input.id || `${slugify(input.title)}-${Date.now().toString(36).slice(-4)}`;
    const existingVersions = data.versions.filter((version) => version.knowledgeId === id);
    const versionNumber = `v1.${existingVersions.length + 1}`;
    const versionId = makeId("version");
    const item: KnowledgeItem = {
      ...input,
      id,
      owner: "Pemilik konten",
      status: submit ? "review" : "draft",
      activeVersionId: data.knowledge.find((entry) => entry.id === id)?.activeVersionId,
    };
    const version: KnowledgeVersion = {
      id: versionId,
      knowledgeId: id,
      version: versionNumber,
      changeSummary: input.changeSummary || "Pengetahuan baru diajukan.",
      content: input.content,
      creator: "Pemilik konten",
      status: submit ? "review" : "draft",
      sourceVerified: false,
    };
    dispatch({ type: "upsert-knowledge", item, version, submit });
    return item;
  }

  function approveReview(reviewId: string) {
    const review = data.reviews.find((entry) => entry.id === reviewId);
    dispatch({ type: "approve", reviewId });
    return review?.knowledgeId ?? null;
  }

  function submitReport(input: Omit<IssueReport, "id" | "status" | "createdAt">) {
    const report: IssueReport = {
      ...input,
      id: makeId("report"),
      status: "waiting_triage",
      createdAt: new Date().toISOString(),
    };
    dispatch({ type: "report", report });
    return report;
  }

  function resetData() {
    const fresh = cloneSeedData();
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    dispatch({ type: "replace", data: fresh });
    setError(null);
    setLoading(false);
    setHydrated(true);
  }

  return (
    <KmsContext
      value={{
        data,
        loading,
        error,
        setRole: (role) => dispatch({ type: "role", role }),
        saveDraft: (input) => upsert(input, false),
        submitForReview: (input) => upsert(input, true),
        approveReview,
        requestRevision: (reviewId) => dispatch({ type: "revision", reviewId }),
        submitReport,
        resetData,
        retryLoad: error ? resetData : load,
      }}
    >
      {children}
    </KmsContext>
  );
}

export function useKms() {
  const context = use(KmsContext);
  if (!context) throw new Error("useKms must be used inside KmsProvider");
  return context;
}
