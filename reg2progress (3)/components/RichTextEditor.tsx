import React, { useRef, useEffect } from 'react';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { UnderlineIcon } from './icons/UnderlineIcon';
import { AlignLeftIcon } from './icons/AlignLeftIcon';
import { AlignCenterIcon } from './icons/AlignCenterIcon';
import { AlignRightIcon } from './icons/AlignRightIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ListNumberIcon } from './icons/ListNumberIcon';
import { LinkIcon } from './icons/LinkIcon';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
}

const ToolbarButton = ({ onMouseDown, children, title }: { onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => void, children: React.ReactNode, title: string }) => (
    <button
        type="button"
        onMouseDown={onMouseDown}
        className="p-2 rounded hover:bg-slate-200 text-slate-600"
        title={title}
    >
        {children}
    </button>
);

export const RichTextEditor: React.FC<RichTextEditorProps> = ({ value, onChange }) => {
    const editorRef = useRef<HTMLDivElement>(null);

    // Efek ini memastikan konten editor diperbarui jika prop `value` berubah dari luar.
    useEffect(() => {
        if (editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value;
        }
    }, [value]);
    
    // Handler ini menyinkronkan perubahan dari editor kembali ke komponen induk.
    const handleInput = () => {
        if (editorRef.current) {
            onChange(editorRef.current.innerHTML);
        }
    };
    
    // Fungsi ini menjalankan perintah pemformatan.
    // Ini mencegah perilaku default mouse down (seperti kehilangan fokus) lalu menjalankan perintah.
    const handleCommand = (e: React.MouseEvent<HTMLButtonElement>, command: string, valueArg?: string) => {
        e.preventDefault(); // Mencegah editor kehilangan fokus
        document.execCommand(command, false, valueArg);
        // Kita tidak memanggil onChange di sini. Event `onInput` pada div akan menanganinya secara otomatis.
        editorRef.current?.focus(); // Memastikan fokus tetap pada editor
    };

    const handleLink = (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
        const selection = window.getSelection();
        if (!selection || selection.rangeCount === 0 || selection.toString().trim() === '') {
            alert('Silakan pilih teks untuk membuat tautan.');
            editorRef.current?.focus();
            return;
        }

        const url = prompt('Masukkan URL:', 'https://');
        if (url) {
            document.execCommand('createLink', false, url);
        }
        editorRef.current?.focus();
    };

    const colors = ['#000000', '#EF4444', '#F97316', '#10B981', '#3B82F6', '#8B5CF6'];

    return (
        <div className="border border-slate-300 rounded-md focus-within:ring-2 focus-within:ring-blue-500">
            <div className="p-1 border-b border-slate-300 bg-slate-50 flex flex-wrap items-center gap-1 rounded-t-md">
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'bold')} title="Bold"><BoldIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'italic')} title="Italic"><ItalicIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'underline')} title="Underline"><UnderlineIcon className="h-5 w-5" /></ToolbarButton>
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'insertUnorderedList')} title="Bulleted List"><ListBulletIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'insertOrderedList')} title="Numbered List"><ListNumberIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={handleLink} title="Insert Link"><LinkIcon className="h-5 w-5" /></ToolbarButton>
                <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'justifyLeft')} title="Align Left"><AlignLeftIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'justifyCenter')} title="Align Center"><AlignCenterIcon className="h-5 w-5" /></ToolbarButton>
                <ToolbarButton onMouseDown={(e) => handleCommand(e, 'justifyRight')} title="Align Right"><AlignRightIcon className="h-5 w-5" /></ToolbarButton>
                 <div className="w-[1px] h-6 bg-slate-200 mx-1"></div>
                <div className="flex items-center gap-1 px-2">
                    {colors.map(color => (
                        <button
                            key={color}
                            type="button"
                            onMouseDown={(e) => handleCommand(e, 'foreColor', color)}
                            className="w-5 h-5 rounded-full border border-slate-300"
                            style={{ backgroundColor: color }}
                            title={`Color ${color}`}
                        />
                    ))}
                </div>
            </div>
            <div
                ref={editorRef}
                contentEditable
                onInput={handleInput}
                className="prose prose-sm max-w-none p-3 h-64 overflow-y-auto focus:outline-none"
            />
        </div>
    );
};