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
        - Wajib menggunakan Tabel Markdown untuk bagian Tujuan dan Rangkuman.
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
    <Card className="border-none shadow-2xl shadow-emerald-100 bg-white overflow-hidden">
      <CardHeader className="bg-emerald-600 text-white p-8">
        <div className="flex items-center gap-4 mb-2">
          <BookOpen className="w-10 h-10" />
          <div>
            <CardTitle className="text-2xl font-black">Generator Materi Ajar Digital</CardTitle>
            <CardDescription className="text-emerald-100 font-medium">Ubah topik sulit menjadi penjelasan yang mudah dipahami dan mendalam.</CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="p-8">
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="font-bold">Mata Pelajaran</Label>
                <Input placeholder="Contoh: IPA / Biologi" {...form.register('subject')} />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Sekolah</Label>
                <Input placeholder="Nama Sekolah" {...form.register('school')} />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Fase / Kelas</Label>
                <div className="flex gap-2">
                  <Select onValueChange={(val: string) => {
                    if (val !== "manual") form.setValue('phaseGrade', val);
                  }}>
                    <SelectTrigger className="w-[180px]">
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
                    placeholder="Input manual..." 
                    {...form.register('phaseGrade')} 
                    className="flex-grow"
                  />
                </div>
             </div>
             <div className="col-span-full space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="font-bold">Topik Materi / Bab (Dapat ditambahkan)</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addTopic} className="h-8 gap-1">
                    <Plus className="w-3 h-3" /> Tambah Topik
                  </Button>
                </div>
                <div className="space-y-2">
                  {topics.map((t, idx) => (
                    <div key={idx} className="flex gap-2">
                      <Input 
                        placeholder={`Topik Materi ${idx + 1}`} 
                        value={t} 
                        onChange={(e) => updateTopic(idx, e.target.value)}
                      />
                      {topics.length > 1 && (
                        <Button type="button" variant="ghost" size="icon" onClick={() => removeTopic(idx)} className="text-red-500">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
             </div>
          </div>

          <div className="space-y-6 p-6 bg-slate-50 rounded-3xl border border-slate-200">
             <div className="flex items-center gap-2 border-b border-emerald-100 pb-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg italic">Gaya Penulisan & Kedalaman</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                   <Label className="font-bold">Tingkat Kedalaman Materi</Label>
                   <Select onValueChange={(val: any) => form.setValue('depthLevel', val)} defaultValue="intermediate">
                     <SelectTrigger>
                        <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                        <SelectItem value="basic">Dasar (Perkenalan Konsep)</SelectItem>
                        <SelectItem value="intermediate">Menengah (Pemahaman Komprehensif)</SelectItem>
                        <SelectItem value="advanced">Lanjut (Analisis Mendalam & HOTS)</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="space-y-2 text-right">
                   <Label className="font-bold">Fitur Tambahan</Label>
                   <div className="flex flex-wrap justify-end gap-4 pt-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox id="analog" checked={form.watch('includeAnalogy')} onCheckedChange={(val) => form.setValue('includeAnalogy', !!val)} />
                        <label htmlFor="analog" className="text-sm font-medium">Analogi</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="illus" checked={form.watch('includeIllustration')} onCheckedChange={(val) => form.setValue('includeIllustration', !!val)} />
                        <label htmlFor="illus" className="text-sm font-medium">Ilustrasi</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox id="quiz" checked={form.watch('includeQuiz')} onCheckedChange={(val) => form.setValue('includeQuiz', !!val)} />
                        <label htmlFor="quiz" className="text-sm font-medium">Kuis</label>
                      </div>
                   </div>
                </div>
                <div className="col-span-full space-y-2">
                   <Label className="font-bold flex items-center gap-2">
                      <Target className="w-4 h-4 text-emerald-600" /> Fokus Target Pembelajaran
                   </Label>
                   <Textarea placeholder="Contoh: Tekankan pada bagaimana proses osmosis terjadi secara biologis..." {...form.register('targetFocus')} />
                </div>
             </div>
          </div>

          <Button 
            type="submit" 
            className="w-full h-16 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xl rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Meramu Materi... Sesaat lagi!
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Zap className="w-6 h-6 fill-white" />
                GENERATE MATERI SEKARANG
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
