import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  BookOpen, 
  Rocket, 
  MapPin,
  Sparkles,
  Zap,
  Target,
  Plus,
  Trash2
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

const materiSchema = z.object({
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  topics: z.array(z.string()).min(1, "Minimal satu topik materi harus diisi"),
  depthLevel: z.enum(['basic', 'intermediate', 'advanced']),
  includeAnalogy: z.boolean(),
  includeIllustration: z.boolean(),
  includeQuiz: z.boolean(),
  targetFocus: z.string().optional(),
});

type MateriFormData = z.infer<typeof materiSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
}

export default function GeneratorMateri({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);
  const [topics, setTopics] = useState([""]);

  const form = useForm<MateriFormData>({
    resolver: zodResolver(materiSchema),
    defaultValues: {
      school: '',
      subject: '',
      phaseGrade: '',
      topics: [""],
      depthLevel: 'intermediate',
      includeAnalogy: true,
      includeIllustration: true,
      includeQuiz: true,
    }
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

  const onSubmit = async (data: MateriFormData) => {
    setLoading(true);
    try {
      const prompt = `
        Susunlah Materi Ajar Digital yang sangat komprehensif, menarik, dan menggunakan prinsip "Deep Learning" untuk:
        
        DATA:
        - Subjek: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Topik / Materi Pembelajaran: ${data.topics.join(", ")}
        - Tingkat Kedalaman: ${data.depthLevel}
        - Fokus Utama: ${data.targetFocus || "Pemahaman Konsep Secara Holistik"}
        
        KOMPONEN MATERI (WAJIB ADA):
        1. TUJUAN PEMBELAJARAN (Tabel): Apa yang akan dikuasai siswa.
        2. APERSEPSI & PREVIEW: Cerita/konteks dunia nyata untuk memancing rasa ingin tahu.
        3. ISI MATERI UTAMA: Penjelasan konsep dengan struktur yang logis.
           - Gunakan heading yang jelas.
           - Tambahkan poin-poin penting.
           ${data.includeAnalogy ? "- Sertakan ANALOGI sederhana untuk menjelaskan konsep abstrak." : ""}
        4. STUDI KASUS / CONTOH NYATA: Penerapan materi dalam kehidupan.
        5. VISUALISASI DESKRIPTIF: Deskripsi visual ${data.includeIllustration ? "yang detail (bayangkan sebagai ilustrasi buku teks)" : ""}.
        6. RANGKUMAN (Tabel): Intisari materi yang mudah dihafal.
        ${data.includeQuiz ? "7. CEK PEMAHAMAN (Kuis Kecil): 3-5 pertanyaan reflektif untuk mengetes pemahaman." : ""}
        
        INSTRUKSI FORMAT:
        - Gunakan Bahasa Indonesia formal dan edukatif.
        - Wajib menggunakan Tabel Markdown yang sangat rapi dan profesional untuk bagian Tujuan dan Rangkuman.
        - Pastikan tabel mudah dibaca dengan kolom yang terstruktur.
        - Terapkan prinsip "Deep Learning" agar siswa tidak hanya menghafal, tapi memahami "why" and "how".
        - Format tulisan harus sangat rapi dengan Markdown yang profesional.
      `;

      const result = await generateEducationContent(prompt);
      onSuccess(result.text, { ...data, type: 'materi' });
      toast.success("Materi ajar berhasil disusun!");
    } catch (error: any) {
      toast.error(error.message || "Gagal menyusun materi");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl shadow-emerald-100 bg-white overflow-hidden rounded-t-none md:rounded-t-3xl">
      <CardHeader className="bg-emerald-600 text-white p-6 md:p-8">
        <div className="flex items-center gap-3 md:gap-4 mb-2">
          <BookOpen className="w-8 h-8 md:w-10 md:h-10" />
          <div>
            <CardTitle className="text-xl md:text-2xl font-black">Generator Materi Ajar Digital</CardTitle>
            <CardDescription className="text-emerald-100 font-medium text-xs md:text-sm">Ubah topik sulit menjadi penjelasan yang mudah dipahami.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-4 md:p-8">
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-6 md:space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
             <div className="space-y-1.5 md:space-y-2">
                <Label className="font-bold text-sm">Mata Pelajaran</Label>
                <Input placeholder="Contoh: IPA / Biologi" {...form.register('subject')} className="h-10 md:h-12" />
             </div>
             <div className="space-y-1.5 md:space-y-2">
                <Label className="font-bold text-sm">Sekolah</Label>
                <Input placeholder="Nama Sekolah" {...form.register('school')} className="h-10 md:h-12" />
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
             </div>
             <div className="col-span-full space-y-3 md:space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold text-sm">Topik Materi / Bab</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 gap-1 text-xs px-2 py-0">
                    <Plus className="w-3 h-3" /> Tambah
                  </Button>
                </div>
                <div className="space-y-2">
                  {topics.map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        placeholder={`Topik Materi ${idx + 1}`} 
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

          <div className="space-y-4 md:space-y-6 p-4 md:p-6 bg-slate-50 rounded-2xl md:rounded-3xl border border-slate-200">
             <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                <Sparkles className="w-4 h-4 md:w-5 md:h-5 text-emerald-600" />
                <h3 className="font-bold text-base md:text-lg italic">Gaya Penulisan & Kedalaman</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8">
                <div className="space-y-2 md:space-y-4">
                   <Label className="font-bold text-sm">Kedalaman Materi</Label>
                   <Select onValueChange={(val: any) => form.setValue('depthLevel', val)} defaultValue="intermediate">
                     <SelectTrigger className="h-10 md:h-12">
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="basic">Dasar (Perkenalan)</SelectItem>
                        <SelectItem value="intermediate">Menengah (Komprehensif)</SelectItem>
                        <SelectItem value="advanced">Lanjut (Analisis & HOTS)</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2 text-left md:text-right">
                   <Label className="font-bold text-sm">Fitur Tambahan</Label>
                   <div className="flex flex-wrap md:justify-end gap-3 md:gap-4 pt-1 md:pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="analog" checked={form.watch('includeAnalogy')} onCheckedChange={(val) => form.setValue('includeAnalogy', !!val)} />
                        <label htmlFor="analog" className="text-xs md:text-sm font-medium">Analogi</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="illus" checked={form.watch('includeIllustration')} onCheckedChange={(val) => form.setValue('includeIllustration', !!val)} />
                        <label htmlFor="illus" className="text-xs md:text-sm font-medium">Ilustrasi</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quiz" checked={form.watch('includeQuiz')} onCheckedChange={(val) => form.setValue('includeQuiz', !!val)} />
                        <label htmlFor="quiz" className="text-xs md:text-sm font-medium">Kuis</label>
                      </div>
                   </div>
                </div>
                <div className="col-span-full space-y-2">
                   <Label className="font-bold text-sm flex items-center gap-2">
                      <Target className="w-3.5 h-3.5 text-emerald-600" /> Fokus Target Pembelajaran
                   </Label>
                   <Textarea placeholder="Contoh: Tekankan pada proses osmosis..." {...form.register('targetFocus')} className="text-sm min-h-[90px]" />
                </div>
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 md:h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base md:text-lg rounded-xl md:rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
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
