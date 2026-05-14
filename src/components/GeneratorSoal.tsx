import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  GraduationCap, 
  Rocket, 
  Brain,
  ListTodo,
  Gauge,
  Info,
  Image as ImageIcon,
  Zap,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Badge } from './ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { generateEducationContent } from '../lib/gemini';
import { toast } from 'sonner';

const soalSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  schoolYear: z.string().min(1, "Tahun Pelajaran harus diisi"),
  topics: z.array(z.string()).min(1, "Minimal satu topik materi harus diisi"),
  assessmentType: z.string().min(1, "Jenis Asesmen harus diisi"),
  optionsCount: z.string().min(1, "Jumlah Opsi harus diisi"),
  cognitiveLevels: z.array(z.string()).min(1, "Pilih minimal satu level kognitif"),
  easyPerc: z.number(),
  mediumPerc: z.number(),
  hardPerc: z.number(),
  mcqCount: z.number().min(0),
  multiResponseCount: z.number().min(0),
  trueFalseCount: z.number().min(0),
  shortAnswerCount: z.number().min(0),
  essayCount: z.number().min(0),
  matchTableCount: z.number().min(0),
  specialInstructions: z.string().optional(),
});

type SoalFormData = z.infer<typeof soalSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
}

export default function GeneratorSoal({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<SoalFormData>({
    resolver: zodResolver(soalSchema),
    defaultValues: {
      schoolYear: "2025/2026",
      assessmentType: "Sumatif Harian",
      optionsCount: "4 Opsi (A, B, C, D)",
      cognitiveLevels: ["C3", "C4"],
      easyPerc: 30,
      mediumPerc: 50,
      hardPerc: 20,
      mcqCount: 10,
      topics: [""],
      multiResponseCount: 0,
      trueFalseCount: 0,
      shortAnswerCount: 0,
      essayCount: 2,
      matchTableCount: 0,
    }
  });

  const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', newVal: number) => {
    const fieldMap = {
      easy: 'easyPerc',
      medium: 'mediumPerc',
      hard: 'hardPerc'
    } as const;
    
    // Ensure value is within 0-100 range
    const sanitizedVal = Math.min(100, Math.max(0, newVal));
    form.setValue(fieldMap[type], sanitizedVal);
  };

  const currentEasy = form.watch('easyPerc') || 0;
  const currentMedium = form.watch('mediumPerc') || 0;
  const currentHard = form.watch('hardPerc') || 0;
  const totalPerc = currentEasy + currentMedium + currentHard;
  const isTotalCorrect = totalPerc === 100;

  const [topics, setTopics] = useState(form.getValues('topics') || [""]);

  const addTopic = () => {
    const newTopics = [...topics, ""];
    setTopics(newTopics);
    form.setValue('topics', newTopics);
  };

  const removeTopic = (index: number) => {
    if (topics.length > 1) {
      const newTopics = topics.filter((_, i) => i !== index);
      setTopics(newTopics);
      form.setValue('topics', newTopics);
    }
  };

  const updateTopic = (index: number, val: string) => {
    const newTopics = [...topics];
    newTopics[index] = val;
    setTopics(newTopics);
    form.setValue('topics', newTopics);
  };

  const onSubmit = async (data: SoalFormData) => {
    setLoading(true);
    try {
      const totalSoal = data.mcqCount + data.multiResponseCount + data.trueFalseCount + data.shortAnswerCount + data.essayCount + data.matchTableCount;
      if (totalSoal === 0) {
        toast.error("Tentukan jumlah soal yang akan di-generate!");
        setLoading(false);
        return;
      }

      const currentTotalPerc = data.easyPerc + data.mediumPerc + data.hardPerc;
      if (currentTotalPerc !== 100) {
        toast.error(`Total proporsi harus 100% (saat ini ${currentTotalPerc}%)`);
        setLoading(false);
        return;
      }

      const prompt = `
        Ciptakan BANK SOAL UJIAN (NASKAH SOAL) yang TERSTRUKTUR, SANGAT RAPI, dan PROFESIONAL sebagai DOKUMEN RESMI SIAP CETAK sesuai standar Kurikulum Merdeka.
        
        Sajikan identitas ujian dalam TABEL MARKDOWN yang rapi di bagian awal (Header):
        IDENTITAS ASESMEN:
        - Guru: ${data.name}
        - Sekolah: ${data.school}
        - Mata Pelajaran: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Materi Utama: ${data.topics.join(", ")}
        - Jenis Asesmen: ${data.assessmentType}
        - Tahun Pelajaran: ${data.schoolYear}
        
        DATA TEKNIS SOAL:
        - Opsi PG: ${data.optionsCount}
        - Level Kognitif: ${data.cognitiveLevels.join(", ")}
        - Distribusi: Mudah (${data.easyPerc}%), Sedang (${data.mediumPerc}%), Sulit/HOTS (${data.hardPerc}%)
        
        WAJIB ADA (STRUKTUR DOKUMEN):
        1. KOP SOAL: Header identitas sekolah dan ujian yang sangat profesional.
        2. PETUNJUK UMUM: Langkah mengerjakan ujian.
        3. NASKAH SOAL: Tuliskan soal per kategori tipe soal dengan rapi.
           - Gunakan tabel Markdown untuk soal tipe "MENJODOHKAN".
           - Setiap nomor wajib mencantumkan label [Level Kognitif, misal: C4-HOTS].
           - Total Soal: PG (${data.mcqCount}), PG_K (${data.multiResponseCount}), B/S (${data.trueFalseCount}), Isian (${data.shortAnswerCount}), Essay (${data.essayCount}), Menjodohkan (${data.matchTableCount}).
        4. KISI-KISI SOAL (TABEL PROFESIONAL): Tabel Kisi-Kisi lengkap (No, TP, Materi, Indikator, Level, Bentuk).
        5. KUNCI JAWABAN & RUBRIK (TABEL PROFESIONAL): Sajikan kunci jawaban dalam tabel yang rapi dan rubrik penilaian yang detail.
        
        INSTRUKSI TEKNIS:
        - Gunakan Bahasa Indonesia formal (EYD).
        - Wajib menggunakan Tabel Markdown (|---|---|) yang rapi untuk Identitas, Menjodohkan, Kisi-kisi, dan Rubrik.
        - Pastikan soal memiliki stimulus (Stem) yang kontekstual sesuai prinsip "Deep Learning".
        - Gunakan garis pembatas (---) antar section besar agar dokumen mudah dibaca saat dicetak.
        - Dokumen harus memiliki tampilan formal layaknya ujian nasional atau ujian sekolah resmi.
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'soal' });
      toast.success("Soal ujian berhasil di-generate!");
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat soal");
    } finally {
      setLoading(false);
    }
  };

  const cognitiveLevelOptions = [
    { id: 'C1', label: 'C1: Mengingat' },
    { id: 'C2', label: 'C2: Memahami' },
    { id: 'C3', label: 'C3: Menerapkan' },
    { id: 'C4', label: 'C4: Menganalisis (HOTS)' },
    { id: 'C5', label: 'C5: Mengevaluasi (HOTS)' },
    { id: 'C6', label: 'C6: Mencipta (HOTS)' },
  ];

  return (
    <Card className="border-none shadow-2xl shadow-indigo-100 bg-white overflow-hidden rounded-t-none md:rounded-t-3xl">
      <CardHeader className="bg-orange-600 text-white p-6 md:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
          <div>
            <CardTitle className="text-xl md:text-2xl font-black leading-tight">APLIKASI GENERATOR SOAL UJIAN AI</CardTitle>
            <CardDescription className="text-orange-100 font-medium text-xs md:text-sm">Bank soal HOTS yang terstruktur dan rapi.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 md:space-y-10">
          <div className="space-y-4 md:space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <Brain className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <h3 className="font-bold text-base md:text-lg italic">Identitas Asesmen & Kurikulum</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <Label className="font-bold text-sm">Model Kurikulum</Label>
                  <Select defaultValue="Kurikulum Merdeka (Deep Learning)">
                    <SelectTrigger className="font-semibold text-orange-700 bg-orange-50/50 border-orange-100 h-10 md:h-12">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kurikulum Merdeka (Deep Learning)">Kurikulum Merdeka (Deep Learning)</SelectItem>
                      <SelectItem value="Kurikulum 2013 (Revisi)">Kurikulum 2013 (Revisi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold text-sm">Nama Guru</Label>
                  <Input placeholder="Aminudin" {...form.register('name')} className="h-10 md:h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="font-bold text-sm">Nama Sekolah</Label>
                  <Input placeholder="SMP Negeri..." {...form.register('school')} className="h-10 md:h-12" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-bold text-sm">Mata Pelajaran</Label>
                  <Input placeholder="Bahasa Indonesia" {...form.register('subject')} className="h-10 md:h-12" />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold text-sm">Fase / Kelas</Label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Select onValueChange={(val: string) => {
                      if (val !== "manual") form.setValue('phaseGrade', val);
                    }}>
                      <SelectTrigger className="w-full sm:w-[180px] h-10 md:h-12">
                        <SelectValue placeholder="Pilih..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Fase A (Kelas 1-2) SD">Fase A (1-2)</SelectItem>
                        <SelectItem value="Fase B (Kelas 3-4) SD">Fase B (3-4)</SelectItem>
                        <SelectItem value="Fase C (Kelas 5-6) SD">Fase C (5-6)</SelectItem>
                        <SelectItem value="Fase D (Kelas 7-9) SMP">Fase D (7-9)</SelectItem>
                        <SelectItem value="Fase E (Kelas 10) SMA">Fase E (10)</SelectItem>
                        <SelectItem value="Fase F (Kelas 11-12) SMA">Fase F (11-12)</SelectItem>
                        <SelectItem value="manual">-- Input Manual --</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input 
                      placeholder="Manual..." 
                      {...form.register('phaseGrade')} 
                      className="flex-grow h-10 md:h-12"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold text-sm">Tahun Pelajaran</Label>
                   <Input placeholder="2025/2026" {...form.register('schoolYear')} className="h-10 md:h-12" />
                </div>
                <div className="col-span-full space-y-3 md:space-y-4">
                   <div className="flex items-center justify-between">
                     <Label className="font-bold text-sm italic">Topik / Materi Utama Ujian</Label>
                     <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 md:h-9 gap-1 text-xs px-2 py-0">
                       <Plus className="w-3 h-3" /> Tambah
                     </Button>
                   </div>
                   <div className="space-y-2">
                     {topics.map((t, idx) => (
                       <div key={idx} className="flex gap-2">
                         <Input 
                           placeholder={`Topik ${idx + 1}`} 
                           value={t} 
                           onChange={(e) => updateTopic(idx, e.target.value)}
                           className="h-10 md:h-11"
                         />
                         {topics.length > 1 && (
                           <Button type="button" variant="ghost" size="icon" onClick={() => removeTopic(idx)} className="text-red-500 h-10 w-10 md:h-11 md:w-11">
                             <Trash2 className="w-4 h-4" />
                           </Button>
                         )}
                       </div>
                     ))}
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6 md:space-y-8 p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-200">
             <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                <Settings className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <h3 className="font-bold text-base md:text-lg">Konfigurasi Detail Soal</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                <div className="space-y-4 md:space-y-6">
                   <div className="space-y-2">
                      <Label className="font-bold text-sm">Jenis Asesmen / Ujian</Label>
                      <Select onValueChange={(val) => form.setValue('assessmentType', val)} defaultValue="Sumatif Harian">
                        <SelectTrigger className="h-10 md:h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Sumatif Harian">Sumatif Harian</SelectItem>
                          <SelectItem value="Sumatif Tengah Semester">Sumatif Tengah Semester</SelectItem>
                          <SelectItem value="Sumatif Akhir Semester">Sumatif Akhir Semester</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-2">
                      <Label className="font-bold text-sm">Jumlah Opsi Pilihan Ganda</Label>
                      <Select onValueChange={(val) => form.setValue('optionsCount', val)} defaultValue="4 Opsi (A, B, C, D)">
                        <SelectTrigger className="h-10 md:h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 Opsi (A, B, C)">3 Opsi (A, B, C)</SelectItem>
                          <SelectItem value="4 Opsi (A, B, C, D)">4 Opsi (A, B, C, D)</SelectItem>
                          <SelectItem value="5 Opsi (A, B, C, D, E)">5 Opsi (A, B, C, D, E)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-3 md:space-y-4">
                      <Label className="font-bold text-sm">Level Kognitif Soal</Label>
                      <div className="grid grid-cols-2 gap-2 md:gap-3">
                         {cognitiveLevelOptions.map(opt => (
                           <div key={opt.id} className="flex items-center space-x-2">
                              <Checkbox 
                                id={opt.id} 
                                checked={form.watch('cognitiveLevels')?.includes(opt.id)}
                                onCheckedChange={(checked) => {
                                  const current = form.getValues('cognitiveLevels') || [];
                                  if (checked) form.setValue('cognitiveLevels', [...current, opt.id]);
                                  else form.setValue('cognitiveLevels', current.filter(c => c !== opt.id));
                                }}
                              />
                              <label htmlFor={opt.id} className="text-xs md:text-sm font-medium leading-none text-slate-700">
                                {opt.label}
                              </label>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4 bg-white p-4 md:p-6 rounded-xl md:rounded-2xl border border-slate-200">
                   <Label className="font-bold text-sm">Proporsi Kesulitan (%)</Label>
                   <div className="space-y-6 md:space-y-8 py-2 md:py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase text-emerald-600">
                          <span>Mudah</span>
                          <span>{form.watch('easyPerc') || 30}%</span>
                        </div>
                        <Input 
                           type="number"
                           className="h-10 md:h-11 border-slate-200 bg-white font-bold text-emerald-700"
                           {...form.register('easyPerc', { valueAsNumber: true })}
                           onChange={(e) => handleDifficultyChange('easy', parseInt(e.target.value) || 0)}
                           min={0} max={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase text-amber-600">
                          <span>Sedang</span>
                          <span>{form.watch('mediumPerc') || 50}%</span>
                        </div>
                        <Input 
                           type="number"
                           className="h-10 md:h-11 border-slate-200 bg-white font-bold text-amber-700"
                           {...form.register('mediumPerc', { valueAsNumber: true })}
                           onChange={(e) => handleDifficultyChange('medium', parseInt(e.target.value) || 0)}
                           min={0} max={100}
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-[10px] md:text-xs font-bold uppercase text-red-600">
                          <span>Sulit (HOTS)</span>
                          <span>{form.watch('hardPerc') || 20}%</span>
                        </div>
                        <Input 
                           type="number"
                           className="h-10 md:h-11 border-slate-200 bg-white font-bold text-red-700"
                           {...form.register('hardPerc', { valueAsNumber: true })}
                           onChange={(e) => handleDifficultyChange('hard', parseInt(e.target.value) || 0)}
                           min={0} max={100}
                        />
                      </div>
                      <div className={`pt-3 p-3 rounded-xl md:rounded-2xl text-center transition-all duration-300 ${isTotalCorrect ? "bg-emerald-500 text-white shadow-lg scale-[1.02]" : "bg-red-50 text-red-600 border border-red-100"}`}>
                         <span className="text-xs md:text-sm font-black flex items-center justify-center gap-2">
                           {isTotalCorrect ? (
                             <Zap className="w-3 h-3 md:w-4 md:h-4 fill-white animate-pulse" />
                           ) : (
                             <Info className="w-3 h-3 md:w-4 md:h-4" />
                           )}
                           TOTAL: {totalPerc}% {isTotalCorrect ? "✓" : `!`}
                         </span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <ListTodo className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <h3 className="font-bold text-base md:text-lg">Distribusi Tipe Soal</h3>
             </div>

             <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4">
                {[
                  { label: "PG BIASA", field: "mcqCount" as const, color: "blue" },
                  { label: "PG KOMPLEKS", field: "multiResponseCount" as const, color: "indigo" },
                  { label: "BENAR / SALAH", field: "trueFalseCount" as const, color: "emerald" },
                  { label: "ISIAN SINGKAT", field: "shortAnswerCount" as const, color: "amber" },
                  { label: "ESSAY / URAIAN", field: "essayCount" as const, color: "red" },
                  { label: "MENJODOHKAN", field: "matchTableCount" as const, color: "cyan" },
                ].map((item) => (
                  <div key={item.field} className={`p-3 md:p-4 rounded-xl md:rounded-2xl border bg-${item.color}-50 border-${item.color}-100 flex flex-col sm:flex-row items-center justify-between gap-2`}>
                     <div className="space-y-0.5 text-center sm:text-left">
                        <span className={`text-[10px] md:text-[11px] font-black uppercase text-${item.color}-700`}>{item.label}</span>
                        <p className="text-[8px] md:text-[10px] text-slate-400 hidden sm:block">Jumlah:</p>
                     </div>
                     <Input 
                       type="number" 
                       className="w-12 h-8 md:w-16 md:h-10 text-center font-bold text-sm md:text-base border-slate-200 bg-white" 
                       value={form.watch(item.field)}
                       onChange={(e) => form.setValue(item.field, parseInt(e.target.value) || 0)}
                     />
                  </div>
                ))}
             </div>
             <div className="bg-indigo-600 p-2 md:p-3 rounded-xl md:rounded-2xl text-center shadow-lg">
                <span className="text-white font-black text-sm md:text-base">Total Soal Di-generate: {
                 (form.watch('mcqCount') || 0) + 
                 (form.watch('multiResponseCount') || 0) + 
                 (form.watch('trueFalseCount') || 0) + 
                 (form.watch('shortAnswerCount') || 0) + 
                 (form.watch('essayCount') || 0) + 
                 (form.watch('matchTableCount') || 0)
                } Butir</span>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <ImageIcon className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                <h3 className="font-bold text-base md:text-lg">Instruksi Khusus</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                 <div className="space-y-3 md:space-y-4 p-4 border-2 border-dashed border-slate-200 rounded-2xl md:rounded-3xl">
                    <Label className="font-bold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Multimedia Soal</Label>
                    <div className="space-y-2 md:space-y-3">
                       <div className="flex items-center justify-between p-2 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="text-xs md:text-sm font-bold text-blue-800">Sisipkan Gambar</span>
                          <Input type="number" className="w-10 h-8 md:w-12 md:h-8 text-center text-xs" defaultValue={1} />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-pink-50 rounded-xl border border-pink-100">
                          <span className="text-xs md:text-sm font-bold text-pink-800">Grafik/Visual</span>
                          <Input type="number" className="w-10 h-8 md:w-12 md:h-8 text-center text-xs" defaultValue={0} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold text-sm">Catatan Tambahan</Label>
                    <Textarea placeholder="Contoh: Fokus pada studi kasus lokal..." className="h-24 md:h-full min-h-[100px] text-xs md:text-sm" {...form.register('specialInstructions')} />
                 </div>
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 md:h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm md:text-base rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 md:w-6 md:h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 md:w-6 md:h-6 fill-white" />
                GENERATE SEKARANG
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
