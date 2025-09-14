import React, { useState, useEffect } from 'react';
import { PREDEFINED_ATTENDEES } from '../constants';

interface AttendeesInputProps {
    value: string;
    onChange: (value: string) => void;
}

export const AttendeesInput: React.FC<AttendeesInputProps> = ({ value, onChange }) => {
    const [selectedAttendees, setSelectedAttendees] = useState<string[]>([]);
    const [manualAttendee, setManualAttendee] = useState('');

    useEffect(() => {
        // This effect synchronizes the internal state with the parent's value
        // It's a simple approach; more complex scenarios might need `useMemo`
        const allAttendees = value.split(',').map(s => s.trim()).filter(Boolean);
        const predefined = allAttendees.filter(a => PREDEFINED_ATTENDEES.includes(a));
        const manual = allAttendees.filter(a => !PREDEFINED_ATTENDEES.includes(a)).join(', ');
        
        setSelectedAttendees(predefined);
        setManualAttendee(manual);
    }, []); // Run only on mount to initialize

    const handleSelectionChange = (attendee: string) => {
        const newSelection = selectedAttendees.includes(attendee)
            ? selectedAttendees.filter(a => a !== attendee)
            : [...selectedAttendees, attendee];
        
        updateParent(newSelection, manualAttendee);
    };
    
    const handleSelectAll = (isChecked: boolean) => {
        const newSelection = isChecked ? PREDEFINED_ATTENDEES : [];
        updateParent(newSelection, manualAttendee);
    };

    const handleManualChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateParent(selectedAttendees, e.target.value);
    };

    const updateParent = (selected: string[], manual: string) => {
        setSelectedAttendees(selected);
        setManualAttendee(manual);
        const all = [...selected, ...manual.split(',').map(s => s.trim()).filter(Boolean)];
        onChange(all.join(', '));
    };

    const areAllSelected = PREDEFINED_ATTENDEES.length > 0 && selectedAttendees.length === PREDEFINED_ATTENDEES.length;

    return (
        <div className="bg-slate-50 border border-slate-300 rounded-md p-3 space-y-3">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
                 <div className="col-span-2">
                    <label className="flex items-center text-sm font-medium text-slate-800">
                        <input
                            type="checkbox"
                            checked={areAllSelected}
                            onChange={(e) => handleSelectAll(e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        Pilih Semua
                    </label>
                </div>
                {PREDEFINED_ATTENDEES.map(name => (
                    <label key={name} className="flex items-center text-sm text-slate-700">
                        <input
                            type="checkbox"
                            value={name}
                            checked={selectedAttendees.includes(name)}
                            onChange={() => handleSelectionChange(name)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 mr-2"
                        />
                        {name}
                    </label>
                ))}
            </div>
            <div>
                <input
                    type="text"
                    value={manualAttendee}
                    onChange={handleManualChange}
                    placeholder="Tambah peserta lain (pisahkan dengan koma)"
                    className="w-full p-2 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>
        </div>
    );
};