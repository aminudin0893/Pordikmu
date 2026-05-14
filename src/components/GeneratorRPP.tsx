import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
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
}

export default function GeneratorRPP({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<RPPFormData>({
    resolver: zodResolver(rppSchema),
    defaultValues: {
      name: "",
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

  const onSubmit = async (data: RPPFormData) => {
    setLoading(true);
    try {
      const prompt = `
        Buatkan Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar yang sangat lengkap, mendalam (Deep Learning), dan profesional sesuai standar Kurikulum Merdeka untuk:
        
        IDENTITAS:
        - Nama Guru: ${data.name}
        - NIP: ${data.nip || "-"}
        - Sekolah: ${data.school}
        - Mata Pelajaran: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Semester: ${data.semester}
        - Materi Pokok (Topik): ${data.topics.join(", ")}
        - Alokasi Waktu: ${data.timeAllocation}
        - Model Pembelajaran: ${data.learningModel}
        - Tahun Pelajaran: ${data.schoolYear}
        
        INFORMASI TAMBAHAN: ${data.additionalNotes || "Tidak ada khusus"}
        
        STRUKTUR DOKUMEN (WAJIB ADA):
        1. INFORMASI UMUM: Identitas Modul, Kompetensi Awal, Profil Pelajar Pancasila (P3), Sarana & Prasarana, Target Peserta Didik.
        2. KOMPONEN INTI: Tujuan Pembelajaran (TP), Alur Tujuan Pembelajaran (ATP), Pemahaman Bermakna, Pertanyaan Pemantik, Persiapan Pembelajaran.
        3. KEGIATAN PEMBELAJARAN (Tabel Profesional): Sertakan tabel langkah-langkah kegiatan (Pendahuluan, Inti, Penutup) dengan estimasi waktu dan integrasi HOTS/6C.
        4. ASESMEN (Tabel Profesional): Tabel jenis asesmen (Diagnostik, Formatif, Sumatif) beserta instrumennya.
        5. PENGAYAAN & REMEDIAL: Strategi tindak lanjut.
        6. LAMPIRAN: Ringkasan Materi, Lembar Kerja Peserta Didik (LKPD), Media Pembelajaran, Glosarium, Daftar Pustaka.
        
        INSTRUKSI KHUSUS:
        - Gunakan Bahasa Indonesia yang formal dan edukatif.
        - Tampilkan data dalam tabel Markdown yang rapi untuk bagian Kegiatan Pembelajaran dan Asesmen.
        - Pastikan modul ini mendukung "Deep Learning" (pemahaman mendalam) dan "Kurikulum Merdeka".
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'rpp' });
      toast.success("Modul Ajar berhasil disusun!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyusun modul ajar");
    } finally {
      setLoading(false);
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
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 md:space-y-8">
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

          <div className="space-y-4 md:space-y-6">
             <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Layout className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                <h3 className="font-bold text-base md:text-lg">Identitas Guru & Satuan Pendidikan</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="name" className="font-bold text-sm">Nama Lengkap Guru</Label>
                  <Input id="name" placeholder="Contoh: Hery Purwanto, S.Pd" {...form.register('name')} className="h-10 md:h-12" />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="nip" className="font-bold text-sm">NIP (Opsional)</Label>
                  <Input id="nip" placeholder="Contoh: 19901031..." {...form.register('nip')} className="h-10 md:h-12" />
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="school" className="font-bold text-sm">Sekolah</Label>
                  <Input id="school" placeholder="Nama Sekolah" {...form.register('school')} className="h-10 md:h-12" />
                  {form.formState.errors.school && <p className="text-xs text-red-500">{form.formState.errors.school.message}</p>}
                </div>
                <div className="space-y-1.5 md:space-y-2">
                  <Label htmlFor="subject" className="font-bold text-sm">Mata Pelajaran</Label>
                  <Input id="subject" placeholder="Bahasa Indonesia" {...form.register('subject')} className="h-10 md:h-12" />
                  {form.formState.errors.subject && <p className="text-xs text-red-500">{form.formState.errors.subject.message}</p>}
                </div>
                <div className="space-y-1.5 md:space-y-2">
                   <Label className="font-bold text-sm">Tahun Pelajaran</Label>
                   <Input placeholder="2025/2026" {...form.register('schoolYear')} className="h-10 md:h-12" />
                </div>
             </div>
          </div>

          <div className="space-y-4 md:space-y-6">
             <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Layers className="w-4 h-4 md:w-5 md:h-5 text-indigo-600" />
                <h3 className="font-bold text-base md:text-lg">Detail Kurikulum & Materi</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
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
                <div className="col-span-full space-y-3 md:space-y-4">
                   <div className="flex items-center justify-between">
                     <Label className="font-bold text-sm">Materi Pokok / Bab</Label>
                     <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 gap-1 text-xs">
                       <Plus className="w-3 h-3" /> Tambah
                     </Button>
                   </div>
                   <div className="space-y-2">
                     {topics.map((t, idx) => (
                       <div key={idx} className="flex gap-2">
                         <Input 
                           placeholder={`Topik/Materi ${idx + 1}`} 
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
                </div>
             </div>
          </div>

          <div className="space-y-2 pt-2 md:pt-4">
             <Label htmlFor="notes" className="font-bold flex items-center gap-2 text-sm">
                <Info className="w-3.5 h-3.5" /> Catatan Tambahan (Opsional)
             </Label>
             <Textarea id="notes" placeholder="Fokus pada pemahaman..." {...form.register('additionalNotes')} className="text-sm min-h-[100px]" />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 md:h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Processing...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-5 h-5 md:w-6 md:h-6" />
                GENERATE RENCANA PEMBELAJARAN
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
