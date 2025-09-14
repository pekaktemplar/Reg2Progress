import React, { useState, FormEvent, useRef, useEffect } from 'react';
import { IssuePriority, IssueStatus } from '../types';
import { XIcon } from './icons/XIcon';
import { priorityMap } from './Badge';

interface AddIssueFormProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: { title: string; description: string; priority: IssuePriority, status: IssueStatus, dueDate: string | null }) => void;
}

export const AddIssueForm: React.FC<AddIssueFormProps> = ({ isOpen, onClose, onSubmit }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [priority, setPriority] = useState<IssuePriority>(IssuePriority.Medium);
    const [dueDate, setDueDate] = useState('');
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => {
            window.removeEventListener('keydown', handleEsc);
        };
    }, [onClose]);

    if (!isOpen) return null;

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (title.trim() && description.trim()) {
            onSubmit({ title, description, priority, status: IssueStatus.Open, dueDate: dueDate || null });
            setTitle('');
            setDescription('');
            setPriority(IssuePriority.Medium);
            setDueDate('');
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div ref={modalRef} className="bg-white rounded-lg shadow-xl w-full max-w-lg">
                <div className="p-6 border-b border-slate-200 flex justify-between items-center">
                    <h2 className="text-2xl font-bold text-slate-800">Buat Isu Baru</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
                        <XIcon className="h-6 w-6" />
                    </button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="p-6 space-y-4">
                        <div>
                            <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">Judul</label>
                            <input
                                type="text"
                                id="title"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                            <textarea
                                id="description"
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label htmlFor="priority" className="block text-sm font-medium text-slate-700 mb-1">Prioritas</label>
                                <select
                                    id="priority"
                                    value={priority}
                                    onChange={(e) => setPriority(e.target.value as IssuePriority)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    {Object.values(IssuePriority).map(p => <option key={p} value={p}>{priorityMap[p].text}</option>)}
                                </select>
                            </div>
                            <div>
                                <label htmlFor="due-date" className="block text-sm font-medium text-slate-700 mb-1">Jatuh Tempo (Opsional)</label>
                                <input
                                    type="date"
                                    id="due-date"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="w-full p-2 border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-50 rounded-b-lg flex justify-end space-x-3">
                        <button type="button" onClick={onClose} className="px-4 py-2 bg-white border border-slate-300 rounded-md text-slate-700 hover:bg-slate-100">
                            Batal
                        </button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600">
                            Buat Isu
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};