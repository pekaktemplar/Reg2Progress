import React, { useState, useMemo } from 'react';
import { type Branch, type Issue, type Meeting, IssueStatus } from '../types';
import { IssueCard } from './IssueCard';
import { IssueModal } from './IssueModal';
import { AddIssueForm } from './AddIssueForm';
import { PlusIcon } from './icons/PlusIcon';
import { UsersIcon } from './icons/UsersIcon';
import { RichTextEditor } from './RichTextEditor';
import { AttendeesInput } from './AttendeesInput';
import { PencilIcon } from './icons/PencilIcon';
import { ExportIcon } from './icons/ExportIcon';
import { XIcon } from './icons/XIcon';
import { SearchIcon } from './icons/SearchIcon';

interface IssueTrackerProps {
    selectedBranch: Branch | null;
    allIssues: Issue[];
    meetings: Meeting[];
    branches: Branch[];
    onAddIssue: (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updates'>) => void;
    onAddMeeting: (newMeetingData: Omit<Meeting, 'id'>) => void;
    onUpdateMeeting: (meetingId: string, updates: Partial<Pick<Meeting, 'notes' | 'attendees'>>) => void;
    onUpdateIssue: (issueId: string, updates: Partial<Issue>) => void;
    onAddUpdateLog: (issueId: string, logText: string) => void;
    onUpdateLogEntry: (issueId: string, logId: string, newText: string) => void;
    onDeleteLogEntry: (issueId: string, logId: string) => void;
}

const formatDate = (dateString: string, options: Intl.DateTimeFormatOptions = {
    day: 'numeric', month: 'long', year: 'numeric'
}) => {
    return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Helper function to convert HTML to plain text
const stripHtml = (html: string) => {
    const doc = new DOMParser().parseFromString(html, 'text/html');
    return doc.body.textContent || "";
}

// Helper to filter out empty notes before saving
const cleanMeetingNotes = (notes: Record<string, string>): Record<string, string> => {
    const cleanedNotes: Record<string, string> = {};
    for (const branchId in notes) {
        const noteText = stripHtml(notes[branchId]);
        if (noteText.trim()) { // Only save if there's actual text content
            cleanedNotes[branchId] = notes[branchId];
        }
    }
    return cleanedNotes;
};

export const IssueTracker: React.FC<IssueTrackerProps> = ({ selectedBranch, allIssues, meetings, branches, onAddIssue, onAddMeeting, onUpdateMeeting, onUpdateIssue, onAddUpdateLog, onUpdateLogEntry, onDeleteLogEntry }) => {
    const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
    const [isAddIssueModalOpen, setAddIssueModalOpen] = useState(false);
    const [branchIdForNewIssue, setBranchIdForNewIssue] = useState<string | null>(null);
    const [activeMeeting, setActiveMeeting] = useState<Omit<Meeting, 'id' | 'notes' | 'attendees'> | null>(null);
    const [editingMeeting, setEditingMeeting] = useState<Meeting | null>(null);
    const [meetingNotes, setMeetingNotes] = useState<Record<string, string>>({});
    const [meetingAttendees, setMeetingAttendees] = useState('');

    // State for export modal
    const [isExportModalOpen, setExportModalOpen] = useState(false);
    const [exportStartDate, setExportStartDate] = useState('');
    const [exportEndDate, setExportEndDate] = useState('');
    
    // State for search
    const [searchQuery, setSearchQuery] = useState('');

    const handleOpenAddIssueModal = (branchId: string) => {
        setBranchIdForNewIssue(branchId);
        setAddIssueModalOpen(true);
    };

    const handleCloseAddIssueModal = () => {
        setAddIssueModalOpen(false);
        setBranchIdForNewIssue(null);
    };

    const handleAddIssueSubmit = (newIssueData: Omit<Issue, 'id' | 'createdAt' | 'updates' | 'branchId'>) => {
        if (!branchIdForNewIssue) {
            alert("Terjadi kesalahan: Cabang untuk isu baru tidak dapat ditemukan.");
            return;
        }
        onAddIssue({ ...newIssueData, branchId: branchIdForNewIssue });
        handleCloseAddIssueModal();
    };

    const handleStartMeeting = () => {
        const allUnresolvedIssues = allIssues.filter(i => i.status !== IssueStatus.Resolved);
        const initialNotes: Record<string, string> = {};
        
        branches.forEach(branch => {
            initialNotes[branch.id] = '<ul><li>&nbsp;</li></ul>';
        });

        setActiveMeeting({
            date: new Date().toISOString(),
            discussedIssueIds: allUnresolvedIssues.map(i => i.id)
        });
        setMeetingNotes(initialNotes);
        setMeetingAttendees('');
    };

    const handleFinishMeeting = () => {
        if (!activeMeeting) return;
        const cleanedNotes = cleanMeetingNotes(meetingNotes);
        onAddMeeting({
            ...activeMeeting,
            notes: cleanedNotes,
            attendees: meetingAttendees,
        });
        setActiveMeeting(null);
        setMeetingNotes({});
        setMeetingAttendees('');
    };
    
    const handleEditMeeting = (meeting: Meeting) => {
        setEditingMeeting(meeting);
        setMeetingNotes(meeting.notes || {});
        setMeetingAttendees(meeting.attendees);
    };

    const handleSaveMeetingChanges = () => {
        if (!editingMeeting) return;
        const cleanedNotes = cleanMeetingNotes(meetingNotes);
        onUpdateMeeting(editingMeeting.id, {
            notes: cleanedNotes,
            attendees: meetingAttendees,
        });
        setEditingMeeting(null);
        setMeetingNotes({});
        setMeetingAttendees('');
    };

    const handleCancelEditOrMeeting = () => {
        setActiveMeeting(null);
        setEditingMeeting(null);
        setMeetingNotes({});
        setMeetingAttendees('');
    };
    
    const handleNoteChange = (branchId: string, value: string) => {
        setMeetingNotes(prev => ({
            ...prev,
            [branchId]: value
        }));
    };

    const handleExport = () => {
        if (!exportStartDate || !exportEndDate) {
            alert("Silakan pilih tanggal mulai dan tanggal selesai.");
            return;
        }

        const startDate = new Date(exportStartDate);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(exportEndDate);
        endDate.setHours(23, 59, 59, 999);

        const filteredMeetings = meetings.filter(m => {
            const meetingDate = new Date(m.date);
            return meetingDate >= startDate && meetingDate <= endDate;
        });

        if (filteredMeetings.length === 0) {
            alert("Tidak ada rapat yang ditemukan dalam rentang tanggal yang dipilih.");
            return;
        }
        
        const discussedIssueIds = new Set(filteredMeetings.flatMap(m => m.discussedIssueIds));
        const relevantIssues = allIssues.filter(issue => discussedIssueIds.has(issue.id));

        generateExcel(filteredMeetings, relevantIssues);
        setExportModalOpen(false);
    };
    
    const generateExcel = (meetingsToExport: Meeting[], issuesToExport: Issue[]) => {
        const XLSX = (window as any).XLSX;
        if (!XLSX) {
            alert('Gagal mengekspor: Pustaka ekspor Excel tidak dapat dimuat. Silakan coba muat ulang halaman.');
            return;
        }

        // Sheet 1: Ringkasan Rapat
        const meetingSummaryData = meetingsToExport.map(m => ({
            "Tanggal Rapat": formatDate(m.date),
            "Peserta": m.attendees,
            "Jumlah Isu Dibahas": m.discussedIssueIds.length
        }));
        const wsSummary = XLSX.utils.json_to_sheet(meetingSummaryData);

        // Sheet 2: Catatan Rapat
        const meetingNotesData = meetingsToExport.flatMap(m => 
            Object.entries(m.notes).map(([branchId, noteHtml]) => ({
                "Tanggal Rapat": formatDate(m.date),
                "Cabang": branches.find(b => b.id === branchId)?.name || 'N/A',
                "Catatan": stripHtml(noteHtml)
            }))
        );
        const wsNotes = XLSX.utils.json_to_sheet(meetingNotesData);

        // Sheet 3: Detail Isu
        const issueDetailsData = issuesToExport.map(i => ({
            "ID Isu": i.id,
            "Judul": i.title,
            "Cabang": branches.find(b => b.id === i.branchId)?.name || 'N/A',
            "Status": i.status,
            "Prioritas": i.priority,
            "Tanggal Dibuat": formatDate(i.createdAt),
        }));
        const wsIssues = XLSX.utils.json_to_sheet(issueDetailsData);

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, wsSummary, "Ringkasan Rapat");
        XLSX.utils.book_append_sheet(wb, wsNotes, "Catatan Rapat");
        XLSX.utils.book_append_sheet(wb, wsIssues, "Detail Isu");

        XLSX.writeFile(wb, `Laporan Rapat ${exportStartDate} - ${exportEndDate}.xlsx`);
    };
    
    const branchesForMeetingView = useMemo(() => {
        if (activeMeeting) {
            return [...branches].sort((a, b) => a.name.localeCompare(b.name));
        }
        if (editingMeeting) {
            const branchIdsWithNotes = Object.keys(editingMeeting.notes);
            const branchIdsWithIssues = allIssues
                .filter(issue => editingMeeting.discussedIssueIds.includes(issue.id))
                .map(issue => issue.branchId);
            
            const relevantBranchIds = [...new Set([...branchIdsWithNotes, ...branchIdsWithIssues])];
            
            return branches
                .filter(b => relevantBranchIds.includes(b.id))
                .sort((a, b) => a.name.localeCompare(b.name));
        }
        return [];
    }, [activeMeeting, editingMeeting, branches, allIssues]);

    const filteredMeetings = useMemo(() => {
        if (!searchQuery.trim()) {
            return meetings;
        }
        const lowercasedQuery = searchQuery.toLowerCase();
        return meetings.filter(meeting => 
            meeting.discussedIssueIds.some(issueId => {
                const issue = allIssues.find(i => i.id === issueId);
                if (!issue) return false;
                return (
                    issue.title.toLowerCase().includes(lowercasedQuery) ||
                    issue.description.toLowerCase().includes(lowercasedQuery)
                );
            })
        );
    }, [meetings, allIssues, searchQuery]);


    if (activeMeeting || editingMeeting) {
        const meetingDate = activeMeeting?.date || editingMeeting?.date || new Date().toISOString();
        const title = activeMeeting ? "Rapat Umum Sedang Berlangsung" : "Mengedit Catatan Rapat";
        const isDiscussionDisabled = !!editingMeeting;

        return (
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-md space-y-8">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-500">Tanggal: {formatDate(meetingDate)}</p>
                </div>

                <div>
                    <label className="block text-lg font-semibold text-slate-800 mb-2">Peserta Rapat</label>
                    <AttendeesInput value={meetingAttendees} onChange={setMeetingAttendees} />
                </div>
                
                <div className="space-y-6 pt-6 border-t border-slate-200">
                     {branchesForMeetingView.map(branch => {
                        const branchIssues = allIssues.filter(issue => 
                            issue.branchId === branch.id && issue.status !== IssueStatus.Resolved
                        );

                        return (
                            <div key={branch.id} className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h4 className="text-lg font-bold text-slate-700">{branch.name}</h4>
                                    {!isDiscussionDisabled && (
                                        <button 
                                            onClick={() => handleOpenAddIssueModal(branch.id)} 
                                            className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold px-3 py-1.5 rounded-lg shadow-sm hover:bg-slate-100 transition-colors text-sm"
                                        >
                                            <PlusIcon className="h-4 w-4 mr-2" />
                                            Tambah Isu
                                        </button>
                                    )}
                                </div>
                                
                                <div className="mb-4">
                                    <label className="block text-sm font-medium text-slate-600 mb-2">Catatan Rapat</label>
                                    <RichTextEditor
                                        value={meetingNotes[branch.id] || ''}
                                        onChange={(value) => handleNoteChange(branch.id, value)}
                                    />
                                </div>
                                
                                {branchIssues.length > 0 && (
                                    <div>
                                        <h5 className="text-sm font-semibold text-slate-600 mb-2">Isu Terbuka ({branchIssues.length})</h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {branchIssues.map(issue => (
                                                <IssueCard key={issue.id} issue={issue} onSelect={() => setSelectedIssue(issue)} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
                
                <div className="flex justify-end space-x-3 border-t border-slate-200 pt-6">
                    <button onClick={handleCancelEditOrMeeting} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100">Batalkan</button>
                    <button onClick={activeMeeting ? handleFinishMeeting : handleSaveMeetingChanges} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                        {activeMeeting ? 'Selesaikan Rapat' : 'Simpan Perubahan'}
                    </button>
                </div>
                 {selectedIssue && (
                    <IssueModal 
                        issue={selectedIssue} 
                        isOpen={!!selectedIssue} 
                        onClose={() => setSelectedIssue(null)} 
                        onSave={onUpdateIssue} 
                        onAddUpdateLog={onAddUpdateLog}
                        onUpdateLogEntry={onUpdateLogEntry}
                        onDeleteLogEntry={onDeleteLogEntry}
                    />
                )}
                {isAddIssueModalOpen && (
                    <AddIssueForm 
                        isOpen={isAddIssueModalOpen} 
                        onClose={handleCloseAddIssueModal} 
                        onSubmit={handleAddIssueSubmit} 
                    />
                )}
            </div>
        )
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800">Pelacak Isu & Rapat</h1>
                    <p className="text-slate-500">Kelola isu dari semua cabang dalam satu rapat terpusat.</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button onClick={handleStartMeeting} className="flex items-center bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                        Mulai Rapat Umum
                    </button>
                </div>
            </div>

            <div className="flex flex-wrap gap-4 justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-700">Riwayat Rapat Umum</h2>
                <div className="flex items-center space-x-3">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-slate-400" />
                        </span>
                        <input
                            type="text"
                            placeholder="Cari isu..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full md:w-64 pl-10 pr-4 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                            aria-label="Cari isu berdasarkan judul atau deskripsi"
                        />
                    </div>
                    <button 
                        onClick={() => setExportModalOpen(true)}
                        className="flex items-center bg-white border border-slate-300 text-slate-700 font-semibold px-4 py-2 rounded-lg shadow-sm hover:bg-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                    >
                        <ExportIcon className="h-5 w-5 mr-2"/>
                        Ekspor Riwayat
                    </button>
                </div>
            </div>
            {filteredMeetings.length > 0 ? (
                <div className="space-y-4">
                    {filteredMeetings.map(meeting => {
                        const discussedIssues = meeting.discussedIssueIds
                            .map(id => allIssues.find(issue => issue.id === id))
                            .filter((issue): issue is Issue => issue !== undefined);

                        const groupedIssues = discussedIssues.reduce((acc, issue) => {
                            const branch = branches.find(b => b.id === issue.branchId);
                            const branchName = branch ? branch.name : 'Cabang Tidak Dikenal';
                            if (!acc[issue.branchId]) {
                                acc[issue.branchId] = {
                                    branchName: branchName,
                                    issues: []
                                };
                            }
                            acc[issue.branchId].issues.push(issue);
                            return acc;
                        }, {} as Record<string, { branchName: string; issues: Issue[] }>);

                        return (
                            <details key={meeting.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm overflow-hidden">
                                <summary className="font-semibold text-slate-800 cursor-pointer list-item flex justify-between items-center">
                                    <span>Rapat pada {formatDate(meeting.date)}</span>
                                    <button
                                        onClick={(e) => { e.preventDefault(); handleEditMeeting(meeting); }}
                                        className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100 hover:text-slate-800 transition-colors"
                                        aria-label="Edit Rapat"
                                        title="Edit Catatan Rapat"
                                    >
                                        <PencilIcon className="h-4 w-4" />
                                    </button>
                                </summary>

                                <div className="mt-4 pt-4 border-t border-slate-200">
                                    <div className="mb-4 text-sm">
                                        <div className="flex items-start">
                                            <UsersIcon className="h-5 w-5 mr-3 mt-1 text-slate-400 flex-shrink-0"/>
                                            <div>
                                                <h4 className="font-semibold text-slate-600">Peserta</h4>
                                                <p className="text-slate-500 whitespace-pre-wrap">{meeting.attendees || '-'}</p>
                                            </div>
                                        </div>
                                    </div>
                                    <h4 className="font-semibold text-slate-600 mb-3">Isu dan Catatan yang Dibahas ({discussedIssues.length})</h4>
                                     {discussedIssues.length > 0 ? (
                                        <div className="space-y-6">
                                            {Object.entries(groupedIssues).map(([branchId, group]) => (
                                                <div key={group.branchName}>
                                                    <h5 className="text-sm font-bold uppercase tracking-wider text-slate-500 bg-slate-50 px-3 py-2 rounded-t-md border-x border-t border-slate-200">
                                                        {group.branchName}
                                                    </h5>
                                                    <div className="border border-slate-200 rounded-b-md">
                                                        {meeting.notes && meeting.notes[branchId] && stripHtml(meeting.notes[branchId]).trim() && (
                                                            <div className="p-4 border-b border-slate-200 bg-slate-50">
                                                                <h6 className="font-semibold text-xs text-slate-600 mb-2 uppercase tracking-wider">Catatan:</h6>
                                                                <div className="prose prose-sm max-w-none text-slate-600" dangerouslySetInnerHTML={{ __html: meeting.notes[branchId] }} />
                                                            </div>
                                                        )}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                                                            {group.issues.map(issue => (
                                                                <IssueCard key={issue.id} issue={issue} onSelect={() => setSelectedIssue(issue)} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-slate-500">Tidak ada isu yang tercatat untuk rapat ini.</p>
                                    )}
                                </div>
                            </details>
                        )
                    })}
                </div>
            ) : (
                 <div className="text-center py-16 px-6 bg-white rounded-lg border border-slate-200">
                    <h3 className="text-xl font-semibold text-slate-700">
                        {searchQuery ? 'Tidak Ada Hasil Ditemukan' : 'Belum Ada Riwayat Rapat'}
                    </h3>
                    <p className="text-slate-500 mt-2">
                        {searchQuery 
                            ? `Tidak ada rapat yang membahas isu dengan kata kunci "${searchQuery}".` 
                            : 'Mulai rapat umum untuk mencatat diskusi dan melacak isu.'}
                    </p>
                </div>
            )}

            {selectedIssue && (
                <IssueModal 
                    issue={selectedIssue} 
                    isOpen={!!selectedIssue} 
                    onClose={() => setSelectedIssue(null)} 
                    onSave={onUpdateIssue} 
                    onAddUpdateLog={onAddUpdateLog}
                    onUpdateLogEntry={onUpdateLogEntry}
                    onDeleteLogEntry={onDeleteLogEntry}
                />
            )}
            
            {/* Export Modal */}
            {isExportModalOpen && (
                 <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                            <h2 className="text-2xl font-bold text-slate-800">Ekspor Riwayat Rapat</h2>
                            <button onClick={() => setExportModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                                <XIcon className="h-6 w-6" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                             <div>
                                <label htmlFor="start-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Mulai</label>
                                <input
                                    type="date"
                                    id="start-date"
                                    value={exportStartDate}
                                    onChange={(e) => setExportStartDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <label htmlFor="end-date" className="block text-sm font-medium text-slate-700 mb-1">Tanggal Selesai</label>
                                <input
                                    type="date"
                                    id="end-date"
                                    value={exportEndDate}
                                    onChange={(e) => setExportEndDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                            <div>
                                <span className="block text-sm font-medium text-slate-700">Format Ekspor</span>
                                 <p className="text-sm text-slate-500 bg-slate-100 p-2 rounded-md border border-slate-200 mt-1">
                                    Laporan akan diekspor sebagai file Excel (.xlsx).
                                </p>
                            </div>
                        </div>
                        <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end space-x-3">
                            <button type="button" onClick={() => setExportModalOpen(false)} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100">
                                Batal
                            </button>
                            <button type="button" onClick={handleExport} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                                Ekspor ke Excel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};