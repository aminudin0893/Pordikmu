import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  BookOpen, 
  FileText, 
  GraduationCap, 
  History, 
  Globe, 
  Zap, 
  ArrowLeft,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Toaster, toast } from 'sonner';

// Components
import GeneratorRPP from './components/GeneratorRPP';
import GeneratorSoal from './components/GeneratorSoal';
import GeneratorMateri from './components/GeneratorMateri';
import ResultView from './components/ResultView';

type ViewMode = 'login' | 'dashboard' | 'rpp' | 'materi' | 'soal' | 'result';

export default function App() {
  const [view, setView] = useState<ViewMode>('login');
  const [pin, setPin] = useState('');
  const [userApiKey, setUserApiKey] = useState('');
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [lastConfig, setLastConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '085227') {
      setView('dashboard');
      toast.success("Login Berhasil!");
    } else {
      toast.error("Kode PIN Salah!");
    }
  };

  const handleBack = () => setView('dashboard');

  const onGenerateSuccess = (content: string, config: any) => {
    setGeneratedContent(content);
    setLastConfig(config);
    setView('result');
  };

  if (view === 'login') {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <Toaster position="top-center" richColors />
        <Card className="w-full max-w-md border-none shadow-2xl">
          <CardHeader className="bg-indigo-600 text-white rounded-t-xl text-center">
            <GraduationCap className="w-12 h-12 mx-auto mb-2" />
            <CardTitle className="text-2xl font-black">LOGIN PESERTA</CardTitle>
            <CardDescription className="text-indigo-100">Masukkan Kode Akses Anda</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="pin">Kode PIN</Label>
                <Input 
                  id="pin" 
                  type="password" 
                  placeholder="Masukkan 6 digit pin" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-2xl tracking-[1em] h-14"
                />
              </div>
              <Button type="submit" className="w-full h-12 bg-indigo-600 font-bold text-lg">
                Masuk ke Aplikasi
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
      <Toaster position="top-center" richColors />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50 rounded-full blur-3xl opacity-50" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div 
            className="flex items-center gap-2 cursor-pointer" 
            onClick={() => setView('dashboard')}
          >
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <GraduationCap className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">AI Pendidikan</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">Kurikulum Merdeka</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
              <History className="w-4 h-4" /> Riwayat
            </Button>
            <Button variant="ghost" size="sm" className="hidden sm:flex gap-2">
              <Globe className="w-4 h-4" /> Panduan
            </Button>
          </div>
        </div>
      </nav>

      <main className="relative z-10 max-w-5xl mx-auto px-4 py-8 sm:py-12">
        <AnimatePresence mode="wait">
          {view === 'dashboard' && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-12"
            >
              <div className="text-center space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold uppercase tracking-wider mb-2">
                  <Zap className="w-3 h-3 fill-indigo-500" /> Powered by Gemini AI
                </div>
                <h2 className="text-4xl sm:text-5xl font-black text-slate-900 tracking-tight">
                  APLIKASI GENERATOR <span className="text-indigo-600">AI PENDIDIKAN</span>
                </h2>
                <p className="text-slate-600 max-w-2xl mx-auto text-lg leading-relaxed">
                  Pilih menu aplikasi di bawah ini untuk menyusun perangkat ajar Anda secara otomatis. 
                  <span className="block font-bold mt-1 text-indigo-500">Support Kurikulum Merdeka dan Pembelajaran Mendalam.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-3 border-none shadow-lg bg-indigo-50 p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-grow space-y-2 w-full">
                    <Label className="font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600" /> Masukkan API Key Gemini (Opsional)
                    </Label>
                    <Input 
                      placeholder="AI_Studio_API_Key..." 
                      className="bg-white" 
                      value={userApiKey}
                      onChange={(e) => {
                        setUserApiKey(e.target.value);
                        localStorage.setItem('user_gemini_key', e.target.value);
                      }}
                    />
                    <p className="text-[10px] text-indigo-400 font-medium italic">Kosongkan jika ingin menggunakan key default sistem.</p>
                  </div>
                  <Button variant="outline" className="shrink-0" onClick={() => window.open('https://aistudio.google.com/app/apikey', '_blank')}>
                    Dapatkan Key Baru
                  </Button>
                </Card>
                {[
                  {
                    id: 'rpp',
                    title: 'Generator RPP / Modul Ajar',
                    description: 'Rancang skenario pembelajaran mendalam lengkap dengan instrumen asesmen dan LKPD secara otomatis.',
                    icon: <FileText className="w-8 h-8 text-indigo-600" />,
                    color: 'indigo',
                    action: 'Mulai Buat RPP'
                  },
                  {
                    id: 'materi',
                    title: 'Generator Materi Ajar',
                    description: 'Susun bahan ajar digital interaktif lengkap dengan penjelasan mendalam, analogi, dan ilustrasi AI.',
                    icon: <BookOpen className="w-8 h-8 text-emerald-600" />,
                    color: 'emerald',
                    action: 'Mulai Buat Materi'
                  },
                  {
                    id: 'soal',
                    title: 'Generator Soal & Kuis',
                    description: 'Ciptakan butir soal evaluasi berstandar HOTS dengan berbagai format lengkap beserta kunci jawaban.',
                    icon: <GraduationCap className="w-8 h-8 text-orange-600" />,
                    color: 'orange',
                    action: 'Mulai Buat Soal'
                  }
                ].map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: idx * 0.1 } }}
                    whileHover={{ y: -5 }}
                    className="group"
                  >
                    <Card 
                      className="h-full border-2 border-transparent hover:border-indigo-100 shadow-xl shadow-slate-100 hover:shadow-indigo-100 transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center p-6 bg-white"
                      onClick={() => setView(item.id as ViewMode)}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`} 
                           style={{ backgroundColor: `var(--${item.color}-50, #f8fafc)` }}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3">{item.title}</h3>
                      <p className="text-slate-500 text-sm leading-relaxed mb-6 flex-grow">{item.description}</p>
                      <Button variant="ghost" className={`text-${item.color}-600 font-bold group-hover:bg-indigo-50 transition-colors`}>
                        {item.action} →
                      </Button>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8">
                <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-full shadow-sm">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                  <span className="text-sm font-semibold text-indigo-900">Model: Gemini 3 Flash (Terbaru)</span>
                </div>
              </div>
            </motion.div>
          )}

          {view === 'rpp' && (
            <motion.div key="rpp" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
              </Button>
              <GeneratorRPP onSuccess={onGenerateSuccess} />
            </motion.div>
          )}

          {view === 'soal' && (
            <motion.div key="soal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
              </Button>
              <GeneratorSoal onSuccess={onGenerateSuccess} />
            </motion.div>
          )}

          {view === 'materi' && (
            <motion.div key="materi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
              </Button>
              <GeneratorMateri onSuccess={onGenerateSuccess} />
            </motion.div>
          )}

          {view === 'result' && (
            <motion.div key="result" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}>
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={handleBack} className="hover:bg-white -ml-4">
                  <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
                </Button>
                <div className="flex gap-2">
                   <Button variant="outline" onClick={() => setView(lastConfig?.type || 'dashboard')}>Edit Konfigurasi</Button>
                </div>
              </div>
              <ResultView content={generatedContent} config={lastConfig} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <footer className="border-t border-slate-200 bg-white py-12 mt-20 relative z-10">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-slate-500 font-medium tracking-tight">AI Pendidikan - Platform Penyusunan Perangkat Ajar Otomatis</p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400">
            <span>Kurikulum Merdeka</span>
            <span>Pembelajaran Mendalam (Deep Learning)</span>
            <span>HOTS Assessment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
