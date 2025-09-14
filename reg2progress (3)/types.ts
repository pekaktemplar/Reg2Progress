

export enum IssueStatus {
    Open = 'OPEN',
    InProgress = 'IN_PROGRESS',
    Resolved = 'RESOLVED',
}

export enum IssuePriority {
    Low = 'LOW',
    Medium = 'MEDIUM',
    High = 'HIGH',
}

export interface UpdateLog {
    id: string;
    text: string;
    author: string;
    timestamp: string;
}

export interface Issue {
    id: string;
    title: string;
    description: string;
    status: IssueStatus;
    priority: IssuePriority;
    branchId: string;
    createdAt: string;
    updates: UpdateLog[];
    dueDate: string | null;
}

export interface Branch {
    id:string;
    name: string;
    location: string;
}

export interface Meeting {
    id: string;
    date: string;
    attendees: string;
    notes: Record<string, string>;
    discussedIssueIds: string[];
}

export type View = 'dashboard' | 'issues';