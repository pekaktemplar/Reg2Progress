import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { type Issue, IssueStatus, IssuePriority, type UpdateLog } from '../types';
import { statusMap, priorityMap } from './Badge';
import { XIcon } from './icons/XIcon';
import { PaperAirplaneIcon } from './icons/PaperAirplaneIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface IssueModalProps {
    issue: Issue;
    isOpen: boolean;
    onClose: () => void;
    onSave: (issueId: string, updates: Partial<Issue>) => void;
    onAddUpdateLog: (issueId: string, logText: string) => void;
    onUpdateLogEntry: (issueId: string, logId: string, newText: string) => void;
    onDeleteLogEntry: (issueId: string, logId: string) => void;
}

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('id-ID', {
        day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });
};

export const IssueModal: React.FC<IssueModalProps> = ({ issue, isOpen, onClose, onSave, onAddUpdateLog, onUpdateLogEntry, onDeleteLogEntry }) => {
    const [title, setTitle] = useState(issue.title);
    const [description, setDescription] = useState(issue.description);
    const [status, setStatus] = useState(issue.status);
    const [priority, setPriority] = useState(issue.priority);
    const [dueDate, setDueDate] = useState(issue.dueDate || '');
    const [newLogText, setNewLogText] = useState('');
    
    // State for editing a specific log entry
    const [editingLogId, setEditingLogId] = useState<string | null>(null);
    const [editingLogText, setEditingLogText] = useState('');
    
    const modalRef = useRef<HTMLDivElement>(null);
    
    useEffect(() => {
        if (issue) {
            setTitle(issue.title);
            setDescription(issue.description);
            setStatus(issue.status);
            setPriority(issue.priority);
            setDueDate(issue.dueDate || '');
        }
    }, [issue]);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);

        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        }
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('keydown', handleEsc);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [onClose]);

    if (!isOpen) return null;

    const handleLogSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (newLogText.trim()) {
            onAddUpdateLog(issue.id, newLogText.trim());
            setNewLogText('');
        }
    };

    const handleSaveChanges = () => {
        const updates: Partial<Issue> = {};
        if (title.trim() && title !== issue.title) updates.title = title.trim();
        if (description.trim() && description !== issue.description) updates.description = description.trim();
        if (status !== issue.status) updates.status = status;
        if (priority !== issue.priority) updates.priority = priority;
        
        const newDueDate = dueDate || null;
        if (newDueDate !== issue.dueDate) {
            updates.dueDate = newDueDate;
        }

        if (Object.keys(updates).length > 0) {
            onSave(issue.id, updates);
        }
        onClose();
    };

    const handleEditLog = (log: UpdateLog) => {
        setEditingLogId(log.id);
        setEditingLogText(log.text);
    };

    const handleCancelEditLog = () => {
        setEditingLogId(null);
        setEditingLogText('');
    };
    
    const handleSaveLogUpdate = () => {
        if (editingLogId && editingLogText.trim()) {
            onUpdateLogEntry(issue.id, editingLogId, editingLogText.trim());
            handleCancelEditLog();
        }
    };

    const handleDeleteLog = (logId: string) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus entri riwayat ini?')) {
            onDeleteLogEntry(issue.id, logId);
        }
    };

    const sortedUpdates = [...issue.updates].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-200 flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-slate-800">Edit Isu</h2>
                        <div className="flex items-center mt-2 text-sm text-slate-500">
                             <CalendarIcon className="h-4 w-4 mr-2"/>
                             <span>Dibuat pada {formatDate(issue.createdAt)}</span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>

                <div className="flex-1 p-6 overflow-y-auto space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="issue-title" className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                            <input
                                type="text"
                                id="issue-title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor="issue-description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                            <textarea
                                id="issue-description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={5}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label htmlFor="issue-status" className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                                <select
                                    id="issue-status"
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as IssueStatus)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.values(IssueStatus).map(s => <option key={s} value={s}>{statusMap[s].text}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="issue-priority" className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                                <select
                                    id="issue-priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as IssuePriority)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.values(IssuePriority).map(p => <option key={p} value={p}>{priorityMap[p].text}</option>)}
                                </select>
                            </div>
                             <div>
                                <label htmlFor="issue-due-date" className="block text-sm font-medium text-slate-700 mb-1">Jatuh Tempo</label>
                                <input
                                    type="date"
                                    id="issue-due-date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="pt-6 border-t border-slate-200">
                        <form onSubmit={handleLogSubmit} className="flex items-center space-x-3">
                            <input
                                type="text"
                                value={newLogText}
                                onChange={(e) => setNewLogText(e.target.value)}
                                placeholder="Tambah pembaruan atau komentar..."
                                className="flex-1 p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button type="submit" className="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 disabled:bg-slate-300 disabled:cursor-not-allowed" disabled={!newLogText.trim()}>
                                <PaperAirplaneIcon className="h-5 w-5"/>
                            </button>
                        </form>
                     </div>

                     <div>
                         <h3 className="font-semibold text-slate-700 mb-3">Riwayat Pembaruan</h3>
                         <div className="space-y-4">
                             {sortedUpdates.map(log => (
                                <div key={log.id} className="group flex items-start">
                                     <div className="w-2 h-2 bg-slate-300 rounded-full mt-2 mr-4 flex-shrink-0"></div>
                                     {editingLogId === log.id ? (
                                        <div className="flex-1">
                                            <input 
                                                type="text"
                                                value={editingLogText}
                                                onChange={(e) => setEditingLogText(e.target.value)}
                                                className="w-full p-1.5 border border-slate-300 rounded-md text-sm"
                                            />
                                            <div className="flex items-center space-x-2 mt-2">
                                                <button onClick={handleSaveLogUpdate} className="text-xs font-semibold text-white bg-blue-500 px-2 py-1 rounded hover:bg-blue-600">Simpan</button>
                                                <button onClick={handleCancelEditLog} className="text-xs font-semibold text-slate-600 hover:text-slate-800">Batal</button>
                                            </div>
                                        </div>
                                     ) : (
                                        <div className="flex-1 flex justify-between items-start">
                                            <div>
                                                 <p className="text-slate-700">{log.text}</p>
                                                 <p className="text-xs text-slate-500 mt-1">{log.author} &middot; {formatDate(log.timestamp)}</p>
                                            </div>
                                            <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                 <button onClick={() => handleEditLog(log)} className="p-1 rounded text-slate-500 hover:bg-slate-100 hover:text-slate-800" title="Edit">
                                                    <PencilIcon className="h-4 w-4"/>
                                                 </button>
                                                 <button onClick={() => handleDeleteLog(log.id)} className="p-1 rounded text-slate-500 hover:bg-red-100 hover:text-red-600" title="Hapus">
                                                     <TrashIcon className="h-4 w-4"/>
                                                 </button>
                                             </div>
                                        </div>
                                     )}
                                </div>
                             ))}
                         </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end space-x-3 border-t border-slate-200">
                    <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100">
                        Batal
                    </button>
                    <button type="button" onClick={handleSaveChanges} className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                        Simpan Perubahan
                    </button>
                </div>
            </div>
        </div>
    );
};