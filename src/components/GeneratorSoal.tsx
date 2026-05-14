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
  Image as ImageIcon,
  Zap,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
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

const soalSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  schoolYear: z.string().min(1, "Tahun Pelajaran harus diisi"),
  topic: z.string().min(1, "Topik harus diisi"),
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
  const [difficulty, setDifficulty] = useState([30, 40, 30]); // Mudah, Sedang, Sulit

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
      multiResponseCount: 0,
      trueFalseCount: 0,
      shortAnswerCount: 0,
      essayCount: 2,
      matchTableCount: 0,
    }
  });

  const onSubmit = async (data: SoalFormData) => {
    setLoading(true);
    try {
      const totalSoal = data.mcqCount + data.multiResponseCount + data.trueFalseCount + data.shortAnswerCount + data.essayCount + data.matchTableCount;
      if (totalSoal === 0) {
        toast.error("Tentukan jumlah soal yang akan di-generate!");
        return;
      }

      const prompt = `
        Ciptakan Bank Soal Ujian yang TERSTRUKTUR, RAPI, dan sesuai Kurikulum Merdeka untuk:
        
        Identitas Asesmen:
        - Guru: ${data.name}
        - Sekolah: ${data.school}
        - Mata Pelajaran: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Topik/Materi: ${data.topic}
        - Jenis Asesmen: ${data.assessmentType}
        
        Konfigurasi Soal:
        - Jumlah Opsi: ${data.optionsCount}
        - Level Kognitif: ${data.cognitiveLevels.join(", ")}
        - Distribusi Tingkat Kesulitan: Mudah (${data.easyPerc}%), Sedang (${data.mediumPerc}%), Sulit/HOTS (${data.hardPerc}%)
        
        Distribusi Tipe Soal:
        - Pilihan Ganda (PG): ${data.mcqCount} butir
        - PG Kompleks (Multi Response): ${data.multiResponseCount} butir
        - Benar / Salah: ${data.trueFalseCount} butir
        - Isian Singkat: ${data.shortAnswerCount} butir
        - Essay / Uraian: ${data.essayCount} butir
        - Menjodohkan / Tabel: ${data.matchTableCount} butir
        
        Instruksi Tambahan: ${data.specialInstructions || "Fokus pada penalaran logis dan konteks dunia nyata."}
        
        Output:
        1. Judul Ujian & Kop Identitas
        2. Daftar Soal (Tuliskan Tipe dan Level Kognitif di setiap butir)
        3. Kunci Jawaban Lengkap
        4. Rubrik Penilaian (khusus Essay)
        5. Kisi-kisi singkat (TP, Materi, Indikator Soal, Level)
        
        Gunakan format Markdown yang sangat rapi. Sisipkan elemen narasi/stem soal yang kontekstual untuk HOTS.
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
    <Card className="border-none shadow-2xl shadow-indigo-100 bg-white overflow-hidden">
      <CardHeader className="bg-orange-600 text-white p-8">
        <div className="flex items-center gap-4 mb-2">
          <GraduationCap className="w-10 h-10" />
          <div>
            <CardTitle className="text-2xl font-black">APLIKASI GENERATOR SOAL UJIAN AI</CardTitle>
            <CardDescription className="text-orange-100 font-medium">Bank soal HOTS yang terstruktur, rapi, dan disesuaikan Kurikulum Nasional.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-10">
          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <Brain className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg italic">Identitas Asesmen & Kurikulum</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label className="font-bold">Model Kurikulum</Label>
                  <Select defaultValue="Kurikulum Merdeka (Deep Learning)">
                    <SelectTrigger className="font-semibold text-orange-700 bg-orange-50/50 border-orange-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Kurikulum Merdeka (Deep Learning)">Kurikulum Merdeka (Deep Learning)</SelectItem>
                      <SelectItem value="Kurikulum 2013 (Revisi)">Kurikulum 2013 (Revisi)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-bold">Nama Guru</Label>
                  <Input placeholder="Aminudin" {...form.register('name')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="school" className="font-bold">Nama Sekolah</Label>
                  <Input placeholder="SMP Negeri..." {...form.register('school')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject" className="font-bold">Mata Pelajaran</Label>
                  <Input placeholder="Bahasa Indonesia" {...form.register('subject')} />
                </div>
                <div className="space-y-2">
                  <Label className="font-bold">Fase / Kelas</Label>
                  <Select onValueChange={(val) => form.setValue('phaseGrade', val)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih Kelas" />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="Fase D (Kelas 7) SMP">Fase D (Kelas 7) SMP</SelectItem>
                       <SelectItem value="Fase D (Kelas 8) SMP">Fase D (Kelas 8) SMP</SelectItem>
                       <SelectItem value="Fase D (Kelas 9) SMP">Fase D (Kelas 9) SMP</SelectItem>
                       <SelectItem value="Fase E (Kelas 10) SMA">Fase E (Kelas 10) SMA</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                   <Label className="font-bold">Tahun Pelajaran</Label>
                   <Select onValueChange={(val) => form.setValue('schoolYear', val)} defaultValue="2025/2026">
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                       <SelectItem value="2024/2025">2024/2025</SelectItem>
                       <SelectItem value="2025/2026">2025/2026</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-full space-y-2">
                   <Label htmlFor="topic" className="font-bold italic">Topik / Materi Utama Ujian</Label>
                   <Input id="topic" placeholder="Contoh: Fotosintesis, Ekosistem, Pantun" {...form.register('topic')} />
                </div>
             </div>
          </div>

          <div className="space-y-8 p-6 bg-slate-50 rounded-3xl border border-slate-200">
             <div className="flex items-center gap-2 border-b border-orange-200 pb-2">
                <Settings className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg">Konfigurasi Detail Soal</h3>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                   <div className="space-y-2">
                      <Label className="font-bold">Jenis Asesmen / Ujian</Label>
                      <Select onValueChange={(val) => form.setValue('assessmentType', val)} defaultValue="Sumatif Harian">
                        <SelectTrigger>
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
                      <Label className="font-bold">Jumlah Opsi Pilihan Ganda</Label>
                      <Select onValueChange={(val) => form.setValue('optionsCount', val)} defaultValue="4 Opsi (A, B, C, D)">
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="3 Opsi (A, B, C)">3 Opsi (A, B, C)</SelectItem>
                          <SelectItem value="4 Opsi (A, B, C, D)">4 Opsi (A, B, C, D)</SelectItem>
                          <SelectItem value="5 Opsi (A, B, C, D, E)">5 Opsi (A, B, C, D, E)</SelectItem>
                        </SelectContent>
                      </Select>
                   </div>
                   <div className="space-y-4">
                      <Label className="font-bold">Level Kognitif Soal (Taksonomi Bloom)</Label>
                      <div className="grid grid-cols-2 gap-3">
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
                              <label htmlFor={opt.id} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 dark:text-orange-900">
                                {opt.label}
                              </label>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>

                <div className="space-y-4 bg-white p-6 rounded-2xl border border-slate-200">
                   <Label className="font-bold">Proporsi Tingkat Kesulitan (%)</Label>
                   <div className="space-y-8 py-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-emerald-600">
                          <span>Mudah</span>
                          <span>{form.watch('easyPerc') || 30}%</span>
                        </div>
                        <Slider 
                           value={[form.watch('easyPerc') || 30]} 
                           onValueChange={(val) => form.setValue('easyPerc', val[0])}
                           max={100} step={5} 
                           className="bg-emerald-100"
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-amber-600">
                          <span>Sedang</span>
                          <span>{form.watch('mediumPerc') || 50}%</span>
                        </div>
                        <Slider 
                           value={[form.watch('mediumPerc') || 50]} 
                           onValueChange={(val) => form.setValue('mediumPerc', val[0])}
                           max={100} step={5} 
                        />
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs font-bold uppercase text-red-600">
                          <span>Sulit (HOTS)</span>
                          <span>{form.watch('hardPerc') || 20}%</span>
                        </div>
                        <Slider 
                           value={[form.watch('hardPerc') || 20]} 
                           onValueChange={(val) => form.setValue('hardPerc', val[0])}
                           max={100} step={5} 
                        />
                      </div>
                      <div className="pt-2 bg-emerald-50 p-2 rounded-lg text-center">
                         <span className="text-xs font-black text-emerald-800">Total: 100% (Harus 100%)</span>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <ListTodo className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg">Distribusi Tipe Soal</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {[
                  { label: "PG BIASA", field: "mcqCount" as const, color: "blue" },
                  { label: "PG KOMPLEKS", field: "multiResponseCount" as const, color: "indigo" },
                  { label: "BENAR / SALAH", field: "trueFalseCount" as const, color: "emerald" },
                  { label: "ISIAN SINGKAT", field: "shortAnswerCount" as const, color: "amber" },
                  { label: "ESSAY / URAIAN", field: "essayCount" as const, color: "red" },
                  { label: "MENJODOHKAN", field: "matchTableCount" as const, color: "cyan" },
                ].map((item) => (
                  <div key={item.field} className={`p-4 rounded-2xl border bg-${item.color}-50 border-${item.color}-100 flex items-center justify-between`}>
                     <div className="space-y-1">
                        <span className={`text-[10px] font-black uppercase text-${item.color}-700`}>{item.label}</span>
                        <p className="text-[10px] text-slate-400">Jumlah Soal:</p>
                     </div>
                     <Input 
                       type="number" 
                       className="w-16 h-10 text-center font-bold" 
                       value={form.watch(item.field)}
                       onChange={(e) => form.setValue(item.field, parseInt(e.target.value) || 0)}
                     />
                  </div>
                ))}
             </div>
             <div className="bg-indigo-600 p-3 rounded-2xl text-center shadow-lg">
                <span className="text-white font-black">Total Soal Di-generate: {
                 (form.watch('mcqCount') || 0) + 
                 (form.watch('multiResponseCount') || 0) + 
                 (form.watch('trueFalseCount') || 0) + 
                 (form.watch('shortAnswerCount') || 0) + 
                 (form.watch('essayCount') || 0) + 
                 (form.watch('matchTableCount') || 0)
                } Butir</span>
             </div>
          </div>

          <div className="space-y-6">
             <div className="flex items-center gap-2 border-b border-orange-100 pb-2">
                <ImageIcon className="w-5 h-5 text-orange-600" />
                <h3 className="font-bold text-lg">Visual, Referensi & Instruksi Khusus</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div className="space-y-4 p-4 border-2 border-dashed border-slate-200 rounded-3xl">
                    <Label className="font-bold text-xs uppercase tracking-wider text-slate-500">Kebutuhan Multimedia Soal</Label>
                    <div className="space-y-3">
                       <div className="flex items-center justify-between p-2 bg-blue-50 rounded-xl border border-blue-100">
                          <span className="text-sm font-bold text-blue-800">Sisipkan Gambar</span>
                          <Input type="number" className="w-12 h-8 text-center" defaultValue={1} />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-pink-50 rounded-xl border border-pink-100">
                          <span className="text-sm font-bold text-pink-800">Grafik/Visual</span>
                          <Input type="number" className="w-12 h-8 text-center" defaultValue={0} />
                       </div>
                       <div className="flex items-center justify-between p-2 bg-amber-50 rounded-xl border border-amber-100">
                          <span className="text-sm font-bold text-amber-800">Pemicu Refleksi</span>
                          <Input type="number" className="w-12 h-8 text-center" defaultValue={0} />
                       </div>
                    </div>
                 </div>
                 <div className="space-y-2">
                    <Label className="font-bold">Catatan Tambahan (Instruksi Khusus)</Label>
                    <Textarea placeholder="Contoh: Buat soal studi kasus kasus lokal..." className="h-full min-h-[140px]" {...form.register('specialInstructions')} />
                 </div>
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-indigo-100 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Dihangatkan oleh AI... Sesaat lagi!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 fill-white" />
                GENERATE SOAL SEKARANG
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
