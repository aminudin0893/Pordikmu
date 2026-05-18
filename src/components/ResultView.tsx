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
  X,
  FileText
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Textarea } from './ui/textarea';
import { toast } from 'sonner';
import { marked } from 'marked';

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

  const handleDownloadWord = async () => {
    try {
      const htmlBody = await marked.parse(displayContent);
      
      const htmlContent = `
        <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
        <head>
          <meta charset="UTF-8">
          <style>
            @page {
              size: 21cm 29.7cm;
              margin: 2cm 2cm 2cm 2cm;
            }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.5; color: #000; }
            h1 { text-align: center; text-transform: uppercase; border-bottom: 2pt solid black; padding-bottom: 5pt; font-size: 14pt; font-weight: bold; margin-bottom: 10pt; }
            h2 { text-transform: uppercase; border-bottom: 1pt solid black; margin-top: 14pt; margin-bottom: 6pt; font-size: 12pt; font-weight: bold; page-break-after: avoid; }
            h3 { font-size: 11pt; font-weight: bold; margin-top: 10pt; margin-bottom: 4pt; page-break-after: avoid; }
            p { text-align: justify; margin-bottom: 6pt; }
            table { border-collapse: collapse; width: 100%; border: 1pt solid black; margin-bottom: 10pt; page-break-inside: auto; }
            tr { page-break-inside: avoid; }
            th, td { border: 1pt solid black; padding: 4pt; vertical-align: top; font-size: 10pt; }
            th { background-color: #f3f4f6; font-weight: bold; text-align: center; }
            .header-info { text-align: center; border-bottom: 3.5pt double black; padding-bottom: 6pt; margin-bottom: 10pt; }
            .header-info div { line-height: 1.1; }
            .doc-title { text-align: center; font-weight: bold; font-size: 12pt; margin-top: 10pt; margin-bottom: 15pt; text-transform: uppercase; }
          </style>
        </head>
        <body>
          ${config.useLetterhead ? `
            <div class="header-info">
              <div style="font-size: 10pt; font-weight: bold;">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NON FORMAL</div>
              <div style="font-size: 11pt; font-weight: bold;">PIMPINAN DAERAH MUHAMMADIYAH KOTA PROBOLINGGO</div>
              <div style="font-size: 18pt; font-weight: 900; margin-top: 5pt; margin-bottom: 2pt;">${config.school || "SMP MUHAMMADIYAH 1 KOTA PROBOLINGGO"}</div>
              <div style="font-size: 10pt; font-weight: bold; font-style: italic; margin-bottom: 3pt;">TERAKREDITASI A</div>
              <div style="font-size: 9pt;">Jl. Mayjend Panjaitan 73 Kota Probolinggo Email: smp_muh.prob@yahoo.co.id</div>
              <div style="font-size: 9pt;">Telp/fax. 0335-422307 Website: smpmusapro.sch.id</div>
            </div>
          ` : ''}
          
          <div class="doc-title">
            <div style="text-decoration: underline; border-bottom: 1.5pt solid black; display: inline-block; padding-bottom: 2pt;">
              ${config.type === 'rpp' ? 'MODUL AJAR / RPP' : config.type === 'soal' ? 'NASKAH ASESMEN' : 'BAHAN AJAR DIGITAL'}
            </div>
            <div style="font-size: 11pt; margin-top: 5pt;">KURIKULUM MERDEKA</div>
          </div>
          
          <div class="content">
            ${htmlBody}
          </div>
        </body>
        </html>
      `;

      const blob = new Blob(['\ufeff', htmlContent], {
        type: 'application/msword',
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${config.type === 'rpp' ? 'RPP' : config.type === 'soal' ? 'Soal' : 'Materi'}_${config.subject}_${new Date().toLocaleDateString()}.doc`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Dokumen Word berhasil dibuat!");
    } catch (error) {
      console.error(error);
      toast.error("Gagal membuat dokumen Word");
    }
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
      .replace(/# KOP SURAT RESMI SEKOLAH[\s\S]*?---/gi, '')
      .replace(/# HEADER & IDENTITAS[\s\S]*?---/gi, '')
      .replace(/# BAHAN AJAR DIGITAL ESENSIAL[\s\S]*?---/gi, '')
      .replace(/1\. KOP SURAT[\s\S]*?---/gi, '')
      .replace(/MENTERI PENDIDIKAN[\s\S]*?KEPUTUSAN/gi, '')
      .replace(/DINAS PENDIDIKAN[\s\S]*?KEBUDAYAAN/gi, '')
      .replace(/SMP MUHAMMADIYAH[\s\S]*?@GMAIL\.COM/gi, '')
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<div[^>]*>/gi, '')
      .replace(/<\/div>/gi, '')
      .replace(/<span[^>]*>/gi, '')
      .replace(/<\/span>/gi, '')
      .trim();
  };

  const displayContent = cleanMarkdown(content);
  const displayEditedContent = cleanMarkdown(editedContent);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-100 dark:shadow-none no-print transition-colors">
        <div>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold text-sm uppercase tracking-wider mb-1">
            <CheckCircle2 className="w-4 h-4" /> Dokumen Selesai Disusun
          </div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white">
            {config.type === 'rpp' ? 'Modul Ajar / RPP' : 
             config.type === 'soal' ? 'Bank Soal Ujian' : 'Materi Ajar Digital'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">{config.topic || (Array.isArray(config.topics) ? config.topics[0] : "")} • {config.subject}</p>
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
          <Button onClick={handleDownloadWord} className="gap-2 bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-200">
            <FileText className="w-4 h-4" /> Download Word
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <Card className="lg:col-span-3 border-none shadow-inner bg-slate-100/50 dark:bg-slate-800/20 p-4 md:p-10 rounded-3xl overflow-auto max-h-[85vh] print:p-0 print:bg-white print:shadow-none print:max-h-none print:overflow-visible transition-colors">
          {isEditing ? (
            <div className="h-full min-h-[600px] flex flex-col space-y-4 p-4 bg-white dark:bg-slate-900 rounded-2xl shadow-xl">
              <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/30 p-3 rounded-lg text-amber-800 dark:text-amber-200 text-xs font-medium">
                Mode Edit Aktif: Anda dapat mengubah teks Markdown secara langsung di sini.
              </div>
              <Textarea 
                className="flex-1 w-full h-[800px] font-mono text-sm p-6 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-indigo-500 focus:border-indigo-500 rounded-xl"
                value={editedContent}
                onChange={(e) => setEditedContent(e.target.value)}
              />
            </div>
          ) : (
            <div className="bg-white border border-slate-100 mx-auto rounded-none min-h-[1100px] w-full max-w-[850px] p-8 md:p-16 paper-content">
              {config.useLetterhead && (
                <div className="mb-6 border-b-[4.5pt] border-double border-black pb-4 text-center relative">
                  <div className="flex items-center gap-6 text-black">
                    {config.logo && (
                      <div className="shrink-0 w-[100px] h-[100px] flex items-center justify-center">
                        <img referrerPolicy="no-referrer" src={config.logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    )}
                    <div className={`flex-1 text-center ${config.logo ? 'pr-[100px]' : ''}`}>
                      <p className="text-[10px] font-bold leading-tight uppercase tracking-tight">MAJELIS PENDIDIKAN DASAR MENENGAH DAN PENDIDIKAN NON FORMAL</p>
                      <p className="text-[11px] font-bold leading-tight uppercase">PIMPINAN DAERAH MUHAMMADIYAH KOTA PROBOLINGGO</p>
                      <p className="text-xl font-black leading-tight uppercase mt-1 mb-1 tracking-tighter">
                        {config.school || "SMP MUHAMMADIYAH 1 KOTA PROBOLINGGO"}
                      </p>
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] mb-1 italic">TERAKREDITASI A</p>
                      <p className="text-[9px] leading-tight font-medium">
                        Jl. Mayjend Panjaitan 73 Probolinggo | Email: <span className="text-blue-700 underline">smp_muh.prob@yahoo.co.id</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Document Title Header */}
              <div className="mb-8 text-center uppercase">
                <h1 className="text-xl font-black border-b-2 border-black inline-block px-6 pb-0.5 mb-1 tracking-widest text-black">
                  {config.type === 'rpp' ? 'MODUL AJAR / RPP' : config.type === 'soal' ? 'NASKAH ASESMEN' : 'BAHAN AJAR DIGITAL'}
                </h1>
                <p className="text-[11px] font-bold text-black tracking-widest italic">KURIKULUM MERDEKA</p>
              </div>

              <div className="prose max-w-none print:text-black">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{displayContent}</ReactMarkdown>
              </div>
            </div>
          )}
        </Card>

        <div className="space-y-6 no-print">
           <Card className="border-none shadow-xl shadow-slate-100 dark:shadow-none bg-white dark:bg-slate-900 p-6 transition-colors">
              <h3 className="font-bold text-sm uppercase tracking-widest text-slate-400 mb-4">Metadata Dokumen</h3>
              <div className="space-y-4">
                 {[
                   { label: 'Penyusun', value: config.name },
                   { label: 'Sekolah', value: config.school },
                   { label: 'Kelas', value: config.phaseGrade },
                   { label: 'Model', value: config.learningModel || (config.type === 'soal' ? 'HOTS' : 'Kontekstual') },
                   { label: 'Tahun', value: config.schoolYear },
                 ].map((item, i) => (
                   <div key={i} className="pb-3 border-b border-slate-50 dark:border-slate-800 last:border-0">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{item.label}</p>
                      <p className="text-sm font-bold text-slate-800 dark:text-slate-200">{item.value}</p>
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
