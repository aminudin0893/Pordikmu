import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { 
  Download, 
  Copy, 
  Printer, 
  FileCheck,
  Share2,
  CheckCircle2,
  Edit3,
  Save,
  X
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';

interface Props {
  content: string;
  config: any;
}

export default function ResultView({ content: initialContent, config }: Props) {
  const [content, setContent] = useState(initialContent);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(initialContent);

  // Update content if initialContent changes from parent
  useEffect(() => {
    setContent(initialContent);
    setEditedContent(initialContent);
  }, [initialContent]);

  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    toast.success("Berhasil disalin ke papan klip!");
  };

  const handlePrint = () => {
    window.print();
  };

  const handleSaveEdit = () => {
    setContent(editedContent);
    setIsEditing(false);
    toast.success("Perubahan berhasil disimpan! (Lokal)");
  };

  const handleCancelEdit = () => {
    setEditedContent(content);
    setIsEditing(false);
  };

  // Clean content of common AI-generated HTML artifacts
  const cleanMarkdown = (text: string) => {
    return text
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '');
  };

  const displayContent = cleanMarkdown(content);
  const displayEditedContent = cleanMarkdown(editedContent);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-100 no-print">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 font-bold text-sm uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" /> Dokumen Selesai Disusun
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            {config.type === 'rpp' ? 'Modul Ajar / RPP' : 
             config.type === 'soal' ? 'Bank Soal Ujian' : 'Materi Ajar Digital'}
          </h2>
          <p className="text-slate-500 font-medium">{config.topic || (Array.isArray(config.topics) ? config.topics[0] : "")} • {config.subject}</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          {!isEditing ? (
            <Button variant="outline" onClick={() => setIsEditing(true)} className="gap-2 border-indigo-200 text-indigo-600 hover:bg-indigo-50">
              <Edit3 className="w-4 h-4" /> Edit Konten
            </Button>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancelEdit} className="gap-2 border-red-200 text-red-600 hover:bg-red-50">
                <X className="w-4 h-4" /> Batal
              </Button>
              <Button onClick={handleSaveEdit} className="gap-2 bg-green-600 hover:bg-green-700">
                <Save className="w-4 h-4" /> Simpan Perubahan
              </Button>
            </>
          )}
          <Button variant="outline" onClick={handleCopy} className="gap-2">
            <Copy className="w-4 h-4" /> Salin
          </Button>
          <Button variant="outline" onClick={handlePrint} className="gap-2">
            <Printer className="w-4 h-4" /> Cetak / PDF
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-none shadow-inner bg-slate-100/50 p-4 md:p-10 rounded-3xl overflow-auto max-h-[85vh] print:p-0 print:bg-white print:shadow-none print:max-h-none print:overflow-visible">
          {isEditing ? (
            <div className="h-full min-h-[600px] flex flex-col space-y-4 p-4 bg-white rounded-2xl shadow-xl">
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-amber-800 text-xs font-medium">
                Mode Edit Aktif: Anda dapat mengubah teks Markdown secara langsung di sini.
              </div>
              <Textarea 
                className="flex-1 w-full h-[800px] font-mono text-sm p-6 bg-slate-50 border-slate-200 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-100 mx-auto rounded-none min-h-[1100px] w-full max-w-[850px] p-12 md:p-20 paper-content">
              <div className="prose max-w-none">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6 no-print">
           <Card className="border-none shadow-xl shadow-slate-100 bg-white p-6">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">Metadata Dokumen</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Penyusun', value: config.name },
                   { label: 'Sekolah', value: config.school },
                   { label: 'Kelas', value: config.phaseGrade },
                   { label: 'Model', value: config.learningModel || (config.type === 'soal' ? 'HOTS' : 'Kontekstual') },
                   { label: 'Tahun', value: config.schoolYear },
                 ].map((item, i) => (
                   <div key={i} className="pb-3 border-b border-slate-50 last:border-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800">{item.value}</p>
                   </div>
                 ))}
              </div>
           </Card>

           <div className="p-6 bg-indigo-600 rounded-3xl text-white space-y-4">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                 <FileCheck className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-lg leading-tight">Siap digunakan di kelas!</h3>
              <p className="text-indigo-100 text-sm leading-relaxed">
                Dokumen ini telah disesuaikan dengan prinsip Kurikulum Merdeka dan pedagogi Deep Learning.
              </p>
              <Button variant="secondary" className="w-full gap-2 text-indigo-900 font-bold">
                 <Share2 className="w-4 h-4" /> Share Dokumen
              </Button>
           </div>
        </div>
      </div>
    </div>
  );
}
