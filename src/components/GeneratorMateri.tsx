import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { 
  BookOpen, 
  Rocket, 
  MapPin,
  Sparkles,
  Zap,
  Target,
  Plus,
  Trash2,
  Calendar,
  Layout,
  Settings,
  Info
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Checkbox } from './ui/checkbox';
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
import { Switch } from './ui/switch';

import { LogoUploader } from './LogoUploader';

const materiSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  nip: z.string().optional(),
  principalName: z.string().min(1, "Nama Kepala Sekolah harus diisi"),
  principalNip: z.string().optional(),
  school: z.string().min(1, "Sekolah harus diisi"),
  logo: z.string().optional(),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  topics: z.array(z.string()).min(1, "Minimal satu topik materi harus diisi"),
  depthLevel: z.enum(['basic', 'intermediate', 'advanced']),
  includeAnalogy: z.boolean(),
  includeIllustration: z.boolean(),
  includeQuiz: z.boolean(),
  targetFocus: z.string().optional(),
  useLetterhead: z.boolean(),
  useValidationPage: z.boolean(),
});

type MateriFormData = z.infer<typeof materiSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
  onLoading?: (isLoading: boolean) => void;
}

export default function GeneratorMateri({ onSuccess, onLoading }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [topics, setTopics] = useState([""]);

  const setCompLoading = (val: boolean) => {
    setLoading(val);
    onLoading?.(val);
  };

  const form = useForm<MateriFormData>({
    resolver: zodResolver(materiSchema),
    defaultValues: {
      name: "Aminudin, S.Pd",
      nip: "1640634",
      principalName: "Rachmawati Fitriyah, S.H,. S.Pd.",
      principalNip: "1640634",
      school: "SMP Muhammadiyah 1 Probolinggo",
      logo: "",
      subject: "Pendidikan Agama Islam",
      phaseGrade: "Fase D (Kelas 7) SMP/MTs",
      topics: [""],
      depthLevel: 'advanced',
      includeAnalogy: true,
      includeIllustration: true,
      includeQuiz: true,
      useLetterhead: true,
      useValidationPage: true,
    } as any
  });

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
    { title: "Materi", icon: <BookOpen className="w-4 h-4" /> },
    { title: "Konfigurasi", icon: <Settings className="w-4 h-4" /> }
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ['school', 'subject', 'phaseGrade'];
    if (currentStep === 1) fieldsToValidate = ['topics'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Mohon lengkapi data pada langkah ini.");
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const onSubmit = async (data: MateriFormData) => {
    setCompLoading(true);
    try {
      const prompt = `
        Susunlah MATERI AJAR (BAHAN AJAR) yang sangat EKSKLUSIF, MENDALAM, PROFESIONAL, dan SIAP CETAK sesuai standar Kurikulum Merdeka.
        
        ANDA ADALAH SEORANG PENULIS BUKU TEKS PENDIDIKAN PROFESIONAL KRITERIA NASIONAL DENGAN PENGALAMAN 20 TAHUN. TUGAS ANDA ADALAH:
        1. Menguraikan materi secara SANGAT KOMPREHENSIF (Deep Learning) dengan bahasa yang mudah dipahami namun berbobot ilmiah.
        2. Gunakan narasi yang inspiratif, padat informasi, dan mengalir secara logis antar sub-bab.
        3. Hubungkan setiap bab dengan konteks nyata, kearifan lokal, dan tantangan masa depan (Visi Masa Depan).
        4. Susun konten secara PADAT dan EFISIEN. Pastikan materi mengisi setiap halaman A4 secara optimal tanpa banyak ruang kosong, namun tetap menjaga kerapian desain dokumen.
        5. Sertakan Identitas Materi langsung setelah Kop Surat (jika ada).
        6. Hilangkan teks-teks administratif yang tidak perlu seperti "Sesuai Keputusan Menteri...". Fokus langsung pada konten teknis perangkat ajar.

        WAJIB GUNAKAN PENOMORAN ALFABET (A, B, C...) UNTUK SETIAP BAGIAN UTAMA DAN FORMAT TABEL MARKDOWN STANDAR.
        PENTING: DILARANG KERAS menggunakan tag HTML.

        STRUKTUR MODUL RESMI (HARUS SANGAT LENGKAP):

        ${data.useLetterhead ? `
        # KOP SURAT RESMI SEKOLAH
        **DINAS PENDIDIKAN DAN KEBUDAYAAN**
        **${data.school.toUpperCase()}**
        *Alamat: [Masukkan Alamat Sekolah] | Email: [Email Sekolah]*
        ---` : ""}

        # BAHAN AJAR DIGITAL ESENSIAL

        ## A. Pendahuluan & Identitas
        | Komponen Administrasi | Keterangan Informasi |
        |---|---|
        | Satuan Pendidikan | ${data.school} |
        | Mata Pelajaran | ${data.subject.toUpperCase()} |
        | Jenjang / Fase / Kelas | ${data.phaseGrade} |
        | Semester | [Ganjil/Genap - Sesuaikan] |
        | Disusun Oleh | ${data.name} |
        | Topik Utama | ${data.topics.join(", ")} |
        | Target Kedalaman | ${data.depthLevel.toUpperCase()} |

        ## B. Capaian & Tujuan Pembelajaran
        Deskripsikan secara rinci target kompetensi yang harus dikuasai peserta didik berdasarkan Capaian Pembelajaran (CP) dan Tujuan Pembelajaran (TP) yang terukur.

        ## C. Pembahasan Materi (Deep Learning Approach)
        Gunakan pendekatan High-Logic & Komprehensif:
        1. **Essential Questions**: Berikan minimal 3-5 pertanyaan pemantik yang merangsang kognitif tingkat tinggi.
        2. **Konsep Inti & Teori**: Jelaskan secara logis, sistematis, mendalam, dan komprehensif (minimal 5-8 paragraf detil per sub-topik). Sertakan data, fakta, atau teori pendukung yang relevan.
        ${data.includeAnalogy ? "3. **Analogi Dunia Nyata**: Berikan analogi yang kreatif dan kontekstual untuk memudahkan pemahaman konsep abstrak secara intuitif." : ""}
        ${data.includeIllustration ? "4. **Panduan Visual/Ilustrasi**: Deskripsikan secara detail (dalam teks) visual/gambar/infografis yang seharusnya ada untuk memperkuat pemahaman materi." : ""}

        ## D. Contoh Penerapan & Studi Kasus
        Sajikan situasi nyata, dilema etis, atau masalah di masyarakat yang memerlukan penerapan konsep ini untuk diselesaikan (mengasah Critical Thinking).

        ## E. Rangkuman & Refleksi Mandiri
        | Intisari Materi (Rangkuman) | Pertanyaan Refleksi Peserta Didik |
        |---|---|
        | [Jabarkan minimal 5-7 poin penting materi] | [Minimal 3-5 pertanyaan kontemplatif untuk mengukur kedalaman pemahaman] |

        ${data.includeQuiz ? "## F. Uji Pemahaman (Format HOTS)\nBerikan 5 soal pilihan ganda (dengan opsi A-E berderet ke bawah) atau 3 soal esai analisis dengan tingkat kesulitan C4-C6." : ""}

        ---
        ## Lembar Pengesahan
        | Mengetahui, Kepala Sekolah | Penulis / Guru Mata Pelajaran |
        |---|---|
        | | |
        | | |
        | **(${data.principalName})** | **(${data.name})** |
        | NIP/NBM. ${data.principalNip || "......................."} | NBM. ${data.nip || "......................."} |

        Instruksi Tambahan: ${data.targetFocus || "Tidak ada."}

        INSTRUKSI TEKNIS:
        - Bahasa Indonesia Formal, Akademik, dan Inspiratif.
        - Dokumen harus terlihat sangat berbobot dan siap digunakan sebagai referensi utama di kelas.
        - Narasi harus mengalir lancar dari satu sub-bab ke sub-bab berikutnya.
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'materi' });
      toast.success("Materi ajar berhasil disusun!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyusun materi");
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-emerald-100 bg-white overflow-hidden rounded-t-none md:rounded-t-3xl">
      <CardHeader className="bg-emerald-600 text-white p-6 md:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
          <div>
            <CardTitle className="text-xl md:text-2xl font-black">MATERI AJAR DIGITAL AI</CardTitle>
            <CardDescription className="text-emerald-100 font-medium text-xs md:text-sm">Ubah topik sulit menjadi penjelasan yang mudah dipahami.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        {/* Progress Tracker */}
        <div className="mb-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-emerald-600 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= idx 
                    ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-200' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > idx ? <Rocket className="w-4 h-4 md:w-5 md:h-5 text-white" /> : step.icon}
                </div>
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  currentStep >= idx ? 'text-emerald-600' : 'text-slate-400'
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
                      <Settings className="w-3 h-3 md:w-4 md:h-4 text-emerald-600" />
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
                      <Label className="text-xs md:text-sm font-bold">Pengesahan</Label>
                      <p className="text-[10px] md:text-xs text-slate-500">Tambahkan tanda tangan kurikulum/kepsek.</p>
                    </div>
                    <Switch 
                      checked={form.watch('useValidationPage')} 
                      onCheckedChange={(val: boolean) => form.setValue('useValidationPage', val)} 
                    />
                </div>
              </div>

              <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                  <Layout className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  <h3 className="font-bold text-base md:text-lg italic text-slate-700">Satuan Pendidikan & Kurikulum</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-4 col-span-full">
                  <LogoUploader 
                    value={form.watch('logo')} 
                    onChange={(val: string) => form.setValue('logo', val)} 
                  />
                </div>

                <div className="space-y-1.5 md:space-y-2 col-span-full">
                    <Label className="font-bold text-sm">Nama Satuan Pendidikan (Sekolah)</Label>
                    <Input placeholder="Misal: SMP Negeri 1 Jakarta" {...form.register('school')} className="h-10 md:h-12" />
                    {form.formState.errors.school && <p className="text-xs text-red-500">{form.formState.errors.school.message}</p>}
                </div>

                <div className="space-y-4 col-span-full pt-2 border-t border-slate-100">
                    <Label className="text-xs font-black uppercase text-emerald-500 tracking-wider">Identitas Penulis</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="name" className="font-bold text-sm">Nama Lengkap Penulis</Label>
                        <Input id="name" placeholder="Aminudin, S.Pd" {...form.register('name')} className="h-10 md:h-12" />
                        {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="nip" className="font-bold text-sm">NBM / NIP Penulis</Label>
                        <Input id="nip" placeholder="Contoh: 1640634" {...form.register('nip')} className="h-10 md:h-12" />
                      </div>
                    </div>
                </div>

                <div className="space-y-4 col-span-full pt-2 border-t border-slate-100">
                    <Label className="text-xs font-black uppercase text-emerald-500 tracking-wider">Identitas Kepala Sekolah</Label>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="principalName" className="font-bold text-sm">Nama Kepala Sekolah</Label>
                        <Input id="principalName" placeholder="Contoh: Rachmawati Fitriyah, S.H,. S.Pd." {...form.register('principalName')} className="h-10 md:h-12" />
                        {form.formState.errors.principalName && <p className="text-xs text-red-500">{form.formState.errors.principalName.message}</p>}
                      </div>
                      <div className="space-y-1.5 md:space-y-2">
                        <Label htmlFor="principalNip" className="font-bold text-sm">NBM / NIP Kepala Sekolah</Label>
                        <Input id="principalNip" placeholder="Contoh: 1640634" {...form.register('principalNip')} className="h-10 md:h-12" />
                      </div>
                    </div>
                </div>

                <div className="space-y-1.5 md:space-y-2">
                    <Label className="font-bold text-sm">Mata Pelajaran</Label>
                    <Input placeholder="IPA / Biologi / Sejarah" {...form.register('subject')} className="h-10 md:h-12" />
                    {form.formState.errors.subject && <p className="text-xs text-red-500">{form.formState.errors.subject.message}</p>}
                </div>
                <div className="space-y-1.5 md:space-y-2">
                    <Label className="font-bold text-sm">Fase / Kelas</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select onValueChange={(val: string) => {
                        if (val !== "manual") form.setValue('phaseGrade', val);
                      }}>
                        <SelectTrigger className="w-full sm:w-[150px] h-10 md:h-12 border-slate-200 bg-slate-50/50">
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
              </div>
            </motion.div>
          )}

          {/* STEP 2: MATERI */}
          {currentStep === 1 && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                  <BookOpen className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  <h3 className="font-bold text-base md:text-lg italic text-slate-700">Cakupan Materi / Bahasan</h3>
              </div>

               <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="font-bold text-sm text-slate-600">Topik Utama atau Judul Bab</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 border-emerald-100 text-emerald-600">
                      <Plus className="w-4 h-4" /> Tambah Sub-Topik
                    </Button>
                  </div>
                  <div className="space-y-2 bg-emerald-50/30 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-emerald-100/50">
                    {topics.map((t, idx) => (
                      <div key={idx} className="flex gap-2">
                        <Input 
                          placeholder={`Misal: Metabolisme & Enzim`} 
                          value={t} 
                          onChange={(e) => updateTopic(idx, e.target.value)}
                          className="h-10 md:h-11 bg-white border-emerald-200"
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
            </motion.div>
          )}

          {/* STEP 3: KONFIGURASI */}
          {currentStep === 2 && (
            <motion.div 
               initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
               className="space-y-6 md:space-y-8"
            >
              <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                  <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                  <h3 className="font-bold text-base md:text-lg italic text-slate-700">Gaya Penulisan & Kedalaman Analisis</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <Label className="font-bold text-sm text-slate-600">Kedalaman Materi</Label>
                      <Select onValueChange={(val: any) => form.setValue('depthLevel', val)} defaultValue="intermediate">
                        <SelectTrigger className="h-11 md:h-12 border-slate-200">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="basic">Dasar (Perkenalan Konsep)</SelectItem>
                            <SelectItem value="intermediate">Menengah (Komprehensif & Struktural)</SelectItem>
                            <SelectItem value="advanced">Lanjut (Kritis, Analisis & HOTS)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="font-bold text-sm text-slate-600">Pendukung Pembelajaran</Label>
                      <div className="grid grid-cols-1 gap-2">
                          {[
                            { id: 'includeAnalogy', label: 'Sertakan Analogi Kontekstual', icon: <Zap className="w-3.5 h-3.5" /> },
                            { id: 'includeIllustration', label: 'Sertakan Deskripsi Ilustrasi', icon: <Info className="w-3.5 h-3.5" /> },
                            { id: 'includeQuiz', label: 'Sertakan Kuis Mini di Akhir', icon: <Sparkles className="w-3.5 h-3.5" /> },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center space-x-3 p-3 rounded-xl border border-emerald-50 bg-emerald-50/20">
                              <Checkbox 
                                id={item.id} 
                                checked={form.watch(item.id as any)} 
                                onCheckedChange={(val) => form.setValue(item.id as any, !!val)} 
                              />
                              <label htmlFor={item.id} className="text-xs md:text-sm font-bold text-emerald-900 flex items-center gap-2">
                                {item.icon} {item.label}
                              </label>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="font-bold text-sm flex items-center gap-2 text-slate-600">
                        <Target className="w-4 h-4 text-emerald-600" /> Fokus / Instruksi Tambahan
                    </Label>
                    <Textarea 
                       placeholder="Contoh: Tekankan pada perbedaan struktur sel hewan dan tumbuhan..." 
                       className="min-h-[200px] p-4 rounded-2xl md:rounded-3xl border-slate-200 bg-slate-50 resize-none text-sm" 
                       {...form.register('targetFocus')} 
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
              <Button type="button" onClick={nextStep} className="flex-[2] h-12 md:h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl md:rounded-2xl shadow-lg shadow-emerald-100">
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
                    SUSUN MATERI AJAR
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
