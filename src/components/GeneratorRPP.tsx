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
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { generateEducationContent } from '@/lib/gemini';
import { toast } from 'sonner';

const rppSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  nip: z.string().optional(),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  semester: z.string().min(1, "Semester harus diisi"),
  topic: z.string().min(1, "Materi Pokok harus diisi"),
  learningModel: z.string().min(1, "Model Pembelajaran harus diisi"),
  timeAllocation: z.string().min(1, "Alokasi Waktu harus diisi"),
  meetingsCount: z.string().min(1, "Jumlah Pertemuan harus diisi"),
  schoolYear: z.string().min(1, "Tahun Pelajaran harus diisi"),
  additionalNotes: z.string().optional(),
  useLetterhead: z.boolean().default(false),
  useValidationPage: z.boolean().default(false),
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
      useLetterhead: false,
      useValidationPage: false,
      schoolYear: "2025/2026",
      semester: "Ganjil",
      learningModel: "Discovery Learning",
      meetingsCount: "1 Pertemuan"
    }
  });

  const onSubmit = async (data: RPPFormData) => {
    setLoading(true);
    try {
      const prompt = `
        Buatkan Rencana Pelaksanaan Pembelajaran (RPP) / Modul Ajar yang sangat lengkap dan mendalam (Deep Learning) sesuai Kurikulum Merdeka untuk:
        
        Informasi Guru:
        - Nama: ${data.name}
        - Sekolah: ${data.school}
        - Mata Pelajaran: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Semester: ${data.semester}
        - Tahun Pelajaran: ${data.schoolYear}
        
        Konfigurasi Materi:
        - Materi Pokok: ${data.topic}
        - Model Pembelajaran: ${data.learningModel}
        - Alokasi Waktu: ${data.timeAllocation}
        - Jumlah Pertemuan: ${data.meetingsCount}
        
        Catatan Tambahan: ${data.additionalNotes || "Tidak ada"}
        
        RPP harus mencakup:
        1. Informasi Umum (Sarpras, Target Peserta Didik, Model)
        2. Komponen Inti (CP, TP, ATP, Pemahaman Bermakna, Pertanyaan Pemantik)
        3. Persiapan Pembelajaran (Kesiapan Belajar)
        4. Kegiatan Pembelajaran Mendalam (Pendahuluan, Inti dengan 6C/HOTS, Penutup)
        5. Asesmen Beragam (Formatif, Sumatif, Diagnostik)
        6. Pengayaan & Remedial
        7. Refleksi Guru & Siswa
        8. Lampiran (Materi Ajar singkat, LKPD, Instrumen Penilaian)
        
        Format output: Gunakan Markdown yang rapi dan profesional. Sertakan strategi Pembelajaran Mendalam (Discovery/Inquiry/Project-Based) yang konkret.
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
    <Card className="border-none shadow-2xl shadow-indigo-100 bg-white overflow-hidden">
      <CardHeader className="bg-indigo-600 text-white p-8">
        <div className="flex items-center gap-4 mb-2">
          <FileText className="w-10 h-10" />
          <div>
            <CardTitle className="text-2xl font-black">Generator RPP / Modul Ajar</CardTitle>
            <CardDescription className="text-indigo-100 font-medium">Susun rencana pembelajaran profesional dalam hitungan detik.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-slate-50 rounded-2xl border border-slate-100">
             <div className="flex items-center justify-between col-span-full">
                <div className="flex items-center gap-2">
                   <Settings className="w-4 h-4 text-indigo-600" />
                   <span className="font-bold text-sm uppercase tracking-wider text-slate-500">Pengaturan Dokumen</span>
                </div>
             </div>
             
             <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Kop Surat (Opsional)</Label>
                  <p className="text-xs text-slate-500">Gunakan format kop instansi resmi.</p>
                </div>
                <Switch 
                  checked={form.watch('useLetterhead')} 
                  onCheckedChange={(val) => form.setValue('useLetterhead', val)} 
                />
             </div>

             <div className="flex items-center justify-between p-4 bg-white rounded-xl border border-slate-200">
                <div className="space-y-0.5">
                  <Label className="text-sm font-bold">Lembar Pengesahan</Label>
                  <p className="text-xs text-slate-500">Tambahkan tanda tangan kepala sekolah.</p>
                </div>
                <Switch 
                  checked={form.watch('useValidationPage')} 
                  onCheckedChange={(val) => form.setValue('useValidationPage', val)} 
                />
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Layout className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg">Identitas Guru & Satuan Pendidikan</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold">Nama Lengkap Guru</Label>
                  <Input id="name" placeholder="Contoh: Hery Purwanto, S.Pd" {...form.register('name')} />
                  {form.formState.errors.name && <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="nip" className="font-bold">NIP (Opsional)</Label>
                  <Input id="nip" placeholder="Contoh: 199010312019031002" {...form.register('nip')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="font-bold">Sekolah</Label>
                  <Input id="school" placeholder="Contoh: SMP 60 Muaro Jambi" {...form.register('school')} />
                  {form.formState.errors.school && <p className="text-xs text-red-500">{form.formState.errors.school.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-bold">Mata Pelajaran</Label>
                  <Select onValueChange={(val) => form.setValue('subject', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Mata Pelajaran" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="IPA">Ilmu Pengetahuan Alam (IPA)</SelectItem>
                      <SelectItem value="Bahasa Indonesia">Bahasa Indonesia</SelectItem>
                      <SelectItem value="Matematika">Matematika</SelectItem>
                      <SelectItem value="Informatika">Informatika</SelectItem>
                      <SelectItem value="PJOK">PJOK</SelectItem>
                      <SelectItem value="Seni Budaya">Seni Budaya</SelectItem>
                      <SelectItem value="Lainnya">Lainnya (Tulis di Catatan)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-indigo-100 pb-2">
                <Layers className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-lg">Detail Kurikulum & Materi</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Fase / Kelas</Label>
                  <Select onValueChange={(val) => form.setValue('phaseGrade', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Fase/Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Fase A (Kelas 1-2) SD">Fase A (Kelas 1-2) SD</SelectItem>
                      <SelectItem value="Fase B (Kelas 3-4) SD">Fase B (Kelas 3-4) SD</SelectItem>
                      <SelectItem value="Fase C (Kelas 5-6) SD">Fase C (Kelas 5-6) SD</SelectItem>
                      <SelectItem value="Fase D (Kelas 7-9) SMP">Fase D (Kelas 7-9) SMP</SelectItem>
                      <SelectItem value="Fase E (Kelas 10) SMA">Fase E (Kelas 10) SMA</SelectItem>
                      <SelectItem value="Fase F (Kelas 11-12) SMA">Fase F (Kelas 11-12) SMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Semester</Label>
                  <Select onValueChange={(val) => form.setValue('semester', val)} defaultValue="Ganjil">
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Semester" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Ganjil">Ganjil</SelectItem>
                      <SelectItem value="Genap">Genap</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-full space-y-2">
                  <Label htmlFor="topic" className="font-bold">Materi Pokok / Bab</Label>
                  <Input id="topic" placeholder="Contoh: Sel Hewan dan Tumbuhan / Ekosistem" {...form.register('topic')} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Pendekatan / Model Pembelajaran</Label>
                  <Select onValueChange={(val) => form.setValue('learningModel', val)} defaultValue="Discovery Learning">
                    <SelectTrigger>
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
                <div className="space-y-2">
                  <Label htmlFor="timeAllocation" className="font-bold">Alokasi Waktu</Label>
                  <Input id="timeAllocation" placeholder="Contoh: 2 x 40 Menit" {...form.register('timeAllocation')} />
                </div>
             </div>
          </div>

          <div className="space-y-2 pt-4">
             <Label htmlFor="notes" className="font-bold flex items-center gap-2">
                <Info className="w-4 h-4" /> Catatan Tambahan (Opsional)
             </Label>
             <Textarea id="notes" placeholder="Contoh: Fokus pada pemahaman mikroskopis sel, sertakan kaitan dengan kehidupan sehari-hari." {...form.register('additionalNotes')} />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-indigo-200 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Sedang Menyusun Modul Ajar...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                Generate Rencana Pembelajaran
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
