import { type Branch, type Issue, type Meeting, IssueStatus, IssuePriority } from './types';

export const INITIAL_BRANCHES: Branch[] = [
    { id: 'BRANCH-1', name: 'FHC Bali', location: 'Bali' },
    { id: 'BRANCH-2', name: 'TMC Mataram', location: 'Mataram' },
    { id: 'BRANCH-3', name: 'TMC Maluk', location: 'Maluk' },
    { id: 'BRANCH-4', name: 'TMC Surabaya', location: 'Surabaya' },
    { id: 'BRANCH-5', name: 'TMC Semarang', location: 'Semarang' },
    { id: 'BRANCH-6', name: 'TMC Yogyakarta', location: 'Yogyakarta' },
];

export const PREDEFINED_ATTENDEES: string[] = [
    'dr. Agus',
    'dr. Eko',
    'dr. Fatimah',
    'dr. Lestari',
    'dr. Herman',
    'Pak Agung',
    'Support HO'
];

export const INITIAL_ISSUES: Issue[] = [];


export const INITIAL_MEETINGS: Meeting[] = [];
