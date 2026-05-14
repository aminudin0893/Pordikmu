import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
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
  Trash2,
  Calendar,
  Layout
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
import { Switch } from './ui/switch';
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
  nip: z.string().optional(),
  principalName: z.string().min(1, "Nama Kepala Sekolah harus diisi"),
  principalNip: z.string().optional(),
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
  useLetterhead: z.boolean(),
  useValidationPage: z.boolean(),
});

type SoalFormData = z.infer<typeof soalSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
  onLoading?: (isLoading: boolean) => void;
}

export default function GeneratorSoal({ onSuccess, onLoading }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const setCompLoading = (val: boolean) => {
    setLoading(val);
    onLoading?.(val);
  };

  const form = useForm<SoalFormData>({
    resolver: zodResolver(soalSchema),
    defaultValues: {
      name: "Aminudin, S.Pd",
      nip: "1640634",
      principalName: "Rachmawati Fitriyah, S.H,. S.Pd.",
      principalNip: "1640634",
      school: "SMP Muhammadiyah 1 Probolinggo",
      subject: "Pendidikan Agama Islam",
      phaseGrade: "Fase D (Kelas 7) SMP/MTs",
      schoolYear: "2025/2026",
      assessmentType: "Asesmen Sumatif Akhir Semester",
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
      useLetterhead: true,
      useValidationPage: true,
    } as any
  });

  const handleDifficultyChange = (type: 'easy' | 'medium' | 'hard', newVal: number) => {
    const fieldMap = {
      easy: 'easyPerc',
      medium: 'mediumPerc',
      hard: 'hardPerc'
    } as const;
    
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

  const steps = [
    { title: "Identitas", icon: <Layout className="w-4 h-4" /> },
    { title: "Materi", icon: <Brain className="w-4 h-4" /> },
    { title: "Struktur", icon: <ListTodo className="w-4 h-4" /> },
    { title: "Finalisasi", icon: <Settings className="w-4 h-4" /> }
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ['name', 'school', 'subject', 'phaseGrade', 'schoolYear', 'assessmentType'];
    if (currentStep === 1) fieldsToValidate = ['topics', 'cognitiveLevels'];
    if (currentStep === 2) fieldsToValidate = ['easyPerc', 'mediumPerc', 'hardPerc', 'mcqCount', 'essayCount'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      if (currentStep === 2 && !isTotalCorrect) {
        toast.error("Total proporsi kesulitan harus 100%");
        return;
      }
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Mohon lengkapi data pada langkah ini.");
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const onSubmit = async (data: SoalFormData) => {
    setCompLoading(true);
    try {
      const totalSoal = data.mcqCount + data.multiResponseCount + data.trueFalseCount + data.shortAnswerCount + data.essayCount + data.matchTableCount;
      if (totalSoal === 0) {
        toast.error("Tentukan jumlah soal yang akan di-generate!");
        setCompLoading(false);
        return;
      }

      if (data.easyPerc + data.mediumPerc + data.hardPerc !== 100) {
        toast.error("Total proporsi kesulitan harus 100%");
        setCompLoading(false);
        return;
      }

      const prompt = `
        Ciptakan BANK SOAL UJIAN (NASKAH ASESMEN) yang sangat LENGKAP, PROFESIONAL, FORMAL, dan SIAP CETAK sesuai standar terbaru KEMENDIKBUDRISTEK (Kurikulum Merdeka).
        
        WAJIB GUNAKAN PENOMORAN ALFABET (A, B, C...) UNTUK SETIAP BAGIAN UTAMA DAN FORMAT TABEL MARKDOWN STANDAR.
        PENTING: DILARANG KERAS menggunakan tag HTML seperti <br>, <div>, atau <span>.
        TIDAK BOLEH ADA BAGIAN YANG KOSONG. Jika data spesifik tidak ada, gunakan pengetahuan pedagogik profesional untuk mengisinya secara relevan.

        STRUKTUR NASKAH ASESMEN RESMI (HARUS LENGKAP):

        1. KOP SURAT (Diletakkan di bagian atas):
           ${data.useLetterhead ? `
           # KOP SURAT RESMI SEKOLAH
           **DINAS PENDIDIKAN DAN KEBUDAYAAN**
           **${data.school.toUpperCase()}**
           *ALAMAT SEKOLAH / ALAMAT INSTANSI TERKAIT*
           ----------------------------------------------------------------------------------` : ""}

        ## A. Identitas Asesmen
        | Data Administrasi | Keterangan Informasi |
        |---|---|
        | Mata Pelajaran | ${data.subject.toUpperCase()} |
        | Jenis Asesmen | ${data.assessmentType.toUpperCase()} |
        | Jenjang / Fase / Kelas | ${data.phaseGrade} |
        | Semester | [Ganjil/Genap - Sesuaikan dengan waktu sekarang] |
        | Tahun Pelajaran | ${data.schoolYear} |
        | Nama Guru | ${data.name} |
        | Alokasi Waktu | [Isi alokasi waktu yang sesuai, misal: 90 Menit] |

        ## B. Data Peserta Didik
        | Nama Peserta Didik | Kelas | No. Absen | Nilai |
        |---|---|---|---|
        | ............................ | ${data.phaseGrade} | .......... | .......... |

        ## C. Petunjuk Pengerjaan
        1. Berdoalah sebelum mulai mengerjakan soal.
        2. Tulislah identitas Anda pada lembar yang disediakan.
        3. Bacalah setiap butir soal dengan teliti dan cermat.
        4. Dahulukan menjawab soal-soal yang Anda anggap mudah.
        5. Periksa kembali pekerjaan Anda sebelum dikumpulkan.

        ## D. Naskah Asesmen (Butir Soal)
        Sajikan soal dengan stimulus (teks/gambar/grafik/studi kasus) yang kontekstual dan berorientasi HOTS (Higher Order Thinking Skills).
        
        WAJIB FORMAT PILIHAN GANDA:
        Tuliskan opsi jawaban (A, B, C, D, E) secara BERDERET KE BAWAH (Daftar Menurun), bukan ke samping.
        Contoh:
        1. Apa yang dimaksud dengan ...?
           A. Jawaban satu
           B. Jawaban dua
           C. Jawaban tiga
           D. Jawaban empat
           E. Jawaban lima

        JENIS SOAL YANG HARUS DIBUAT:
        ${data.mcqCount > 0 ? `- **Pilihan Ganda** (Jumlah: ${data.mcqCount} soal dengan ${data.optionsCount}). Opsi harus vertikal ke bawah.` : ""}
        ${data.multiResponseCount > 0 ? `- **PG Kompleks / Multi-Response** (Jumlah: ${data.multiResponseCount} soal). Di mana jawaban benar lebih dari satu.` : ""}
        ${data.trueFalseCount > 0 ? `- **Benar / Salah** (Jumlah: ${data.trueFalseCount} soal).` : ""}
        ${data.matchTableCount > 0 ? `- **Menjodohkan** (Jumlah: ${data.matchTableCount} soal).` : ""}
        ${data.shortAnswerCount > 0 ? `- **Isian Singkat** (Jumlah: ${data.shortAnswerCount} soal).` : ""}
        ${data.essayCount > 0 ? `- **Uraian / Essay** (Jumlah: ${data.essayCount} soal).` : ""}

        ## E. Kisi-Kisi & Kunci Jawaban (Sangat Lengkap)
        | No | Materi | Indikator Soal | Level Kognitif | Kunci Jawaban / Pedoman Skor |
        |---|---|---|---|---|
        | 1 | ... | ... | ... | ... |

        ${data.useValidationPage ? `
        ---
        ## Lembar Pengesahan
        | Mengetahui, Kepala Sekolah | Guru Mata Pelajaran |
        |---|---|
        | | |
        | | |
        | **(${data.principalName})** | **(${data.name})** |
        | NIP/NBM. ${data.principalNip || "......................."} | NBM. ${data.nip || "......................."} |
        ` : ""}

        Catatan/Instruksi Khusus: ${data.specialInstructions || "Tidak ada."}

        INSTRUKSI TEKNIS:
        - Bahasa Indonesia Baku, Formal, dan Akademik.
        - Pastikan seluruh butir soal terisi lengkap sesuai jumlah yang diminta.
        - Dokumen harus terlihat sangat rapi dan siap cetak segera.
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'soal' });
      toast.success("Soal ujian berhasil di-generate!");
    } catch (error: any) {
      toast.error(error.message || "Gagal membuat soal");
    } finally {
      setCompLoading(false);
    }
  };

  const cognitiveLevelOptions = [
    { id: 'C1', label: 'C1' },
    { id: 'C2', label: 'C2' },
    { id: 'C3', label: 'C3' },
    { id: 'C4', label: 'C4 (HOTS)' },
    { id: 'C5', label: 'C5 (HOTS)' },
    { id: 'C6', label: 'C6 (HOTS)' },
  ];

  return (
    <Card className="border-none shadow-2xl shadow-indigo-100 bg-white overflow-hidden rounded-t-none md:rounded-t-3xl">
      <CardHeader className="bg-orange-600 text-white p-6 md:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <GraduationCap className="w-8 h-8 md:w-10 md:h-10" />
          <div>
            <CardTitle className="text-xl md:text-2xl font-black leading-tight">BANK SOAL UJIAN AI</CardTitle>
            <CardDescription className="text-orange-100 font-medium text-xs md:text-sm">Bank soal HOTS yang terstruktur dan rapi.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        {/* Progress Tracker */}
        <div className="mb-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-orange-600 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= idx 
                    ? 'bg-orange-600 border-orange-600 text-white shadow-lg shadow-orange-200' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > idx ? <Rocket className="w-4 h-4 md:w-5 md:h-5 text-white" /> : step.icon}
                </div>
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  currentStep >= idx ? 'text-orange-600' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 md:space-y-10">
          
          {/* STEP 1: IDENTITAS */}
          {currentStep === 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between col-span-full">
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3 md:w-4 md:h-4 text-orange-600" />
                      <span className="font-bold text-[10px] md:text-xs uppercase tracking-wider text-slate-500">Pengaturan Dokumen</span>
                    </div>
                </div>
                
                <div className="flex items-center justify-between p-3 md:p-4 bg-white rounded-xl border border-slate-200">
                    <div className="space-y-0.5">
                      <Label className="text-xs md:text-sm font-bold">Kop Surat (Opsional)</Label>
                      <p className="text-[10px] md:text-xs text-slate-500">Gunakan format kop instansi resmi.</p>
                    </div>
                    <Switch 
                      checked={form.watch('useLetterhead')} 
                      onCheckedChange={(val: boolean) => form.setValue('useLetterhead', val)} 
                    />
                </div>

                <div className="flex items-center justify-between p-3 md:p-4 bg-white rounded-xl border border-slate-200">
                    <div className="space-y-0.5">
                      <Label className="text-xs md:text-sm font-bold">Lembar Pengesahan</Label>
                      <p className="text-[10px] md:text-xs text-slate-500">Tambahkan tanda tangan kepala sekolah.</p>
                    </div>
                    <Switch 
                      checked={form.watch('useValidationPage')} 
                      onCheckedChange={(val: boolean) => form.setValue('useValidationPage', val)} 
                    />
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                  <Layout className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <h3 className="font-bold text-base md:text-lg italic">Identitas Asesmen & Satuan Pendidikan</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-2 col-span-full">
                    <Label htmlFor="school" className="font-bold text-sm">Nama Sekolah</Label>
                    <Input id="school" placeholder="Nama Sekolah..." {...form.register('school')} className="h-10 md:h-12" />
                    {form.formState.errors.school && <p className="text-xs text-red-500">{form.formState.errors.school.message}</p>}
                  </div>

                  <div className="space-y-4 col-span-full pt-2 border-t border-slate-100">
                      <Label className="text-xs font-black uppercase text-orange-500 tracking-wider">Identitas Guru</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="name" className="font-bold text-sm">Nama Lengkap Guru</Label>
                          <Input id="name" placeholder="Aminudin, S.Pd" {...form.register('name')} className="h-10 md:h-12" />
                          {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="nip" className="font-bold text-sm">NBM / NIP Guru</Label>
                          <Input id="nip" placeholder="Contoh: 1640634" {...form.register('nip')} className="h-10 md:h-12" />
                        </div>
                      </div>
                  </div>

                  <div className="space-y-4 col-span-full pt-2 border-t border-slate-100">
                      <Label className="text-xs font-black uppercase text-orange-500 tracking-wider">Identitas Kepala Sekolah</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="principalName" className="font-bold text-sm">Nama Kepala Sekolah</Label>
                          <Input id="principalName" placeholder="Contoh: Rachmawati Fitriyah, S.H,. S.Pd." {...form.register('principalName')} className="h-10 md:h-12" />
                          {form.formState.errors.principalName && <p className="text-xs text-red-500">{form.formState.errors.principalName.message}</p>}
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="principalNip" className="font-bold text-sm">NBM / NIP Kepala Sekolah</Label>
                          <Input id="principalNip" placeholder="Contoh: 1640634" {...form.register('principalNip')} className="h-10 md:h-12" />
                        </div>
                      </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject" className="font-bold text-sm">Mata Pelajaran</Label>
                    <Input id="subject" placeholder="Bahasa Indonesia" {...form.register('subject')} className="h-10 md:h-12" />
                    {form.formState.errors.subject && <p className="text-xs text-red-500">{form.formState.errors.subject.message}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">Fase / Kelas</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select onValueChange={(val: string) => {
                        if (val !== "manual") form.setValue('phaseGrade', val);
                      }}>
                        <SelectTrigger className="w-full sm:w-[155px] h-10 md:h-12">
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
              </div>
            </motion.div>
          )}

          {/* STEP 2: MATERI */}
          {currentStep === 1 && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                  <Brain className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <h3 className="font-bold text-base md:text-lg italic">Cakupan Materi & Kompetensi</h3>
              </div>

              <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-sm italic text-slate-600">Topik Utama Pembahasan Ujian</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 border-orange-100 text-orange-600">
                      <Plus className="w-4 h-4" /> Tambah Topik
                    </Button>
                  </div>
                  <div className="space-y-2 bg-orange-50/30 p-4 rounded-2xl border border-orange-100/50">
                    {topics.map((t, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          placeholder={`Misal: Struktur & Kebahasaan Teks Prosedur`} 
                          value={t} 
                          onChange={(e) => updateTopic(idx, e.target.value)}
                          className="h-10 md:h-11 bg-white border-orange-100"
                        />
                        {topics.length > 1 && (
                          <Button type="button" variant="ghost" size="icon" onClick={() => removeTopic(idx)} className="text-red-400 h-10 w-10 md:h-11 md:w-11">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                  {form.formState.errors.topics && <p className="text-xs text-red-500">{form.formState.errors.topics.message}</p>}
                </div>

                <div className="space-y-4 pt-4">
                  <Label className="font-bold text-sm text-slate-600">Level Kognitif Yang Diujikan</Label>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                      {cognitiveLevelOptions.map(opt => (
                        <div key={opt.id} 
                          onClick={() => {
                            const current = form.getValues('cognitiveLevels') || [];
                            if (current.includes(opt.id)) form.setValue('cognitiveLevels', current.filter(c => c !== opt.id));
                            else form.setValue('cognitiveLevels', [...current, opt.id]);
                          }}
                          className={`cursor-pointer p-3 rounded-xl border-2 text-center transition-all ${
                            form.watch('cognitiveLevels')?.includes(opt.id)
                              ? 'bg-orange-600 border-orange-600 text-white shadow-md'
                              : 'bg-white border-slate-100 text-slate-500 hover:border-orange-200'
                          }`}
                        >
                          <span className="text-xs font-black">{opt.id}</span>
                        </div>
                      ))}
                  </div>
                  {form.formState.errors.cognitiveLevels && <p className="text-xs text-red-500">{form.formState.errors.cognitiveLevels.message}</p>}
                </div>
            </motion.div>
          )}

          {/* STEP 3: STRUKTUR */}
          {currentStep === 2 && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="space-y-6 md:space-y-8"
            >
              <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                  <ListTodo className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <h3 className="font-bold text-base md:text-lg">Konfigurasi Butir Soal & Proporsi</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <Label className="font-bold text-sm text-slate-600">Distribusi Jumlah Soal</Label>
                    <div className="grid grid-cols-2 gap-3">
                        {[
                          { label: "PG Biasa", field: "mcqCount" as const },
                          { label: "PG Kompleks", field: "multiResponseCount" as const },
                          { label: "Benar/Salah", field: "trueFalseCount" as const },
                          { label: "Isian", field: "shortAnswerCount" as const },
                          { label: "Essay", field: "essayCount" as const },
                          { label: "Menjodohkan", field: "matchTableCount" as const },
                        ].map((item) => (
                          <div key={item.field} className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between">
                             <span className="text-[10px] font-black uppercase text-slate-600">{item.label}</span>
                             <Input 
                               type="number" 
                               className="w-12 h-8 text-center font-bold bg-white" 
                               min={0}
                               value={form.watch(item.field)}
                               onChange={(e) => form.setValue(item.field, parseInt(e.target.value) || 0)}
                             />
                          </div>
                        ))}
                    </div>
                    <div className="bg-orange-600 p-3 rounded-xl text-center shadow-lg">
                        <span className="text-white font-black text-sm">TOTAL: {
                          (form.watch('mcqCount') || 0) + (form.watch('multiResponseCount') || 0) + 
                          (form.watch('trueFalseCount') || 0) + (form.watch('shortAnswerCount') || 0) + 
                          (form.watch('essayCount') || 0) + (form.watch('matchTableCount') || 0)
                        } BUTIR SOAL</span>
                    </div>
                  </div>

                  <div className="space-y-4 p-5 bg-white rounded-2xl border-2 border-orange-100 shadow-sm">
                    <Label className="font-bold text-sm text-orange-700">Proporsi Kesulitan (%)</Label>
                    <div className="space-y-5">
                       <div className="space-y-1.5 text-emerald-600">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>Muda</span>
                            <span>{form.watch('easyPerc')}%</span>
                          </div>
                          <Input type="number" className="h-10 border-emerald-100 bg-emerald-50/30 font-bold" {...form.register('easyPerc', { valueAsNumber: true })} onChange={(e) => handleDifficultyChange('easy', parseInt(e.target.value) || 0)} />
                       </div>
                       <div className="space-y-1.5 text-amber-600">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>Sedang</span>
                            <span>{form.watch('mediumPerc')}%</span>
                          </div>
                          <Input type="number" className="h-10 border-amber-100 bg-amber-50/30 font-bold" {...form.register('mediumPerc', { valueAsNumber: true })} onChange={(e) => handleDifficultyChange('medium', parseInt(e.target.value) || 0)} />
                       </div>
                       <div className="space-y-1.5 text-red-600">
                          <div className="flex justify-between text-[10px] font-black uppercase">
                            <span>Sulit / HOTS</span>
                            <span>{form.watch('hardPerc')}%</span>
                          </div>
                          <Input type="number" className="h-10 border-red-100 bg-red-50/30 font-bold" {...form.register('hardPerc', { valueAsNumber: true })} onChange={(e) => handleDifficultyChange('hard', parseInt(e.target.value) || 0)} />
                       </div>
                       <div className={`p-2 rounded-lg text-center font-black text-xs ${isTotalCorrect ? "bg-emerald-500 text-white" : "bg-red-50 text-red-600"}`}>
                          TOTAL: {totalPerc}% {isTotalCorrect ? "✓" : "!"}
                       </div>
                    </div>
                  </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: FINALISASI */}
          {currentStep === 3 && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                  <Settings className="w-4 h-4 md:w-5 md:h-5 text-orange-600" />
                  <h3 className="font-bold text-base md:text-lg italic">Finalisasi & Petunjuk Khusus</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="font-bold text-sm">Jumlah Opsi (Pilihan Ganda)</Label>
                        <Select onValueChange={(val) => form.setValue('optionsCount', val)} defaultValue="4 Opsi (A, B, C, D)">
                          <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="4 Opsi (A, B, C, D)">4 Opsi (A, B, C, D)</SelectItem>
                            <SelectItem value="5 Opsi (A, B, C, D, E)">5 Opsi (A, B, C, D, E)</SelectItem>
                          </SelectContent>
                        </Select>
                    </div>
                    <div className="p-4 bg-orange-50 border border-orange-100 rounded-2xl flex gap-3">
                         <Info className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                         <p className="text-xs text-orange-800 leading-relaxed font-medium">AI akan menyusun naskah ujian lengkap dengan Kop Surat, Identitas Peserta, Kisi-kisi, Kunci Jawaban, serta Rubrik Penilaian.</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="font-bold text-sm">Catatan / Instruksi Khusus (Optional)</Label>
                    <Textarea 
                       placeholder="Misal: Sertakan minimal 2 soal tentang studi kasus lingkungan..." 
                       className="min-h-[150px] p-4 rounded-2xl bg-slate-50 border-slate-100 resize-none text-sm" 
                       {...form.register('specialInstructions')} 
                    />
                  </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t border-slate-100">
            {currentStep > 0 && (
              <Button type="button" variant="outline" onClick={prevStep} className="flex-1 h-12 md:h-14 font-bold border-slate-200 text-slate-500 rounded-xl md:rounded-2xl" disabled={loading}>
                Kembali
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button type="button" onClick={nextStep} className="flex-[2] h-12 md:h-14 bg-orange-600 hover:bg-orange-700 text-white font-black rounded-xl md:rounded-2xl shadow-lg shadow-orange-100">
                Lanjutkan
              </Button>
            ) : (
              <Button type="submit" className="flex-[2] h-12 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-100" disabled={loading}>
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyusun...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    GENERATE BANK SOAL
                  </div>
                )}
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
