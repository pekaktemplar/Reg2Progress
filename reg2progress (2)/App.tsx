import React, { useState, useMemo } from 'react';
import { Sidebar } from './components/Sidebar';
import { IssueTracker } from './components/IssueTracker';
import { Dashboard } from './components/Dashboard';
import { type Branch, type Issue, type UpdateLog, type Meeting, type View } from './types';
import { INITIAL_BRANCHES, INITIAL_ISSUES, INITIAL_MEETINGS } from './constants';

const App: React.FC = () => {
    const [branches] = useState<Branch[]>(INITIAL_BRANCHES);
    const [issues, setIssues] = useState<Issue[]>(INITIAL_ISSUES);
    const [meetings, setMeetings] = useState<Meeting[]>(INITIAL_MEETINGS);
    const [selectedBranchId, setSelectedBranchId] = useState<string | null>(null);
    const [currentView, setCurrentView] = useState<View>('dashboard');

    const selectedBranch = useMemo(() => {
        return branches.find(b => b.id === selectedBranchId) || null;
    }, [branches, selectedBranchId]);
    
    const sortedMeetings = useMemo(() => {
        return [...meetings].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [meetings]);

    const handleAddIssue = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updates'>) => {
        const newIssue: Issue = {
            ...newIssueData,
            id: `ISSUE-${Date.now()}`,
            createdAt: new Date().toISOString(),
            updates: [
                {
                    id: `LOG-${Date.now()}`,
                    text: 'Isu dibuat.',
                    author: 'Sistem',
                    timestamp: new Date().toISOString()
                }
            ]
        };
        setIssues(prevIssues => [newIssue, ...prevIssues]);
    };
    
    const handleAddMeeting = (newMeetingData: Omit<Meeting, 'id'>) => {
        const newMeeting: Meeting = {
            ...newMeetingData,
            id: `MEETING-${Date.now()}`
        };
        setMeetings(prevMeetings => [newMeeting, ...prevMeetings]);
    };

    const handleUpdateMeeting = (meetingId: string, updates: Partial<Pick<Meeting, 'notes' | 'attendees'>>) => {
        setMeetings(prevMeetings =>
            prevMeetings.map(meeting =>
                meeting.id === meetingId ? { ...meeting, ...updates } : meeting
            )
        );
    };

    const handleUpdateIssue = (issueId: string, updates: Partial<Issue>) => {
        setIssues(prevIssues =>
            prevIssues.map(issue =>
                issue.id === issueId ? { ...issue, ...updates } : issue
            )
        );
    };

    const handleAddUpdateLog = (issueId: string, logText: string) => {
        const newLog: UpdateLog = {
            id: `LOG-${Date.now()}`,
            text: logText,
            author: 'Pengguna Rapat', // In a real app, this would be the logged-in user
            timestamp: new Date().toISOString()
        };

        setIssues(prevIssues =>
            prevIssues.map(issue =>
                issue.id === issueId
                    ? { ...issue, updates: [...issue.updates, newLog] }
                    : issue
            )
        );
    };

    const handleUpdateLogEntry = (issueId: string, logId: string, newText: string) => {
        setIssues(prevIssues =>
            prevIssues.map(issue => {
                if (issue.id !== issueId) return issue;
                const updatedLogs = issue.updates.map(log =>
                    log.id === logId ? { ...log, text: newText } : log
                );
                return { ...issue, updates: updatedLogs };
            })
        );
    };

    const handleDeleteLogEntry = (issueId: string, logId: string) => {
        setIssues(prevIssues =>
            prevIssues.map(issue => {
                if (issue.id !== issueId) return issue;
                const updatedLogs = issue.updates.filter(log => log.id !== logId);
                return { ...issue, updates: updatedLogs };
            })
        );
    };

    const handleSelectBranch = (branchId: string | null) => {
        setSelectedBranchId(branchId);
        // Automatically switch to issue view when a branch is selected
        if (branchId) {
            setCurrentView('issues');
        }
    };


    return (
        <div className="flex h-screen font-sans text-slate-800">
            <Sidebar
                branches={branches}
                selectedBranchId={selectedBranchId}
                onSelectBranch={handleSelectBranch}
                currentView={currentView}
                onSelectView={setCurrentView}
            />
            <main className="flex-1 p-6 sm:p-8 lg:p-10 bg-slate-100 overflow-y-auto">
                 {currentView === 'dashboard' ? (
                    <Dashboard issues={issues} branches={branches} />
                 ) : (
                    <IssueTracker
                        selectedBranch={selectedBranch}
                        allIssues={issues}
                        meetings={sortedMeetings}
                        branches={branches}
                        onAddIssue={handleAddIssue}
                        onAddMeeting={handleAddMeeting}
                        onUpdateMeeting={handleUpdateMeeting}
                        onUpdateIssue={handleUpdateIssue}
                        onAddUpdateLog={handleAddUpdateLog}
                        onUpdateLogEntry={handleUpdateLogEntry}
                        onDeleteLogEntry={handleDeleteLogEntry}
                    />
                 )}
            </main>
        </div>
    );
};

export default App;