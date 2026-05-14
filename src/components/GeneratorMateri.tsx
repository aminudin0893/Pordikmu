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

const materiSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  topics: z.array(z.string()).min(1, "Minimal satu topik materi harus diisi"),
  depthLevel: z.enum(['basic', 'intermediate', 'advanced']),
  includeAnalogy: z.boolean(),
  includeIllustration: z.boolean(),
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
      name: '',
      school: '',
      subject: '',
      phaseGrade: '',
      topics: [""],
      depthLevel: 'intermediate',
      includeAnalogy: true,
      includeIllustration: true,
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

  const onSubmit = async (data: MateriFormData) => {
    setLoading(true);
    try {
      const prompt = `
        Susunlah materi ajar yang komprehensif, interaktif, mendalam, dan sangat profesional sesuai standar Kurikulum Merdeka untuk:
        
        DATA:
        - Subjek: ${data.subject}
        - Fase/Kelas: ${data.phaseGrade}
        - Topik / Materi Pembelajaran: ${data.topics.join(", ")}
        - Tingkat Kedalaman: ${data.depthLevel}
        - Fokus Utama: ${data.targetFocus || "Pemahaman Konsep Secara Holistik"}
        
        STUKTUR MATERI (WAJIB ADA):
        1. JUDUL: Buat judul yang sangat menarik dan relevan.
        2. TUJUAN PEMBELAJARAN (Tabel): List tujuan pembelajaran yang selaras dengan CP Kurikulum Merdeka.
        3. PENGANTAR KONTEKSTUAL: Cerita atau fenomena nyata terkait materi (Apersepsi).
        4. PEMBAHASAN INTI: Penjelasan mendalam menggunakan bahasa yang mudah dipahami namun akademis. Gunakan poin-poin/list yang rapi.
        5. ANALOGI & ILUSTRASI: ${data.includeAnalogy ? "Berikan analogi dunia nyata yang cerdas. " : ""}${data.includeIllustration ? "Sertakan deskripsi detail untuk ilustrasi visual yang bisa dibuat. " : ""}
        6. TABEL KOMPARASI/RANGKUMAN: Buat tabel profesional yang merangkum poin-poin kunci materi.
        7. POJOK DISKUSI (HOTS): Tantangan berpikir kritis dan pertanyaan pemantik untuk siswa.
        8. GLOSARIUM & PENGAYAAN: Istilah penting dan bahan bacaan lebih lanjut.
        
        INSTRUKSI FORMAT:
        - Gunakan Bahasa Indonesia formal dan edukatif.
        - Wajib menggunakan Tabel Markdown untuk bagian Tujuan dan Rangkuman.
        - Terapkan prinsip "Deep Learning" agar siswa tidak hanya menghafal, tapi memahami "why" dan "how".
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
        <form onSubmit={form.handleSubmit(onSubmit as any)} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="space-y-2">
                <Label className="font-bold">Nama Guru</Label>
                <Input placeholder="Nama Anda" {...form.register('name')} />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Mata Pelajaran</Label>
                <Input placeholder="Mata Pelajaran" {...form.register('subject')} />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Sekolah</Label>
                <Input placeholder="Nama Sekolah" {...form.register('school')} />
             </div>
             <div className="space-y-2">
                <Label className="font-bold">Fase / Kelas</Label>
                <Select onValueChange={(val: string) => form.setValue('phaseGrade', val)}>
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

          <div className="space-y-6 pt-4 border-t border-slate-100">
             <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-lg leading-none">Konfigurasi Penjelasan AI</h3>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                   <Label className="font-bold">Tingkat Kedalaman</Label>
                   <Select onValueChange={(val: any) => form.setValue('depthLevel', val)} defaultValue="intermediate">
                     <SelectTrigger>
                       <SelectValue />
                     </SelectTrigger>
                     <SelectContent>
                       <SelectItem value="basic">Dasar / Pengenalan</SelectItem>
                       <SelectItem value="intermediate">Menengah / Standar</SelectItem>
                       <SelectItem value="advanced">Lanjutan / Mendalam</SelectItem>
                     </SelectContent>
                   </Select>
                </div>
                <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                   <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-emerald-900">Analogi</Label>
                      <p className="text-[10px] text-emerald-600">Gunakan perumpamaan</p>
                   </div>
                   <Switch 
                     checked={form.watch('includeAnalogy')} 
                     onCheckedChange={(val) => form.setValue('includeAnalogy', val)} 
                   />
                </div>
                <div className="flex items-center justify-between p-3 bg-blue-50 rounded-xl border border-blue-100">
                   <div className="space-y-0.5">
                      <Label className="text-xs font-bold text-blue-900">Ilustrasi</Label>
                      <p className="text-[10px] text-blue-600">Deskripsi visual</p>
                   </div>
                   <Switch 
                     checked={form.watch('includeIllustration')} 
                     onCheckedChange={(val) => form.setValue('includeIllustration', val)} 
                   />
                </div>
             </div>
          </div>

          <div className="space-y-2">
             <Label className="font-bold flex items-center gap-2">
                <Target className="w-4 h-4 text-emerald-600" /> Fokus Utama Materi
             </Label>
             <Textarea placeholder="Contoh: Fokus pada mekanisme transfer energi dalam ekosistem..." {...form.register('targetFocus')} />
          </div>

          <Button 
            type="submit" 
            className="w-full h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-emerald-100 transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Materi Sedang Ditulis...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Rocket className="w-6 h-6" />
                Generate Materi Ajar
              </div>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
