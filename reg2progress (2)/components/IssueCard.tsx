

import React from 'react';
import { type Issue, IssueStatus } from '../types';
import { PriorityBadge, StatusBadge } from './Badge';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { CalendarIcon } from './icons/CalendarIcon';

interface IssueCardProps {
    issue: Issue;
    onSelect: () => void;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue, onSelect }) => {
    const formatDate = (dateString: string) => {
        // Adding T00:00:00 ensures the date is parsed in the local timezone, not UTC
        const date = new Date(`${dateString}T00:00:00`);
        return date.toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric',
        });
    };
    
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Set to start of today for accurate comparison

    const isOverdue = issue.dueDate && new Date(`${issue.dueDate}T00:00:00`) < today && issue.status !== IssueStatus.Resolved;


    return (
        <div 
            onClick={onSelect} 
            className="bg-white p-5 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
        >
            <div>
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-slate-800 pr-2">{issue.title}</h3>
                    <PriorityBadge priority={issue.priority} />
                </div>
                <p className="text-sm text-slate-600 line-clamp-3 mb-4">{issue.description}</p>
            </div>
            <div className="border-t border-slate-100 pt-3 flex justify-between items-center text-xs text-slate-500">
                <StatusBadge status={issue.status} />
                 <div className="flex items-center space-x-3">
                    {issue.dueDate && (
                        <div className={`flex items-center ${isOverdue ? 'text-red-600 font-semibold' : ''}`}>
                            <CalendarIcon className="h-4 w-4 mr-1"/>
                            <span>{formatDate(issue.dueDate)}</span>
                        </div>
                    )}
                    <div className="flex items-center">
                        <ChatBubbleIcon className="h-4 w-4 mr-1"/>
                        <span>{issue.updates.length}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};