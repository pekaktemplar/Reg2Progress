import React from 'react';
import { type Branch, type View } from '../types';
import { HospitalIcon } from './icons/HospitalIcon';
import { Logo } from './icons/Logo';
import { DashboardIcon } from './icons/DashboardIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';

interface SidebarProps {
    branches: Branch[];
    selectedBranchId: string | null;
    onSelectBranch: (id: string | null) => void;
    currentView: View;
    onSelectView: (view: View) => void;
}

const NavButton: React.FC<{
    isActive: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ isActive, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
            isActive
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100'
        }`}
    >
        {icon}
        <span className="font-semibold text-sm">{label}</span>
    </button>
);

export const Sidebar: React.FC<SidebarProps> = ({ branches, selectedBranchId, onSelectBranch, currentView, onSelectView }) => {
    
    const handleSelectBranch = (branchId: string) => {
        onSelectBranch(branchId);
        onSelectView('issues'); // Switch to issues view when a branch is selected
    };
    
    return (
        <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
            <div className="h-16 flex items-center px-6 border-b border-slate-200">
                <Logo />
                <h1 className="text-xl font-bold text-slate-800 ml-2">KlinikTracker</h1>
            </div>
            <nav className="flex-1 p-4 space-y-6">
                 <div>
                    <h2 className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Utama</h2>
                     <ul className="space-y-1">
                        <li>
                            <NavButton 
                                isActive={currentView === 'dashboard'} 
                                onClick={() => onSelectView('dashboard')}
                                icon={<DashboardIcon className="h-5 w-5 mr-3 flex-shrink-0"/>}
                                label="Dasbor"
                            />
                        </li>
                         <li>
                            <NavButton 
                                isActive={currentView === 'issues'} 
                                onClick={() => onSelectView('issues')}
                                icon={<ClipboardIcon className="h-5 w-5 mr-3 flex-shrink-0"/>}
                                label="Pelacak Isu & Rapat"
                            />
                        </li>
                    </ul>
                </div>
                <div>
                    <h2 className="px-2 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Cabang Klinik</h2>
                    <ul className="space-y-1">
                        {branches.map(branch => (
                            <li key={branch.id}>
                                <button
                                    onClick={() => handleSelectBranch(branch.id)}
                                    className={`w-full flex items-center p-3 rounded-lg text-left transition-colors duration-200 ${
                                        selectedBranchId === branch.id && currentView === 'issues'
                                            ? 'bg-slate-200 text-slate-800'
                                            : 'text-slate-600 hover:bg-slate-100'
                                    }`}
                                >
                                    <HospitalIcon className="h-5 w-5 mr-3 flex-shrink-0" />
                                    <div>
                                        <p className="font-semibold text-sm">{branch.name}</p>
                                        <p className={`text-xs ${selectedBranchId === branch.id && currentView === 'issues' ? 'text-slate-600' : 'text-slate-500'}`}>{branch.location}</p>
                                    </div>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </nav>
            <div className="p-4 border-t border-slate-200">
                <p className="text-xs text-slate-400 text-center">&copy; 2024 Manajemen Klinik</p>
            </div>
        </aside>
    );
};