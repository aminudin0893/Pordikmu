import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'motion/react';
import { 
  FileText, 
  Rocket, 
  Layout, 
  Info,
  Calendar,
  Layers,
  Settings,
  Plus,
  Trash2
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Switch } from './ui/switch';
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

const rppSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  nip: z.string().optional(),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  semester: z.string().min(1, "Semester harus diisi"),
  topics: z.array(z.string()).min(1, "Minimal satu topik materi harus diisi"),
  learningModel: z.string().min(1, "Model Pembelajaran harus diisi"),
  timeAllocation: z.string().min(1, "Alokasi Waktu harus diisi"),
  meetingsCount: z.string().min(1, "Jumlah Pertemuan harus diisi"),
  schoolYear: z.string().min(1, "Tahun Pelajaran harus diisi"),
  additionalNotes: z.string().optional(),
  useLetterhead: z.boolean(),
  useValidationPage: z.boolean(),
});

type RPPFormData = z.infer<typeof rppSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
  onLoading?: (isLoading: boolean) => void;
}

export default function GeneratorRPP({ onSuccess, onLoading }: Props) {
  const [loading, setLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const setCompLoading = (val: boolean) => {
    setLoading(val);
    onLoading?.(val);
  };

  const form = useForm<RPPFormData>({
    resolver: zodResolver(rppSchema),
    defaultValues: {
      name: "",
      nip: "",
      school: "",
      subject: "",
      phaseGrade: "",
      topics: [""],
      timeAllocation: "",
      useLetterhead: false,
      useValidationPage: false,
      schoolYear: "2025/2026",
      semester: "Ganjil",
      learningModel: "Discovery Learning",
      meetingsCount: "1 Pertemuan"
    } as any
  });

  const [topics, setTopics] = useState([""]);

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
    { title: "Akademik", icon: <Layers className="w-4 h-4" /> },
    { title: "Materi", icon: <Plus className="w-4 h-4" /> },
    { title: "Finalisasi", icon: <Settings className="w-4 h-4" /> }
  ];

  const nextStep = async () => {
    let fieldsToValidate: any[] = [];
    if (currentStep === 0) fieldsToValidate = ['name', 'school', 'schoolYear'];
    if (currentStep === 1) fieldsToValidate = ['subject', 'phaseGrade', 'semester', 'timeAllocation', 'learningModel'];
    if (currentStep === 2) fieldsToValidate = ['topics'];

    const isValid = await form.trigger(fieldsToValidate);
    if (isValid) {
      setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
    } else {
      toast.error("Mohon lengkapi data pada langkah ini.");
    }
  };

  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 0));

  const onSubmit = async (data: RPPFormData) => {
    setCompLoading(true);
    try {
      const prompt = `
        Buatkan (RPP) atau MODUL AJAR yang sangat PROFESIONAL, FORMAL, dan SIAP CETAK sesuai standar terbaru KEMENDIKBUDRISTEK (Kurikulum Merdeka / Kurikulum Merdeka Belajar).
        
        WAJIB IKUTI STRUKTUR MODUL AJAR RESMI (GUNAKAN FORMAT TABEL MARKDOWN STANDAR):
        Contoh Format Tabel:
        | Header 1 | Header 2 |
        |---|---|
        | Data 1 | Data 2 |

        ${data.useLetterhead ? `
        # KOP SURAT RESMI SEKOLAH
        **DINAS PENDIDIKAN DAN KEBUDAYAAN**
        **${data.school.toUpperCase()}**
        *Alamat: [Masukkan Alamat Sekolah] | Email: [Email Sekolah]*
        ---` : ""}

        1. INFORMASI UMUM (WAJIB TABEL):
           | Komponen | Detail Informasi |
           |----------|------------------|
           | Nama Penyusun | ${data.name} |
           | NIP | ${data.nip || "-"} |
           | Nama Sekolah | ${data.school} |
           | Tahun Pelajaran | ${data.schoolYear} |
           | Jenjang / Kelas | ${data.phaseGrade} |
           | Mata Pelajaran | ${data.subject} |
           | Alokasi Waktu | ${data.timeAllocation} |
           | Target Peserta Didik | Reguler / Tipikal |
           | Model Pembelajaran | ${data.learningModel} |
           | Sarana & Prasarana | [Identifikasi sarana pendukung] |

        2. KOMPONEN INTI (WAJIB TABEL):
           | Aspek | Deskripsi / Uraian |
           |---|---|
           | **Tujuan Pembelajaran** | Jabarkan berdasarkan CP (Capaian Pembelajaran) |
           | **Pemahaman Bermakna** | Manfaat materi dalam kehidupan nyata |
           | **Pertanyaan Pemantik** | Pertanyaan untuk memicu kognitif siswa |
           | **Profil Pelajar Pancasila** | Beriman, Bertakwa, Mandiri, Bernalar Kritis, Kreatif, Bergotong Royong, Berkebinekaan Global (Pilih yang relevan) |

        3. LANGKAH-LANGKAH PEMBELAJARAN (TABEL):
           Buat alur pembelajaran (Skenario) yang detail:
           | Tahapan | Uraian Kegiatan Pembelajaran (Integrasi 4C: Collaboration, Communication, Critical Thinking, Creativity) | Alokasi Waktu |
           |---|---|---|
           | **Pendahuluan** | 1. Orientasi (Salam, Doa, Presensi)<br>2. Apersepsi (Kaitan materi sebelumnya)<br>3. Motivasi & Tujuan | ... Menit |
           | **Kegiatan Inti** | Implementasi Model **${data.learningModel}**: <br> [Langkah-langkah detail sesuai sintaks model pembelajaran tersebut] | ... Menit |
           | **Penutup** | 1. Refleksi Peserta Didik & Guru<br>2. Simpulan<br>3. Evaluasi/Post-test<br>4. Doa & Salam | ... Menit |

        4. ASESMEN & EVALUASI (TABEL):
           | Bentuk Asesmen | Teknik | Instrumen |
           |---|---|---|
           | Asesmen Diagnostik | Kognitif/Non-Kognitif | Tes Lisan / Angket |
           | Asesmen Formatif | Observasi / Performa | Lembar Pengamatan / Checklist |
           | Asesmen Sumatif | Tes Tertulis | Pilihan Ganda / Uraian |

        5. LAMPIRAN (FORMAT RESMI):
           - **LKPD (Lembar Kerja Peserta Didik)**: Berikan instruksi kerja siswa yang sistematis.
           - **Bahan Bacaan Guru & Siswa**: Ringkasan materi yang mendalam.
           - **Glosarium**: Daftar istilah penting.
           - **Daftar Pustaka**: Referensi Buku/Jurnal.

        ${data.useValidationPage ? `
        ---
        **PENGESAHAN DOKUMEN**
        | Mengetahui, Kepala Sekolah | Guru Mata Pelajaran |
        |:---:|:---:|
        | <br><br><br> | <br><br><br> |
        | **(..........................)** | **(${data.name})** |
        | NIP. ....................... | ${data.nip ? `NIP. ${data.nip}` : "NIP. ......................."} |
        ` : ""}

        INSTRUKSI TEKNIS:
        - Gunakan Bahasa Indonesia Baku & Formal (Pedoman Ejaan Bahasa Indonesia).
        - Pastikan Header Tabel menggunakan Bold dan Background Shading (via Markdown syntax).
        - Dokumen harus terlihat sangat kredibel dan profesional sesuai standar kedinasan.
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'rpp' });
      toast.success("Modul Ajar berhasil disusun!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyusun modul ajar");
    } finally {
      setCompLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-indigo-100 bg-white overflow-hidden rounded-t-none md:rounded-t-3xl">
      <CardHeader className="bg-indigo-600 text-white p-6 md:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <FileText className="w-8 h-8 md:w-10 md:h-10" />
          <div>
            <CardTitle className="text-xl md:text-2xl font-black">Generator RPP / Modul Ajar</CardTitle>
            <CardDescription className="text-indigo-100 font-medium text-xs md:text-sm">Susun rencana pembelajaran profesional dalam hitungan detik.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        {/* Progress Tracker */}
        <div className="mb-10">
          <div className="flex justify-between items-center relative">
            <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />
            <div 
              className="absolute top-1/2 left-0 h-0.5 bg-indigo-600 -translate-y-1/2 z-0 transition-all duration-500" 
              style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
            />
            
            {steps.map((step, idx) => (
              <div key={idx} className="relative z-10 flex flex-col items-center gap-2">
                <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center transition-all duration-300 border-2 ${
                  currentStep >= idx 
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200' 
                    : 'bg-white border-slate-200 text-slate-400'
                }`}>
                  {currentStep > idx ? <Rocket className="w-4 h-4 md:w-5 md:h-5 text-white" /> : step.icon}
                </div>
                <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
                  currentStep >= idx ? 'text-indigo-600' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </div>
            ))}
          </div>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 md:space-y-8">
          
          {/* STEP 1: IDENTITAS */}
          {currentStep === 0 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 p-4 md:p-6 bg-slate-50 rounded-xl md:rounded-2xl border border-slate-100">
                <div className="flex items-center justify-between col-span-full">
                    <div className="flex items-center gap-2">
                      <Settings className="w-3 h-3 md:w-4 md:h-4 text-indigo-600" />
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

              <div className="space-y-4">
                <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                    <Layout className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                    <h3 className="font-bold text-base md:text-lg">Profil Pengajar & Sekolah</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                    <div className="space-y-1.5 md:space-y-2 col-span-full">
                      <Label htmlFor="school" className="font-bold text-sm">Nama Satuan Pendidikan (Sekolah)</Label>
                      <Input id="school" placeholder="Nama Sekolah" {...form.register('school')} className="h-10 md:h-12" />
                      {form.formState.errors.school && <p className="text-xs text-red-500">{form.formState.errors.school.message}</p>}
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="name" className="font-bold text-sm">Nama Lengkap Guru</Label>
                      <Input id="name" placeholder="Contoh: Hery Purwanto, S.Pd" {...form.register('name')} className="h-10 md:h-12" />
                      {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label htmlFor="nip" className="font-bold text-sm">NIP Guru (Opsional)</Label>
                      <Input id="nip" placeholder="Contoh: 19901031..." {...form.register('nip')} className="h-10 md:h-12" />
                    </div>
                    <div className="space-y-1.5 md:space-y-2">
                      <Label className="font-bold text-sm">Tahun Pelajaran</Label>
                      <Input placeholder="2025/2026" {...form.register('schoolYear')} className="h-10 md:h-12" />
                      {form.formState.errors.schoolYear && <p className="text-xs text-red-500">{form.formState.errors.schoolYear.message}</p>}
                    </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: AKADEMIK */}
          {currentStep === 1 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                  <Layers className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  <h3 className="font-bold text-base md:text-lg">Detail Akademik Kurikulum</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="subject" className="font-bold text-sm">Mata Pelajaran</Label>
                    <Input id="subject" placeholder="Bahasa Indonesia" {...form.register('subject')} className="h-10 md:h-12" />
                    {form.formState.errors.subject && <p className="text-xs text-red-500">{form.formState.errors.subject.message}</p>}
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="font-bold text-sm">Fase / Kelas</Label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <Select onValueChange={(val: string) => {
                        if (val !== "manual") form.setValue('phaseGrade', val);
                      }}>
                        <SelectTrigger className="w-full sm:w-[150px] h-10 md:h-12">
                          <SelectValue placeholder="Pilih..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Fase A ( Kelas 1-2) SD">Fase A (1-2)</SelectItem>
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
                    {form.formState.errors.phaseGrade && <p className="text-xs text-red-500">{form.formState.errors.phaseGrade.message}</p>}
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="font-bold text-sm">Semester</Label>
                    <Select onValueChange={(val: string) => form.setValue('semester', val)} defaultValue="Ganjil">
                      <SelectTrigger className="h-10 md:h-12">
                        <SelectValue placeholder="Pilih Semester" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ganjil">Ganjil</SelectItem>
                        <SelectItem value="Genap">Genap</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label className="font-bold text-sm">Model Pembelajaran</Label>
                    <Select onValueChange={(val: string) => form.setValue('learningModel', val)} defaultValue="Discovery Learning">
                      <SelectTrigger className="h-10 md:h-12">
                        <SelectValue placeholder="Pilih Model" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Discovery Learning">Discovery Learning</SelectItem>
                        <SelectItem value="Problem Based Learning">Problem Based Learning (PBL)</SelectItem>
                        <SelectItem value="Project Based Learning">Project Based Learning (PjBL)</SelectItem>
                        <SelectItem value="Inquiry Learning">Inquiry Learning</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 md:space-y-2">
                    <Label htmlFor="timeAllocation" className="font-bold text-sm">Alokasi Waktu</Label>
                    <Input id="timeAllocation" placeholder="2 x 40 Menit" {...form.register('timeAllocation')} className="h-10 md:h-12" />
                    {form.formState.errors.timeAllocation && <p className="text-xs text-red-500">{form.formState.errors.timeAllocation.message}</p>}
                  </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: TOPIK & MATERI */}
          {currentStep === 2 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                  <Plus className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  <h3 className="font-bold text-base md:text-lg">Substansi Materi & Bab</h3>
              </div>

              <div className="col-span-full space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="font-bold text-sm">Materi Pokok / Bab Pembahasan</Label>
                      <p className="text-xs text-slate-500">Anda dapat menambahkan beberapa topik sekaligus.</p>
                    </div>
                    <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-9 gap-2 px-4 border-indigo-100 text-indigo-600 hover:bg-indigo-50">
                      <Plus className="w-4 h-4" /> Tambah Topik
                    </Button>
                  </div>
                  <div className="space-y-3 bg-indigo-50/30 p-4 md:p-6 rounded-2xl border border-indigo-100/50">
                    {topics.map((t, idx) => (
                      <div key={idx} className="flex gap-2 group">
                        <div className="flex items-center justify-center w-10 md:w-11 h-10 md:h-11 bg-white border border-indigo-200 rounded-xl text-indigo-600 font-bold text-sm shadow-sm group-focus-within:bg-indigo-600 group-focus-within:text-white transition-colors">
                          {idx + 1}
                        </div>
                        <Input 
                          placeholder={`Misal: Struktur teks eksplanasi`} 
                          value={t} 
                          onChange={(e) => updateTopic(idx, e.target.value)}
                          className="h-10 md:h-11 bg-white border-indigo-100 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {topics.length > 1 && (
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => removeTopic(idx)} 
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 h-10 w-10 md:h-11 md:w-11 shrink-0"
                          >
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

          {/* STEP 4: FINALISASI */}
          {currentStep === 3 && (
            <motion.div 
              initial={{ opacity: 0, x: 20 }} 
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                  <Settings className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                  <h3 className="font-bold text-base md:text-lg">Finalisasi & Catatan</h3>
              </div>

              <div className="space-y-3">
                <Label htmlFor="notes" className="font-bold flex items-center gap-2 text-sm">
                    <Info className="w-3.5 h-3.5 text-indigo-600" /> Instruksi / Catatan Tambahan (Opsional)
                </Label>
                <div className="relative">
                  <Textarea 
                    id="notes" 
                    placeholder="Contoh: Fokus pada pemahaman 6C, integrasikan pembelajaran remedial untuk siswa lambat belalar, dll..." 
                    {...form.register('additionalNotes')} 
                    className="text-sm min-h-[180px] p-4 bg-slate-50 border-slate-200 focus:border-indigo-500 rounded-2xl resize-none" 
                  />
                  <div className="absolute bottom-3 right-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Optional Context</div>
                </div>
              </div>

              <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl flex gap-3">
                <div className="p-2 bg-amber-100 rounded-full h-fit">
                   <Info className="w-4 h-4 text-amber-700" />
                </div>
                <div className="space-y-1">
                   <p className="text-sm font-bold text-amber-800 tracking-tight">Siap Untuk Menyusun?</p>
                   <p className="text-xs text-amber-700/80 leading-relaxed">Pastikan semua data di atas sudah benar. AI akan menyusun dokumen resmi Modul Ajar Kurikulum Merdeka yang siap cetak untuk Anda.</p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-slate-100">
            {currentStep > 0 && (
              <Button 
                type="button" 
                variant="outline" 
                onClick={prevStep}
                className="flex-1 h-12 md:h-14 font-bold border-slate-200 text-slate-600 rounded-xl md:rounded-2xl"
                disabled={loading}
              >
                Kembali
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button 
                type="button" 
                onClick={nextStep}
                className="flex-[2] h-12 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl md:rounded-2xl shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]"
              >
                Lanjutkan
              </Button>
            ) : (
              <Button 
                type="submit" 
                className="flex-[2] h-12 md:h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98]"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Menyusun...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Rocket className="w-5 h-5" />
                    GENERATE MODUL AJAR
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
