import React from 'react';
import { IssueStatus, IssuePriority } from '../types';

interface BadgeProps {
    className: string;
    children: React.ReactNode;
}

const BaseBadge: React.FC<BadgeProps> = ({ className, children }) => (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wide ${className}`}>
        {children}
    </span>
);

export const statusMap = {
    [IssueStatus.Open]: { text: 'Terbuka', color: 'bg-blue-100 text-blue-800' },
    [IssueStatus.InProgress]: { text: 'Dalam Proses', color: 'bg-yellow-100 text-yellow-800' },
    [IssueStatus.Resolved]: { text: 'Selesai', color: 'bg-green-100 text-green-800' },
};

export const priorityMap = {
    [IssuePriority.Low]: { text: 'Rendah', color: 'bg-slate-100 text-slate-800' },
    [IssuePriority.Medium]: { text: 'Sedang', color: 'bg-orange-100 text-orange-800' },
    [IssuePriority.High]: { text: 'Tinggi', color: 'bg-red-100 text-red-800' },
};

export const StatusBadge: React.FC<{ status: IssueStatus }> = ({ status }) => {
    const { text, color } = statusMap[status] || { text: 'Unknown', color: 'bg-slate-100 text-slate-800' };

    return <BaseBadge className={color}>{text}</BaseBadge>;
};

export const PriorityBadge: React.FC<{ priority: IssuePriority }> = ({ priority }) => {
    const { text, color } = priorityMap[priority] || { text: 'Unknown', color: 'bg-slate-100 text-slate-800' };

    return <BaseBadge className={color}>{text}</BaseBadge>;
};
