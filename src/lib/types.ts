export type KnowledgeStatus =
  | "active"
  | "review"
  | "draft"
  | "needs_revision"
  | "expired"
  | "archived";

export type Role = "staff" | "owner" | "reviewer" | "admin";

export type KnowledgeItem = {
  id: string;
  title: string;
  content: string;
  summary: string;
  category: string;
  source: string;
  owner: string;
  touchpoints: string[];
  status: KnowledgeStatus;
  effectiveDate: string;
  expiryDate?: string;
  activeVersionId?: string;
};

export type KnowledgeVersion = {
  id: string;
  knowledgeId: string;
  version: string;
  changeSummary: string;
  content: string;
  creator: string;
  reviewer?: string;
  approvalTime?: string;
  status: KnowledgeStatus;
  sourceVerified: boolean;
};

export type Promotion = {
  id: string;
  name: string;
  status: "active" | "ending_soon" | "archived";
  minimumTransaction?: number;
  paymentMethods: string[];
  periodStart: string;
  periodEnd: string;
  quotaNotes?: string;
  exceptions?: string[];
};

export type IssueReport = {
  id: string;
  knowledgeId: string;
  issueType: string;
  touchpoint: string;
  detail: string;
  status: "waiting_triage" | "in_review" | "resolved";
  createdAt: string;
};

export type ReviewSubmission = {
  id: string;
  knowledgeId: string;
  versionId: string;
  submittedBy: string;
  submittedAt: string;
  status: "review" | "needs_revision";
};

export type KnowledgeDraftInput = Omit<
  KnowledgeItem,
  "id" | "status" | "activeVersionId" | "owner"
> & {
  id?: string;
  changeSummary?: string;
};

export type KmsData = {
  knowledge: KnowledgeItem[];
  versions: KnowledgeVersion[];
  promotions: Promotion[];
  reports: IssueReport[];
  reviews: ReviewSubmission[];
  role: Role;
};
