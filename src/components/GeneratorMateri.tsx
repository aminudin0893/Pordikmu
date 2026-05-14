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
  Target
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

const materiSchema = z.object({
  name: z.string().min(1, "Nama harus diisi"),
  school: z.string().min(1, "Sekolah harus diisi"),
  subject: z.string().min(1, "Mata Pelajaran harus diisi"),
  phaseGrade: z.string().min(1, "Fase/Kelas harus diisi"),
  topic: z.string().min(1, "Topik Materi harus diisi"),
  depthLevel: z.enum(['basic', 'intermediate', 'advanced']),
  includeAnalogy: z.boolean().default(true),
  includeIllustration: z.boolean().default(true),
  targetFocus: z.string().optional(),
});

type MateriFormData = z.infer<typeof materiSchema>;

interface Props {
  onSuccess: (content: string, config: any) => void;
}

export default function GeneratorMateri({ onSuccess }: Props) {
  const [loading, setLoading] = useState(false);

  const form = useForm<MateriFormData>({
    resolver: zodResolver(materiSchema),
    defaultValues: {
      name: '',
      school: '',
      subject: '',
      phaseGrade: '',
      topic: '',
      depthLevel: 'intermediate',
      includeAnalogy: true,
      includeIllustration: true,
    } as any
  });

  const onSubmit = async (data: MateriFormData) => {
    setLoading(true);
    try {
      const prompt = `
        Susunlah materi ajar yang interaktif, mendalam, dan menarik sesuai Kurikulum Merdeka untuk:
        
        Subjek: ${data.subject}
        Fase/Kelas: ${data.phaseGrade}
        Topik: ${data.topic}
        Tingkat Kedalaman: ${data.depthLevel}
        
        Kebutuhan Khusus:
        - Analogi Kontekstual: ${data.includeAnalogy ? "YA" : "TIDAK"}
        - Deskripsi Ilustrasi Visual: ${data.includeIllustration ? "YA" : "TIDAK"}
        - Fokus Utama: ${data.targetFocus || "Pemahaman Konsep Dasar"}
        
        Materi harus mencakup:
        1. Judul yang Menarik (Hook)
        2. Pengantar Kontekstual (Mengapa ini penting?)
        3. Penjelasan Inti (Gunakan prinsip Pembelajaran Mendalam / Deep Learning - tidak hanya hafalan)
        4. Analogi atau Perumpamaan dunia nyata untuk memudahkan pemahaman
        5. Deskripsi Prompt untuk Gambar/Ilustrasi yang bisa di-generate (untuk membantu guru)
        6. Pojok Diskusi / Pertanyaan Pemantik
        7. Kesimpulan & Peta Konsep sederhana
        
        Gunakan gaya bahasa yang sesuai untuk ${data.phaseGrade}. Gunakan Markdown yang cantik.
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
                <Input placeholder="Contoh: Fase D / Kelas 7" {...form.register('phaseGrade')} />
             </div>
             <div className="col-span-full space-y-2">
                <Label className="font-bold">Topik Materi</Label>
                <Input placeholder="Contoh: Klasifikasi Makhluk Hidup" {...form.register('topic')} />
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
