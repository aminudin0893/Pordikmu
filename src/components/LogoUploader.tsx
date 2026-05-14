import React, { useState } from 'react';
import { ImageIcon, Upload, X, Download } from 'lucide-react';
import { Button } from './ui/button';
import { toast } from 'sonner';

interface Props {
  value?: string;
  onChange: (value: string) => void;
}

export function LogoUploader({ value, onChange }: Props) {
  const [isDragOver, setIsDragOver] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      toast.error("Hanya file gambar yang diperbolehkan");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Ukuran file maksimal 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onChange(result);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500">Logo Sekolah / Instansi</label>
        <a 
          href="https://drive.google.com/file/d/1VvSuJzYatiDrM5-j0yNIDmUjvAGCHGuH/view?usp=drivesdk" 
          target="_blank" 
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-[10px] font-bold text-indigo-600 hover:underline"
        >
          <Download className="w-3 h-3" /> Unduh Contoh Logo
        </a>
      </div>
      
      {value ? (
        <div className="relative w-full aspect-video md:aspect-[4/1] bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 flex items-center justify-center p-4">
          <img referrerPolicy="no-referrer" src={value} alt="Logo Preview" className="max-h-full max-w-full object-contain" />
          <Button 
            size="icon" 
            variant="destructive" 
            className="absolute top-2 right-2 w-8 h-8 rounded-full shadow-lg"
            onClick={() => onChange('')}
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      ) : (
        <div 
          className={`relative w-full aspect-video md:aspect-[4/1] rounded-xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center gap-2 p-6 ${
            isDragOver ? 'border-indigo-600 bg-indigo-50/50' : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
          }`}
          onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById('logo-input')?.click()}
        >
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm text-slate-400">
            <Upload className="w-5 h-5" />
          </div>
          <div className="text-center">
            <p className="text-xs font-bold text-slate-700">Klik atau seret logo ke sini</p>
            <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-widest font-medium">PNG, JPG (Max 2MB)</p>
          </div>
          <input 
            id="logo-input"
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </div>
      )}
    </div>
  );
}
