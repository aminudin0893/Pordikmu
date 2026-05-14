import React, { useState, useEffect } from 'react';
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
  AlertCircle,
  Eye,
  EyeOff,
  Save,
  Brain,
  CheckCircle,
  Trash2,
  Sun,
  Moon
} from 'lucide-react';
import { Button } from './components/ui/button';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './components/ui/card';
import { Toaster, toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./components/ui/dialog";
import { Progress } from "./components/ui/progress";

// Components
import GeneratorRPP from './components/GeneratorRPP';
import GeneratorSoal from './components/GeneratorSoal';
import GeneratorMateri from './components/GeneratorMateri';
import ResultView from './components/ResultView';

type ViewMode = 'login' | 'dashboard' | 'rpp' | 'materi' | 'soal' | 'result';

export default function App() {
  const [view, setView] = useState<ViewMode>('login');
  const [pin, setPin] = useState('');
  const [userApiKey, setUserApiKey] = useState(localStorage.getItem('user_gemini_key') || '');
  const [showApiKey, setShowApiKey] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [lastConfig, setLastConfig] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [theme, setTheme] = useState<'light' | 'dark'>(
    (localStorage.getItem('app-theme') as 'light' | 'dark') || 'light'
  );

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  React.useEffect(() => {
    let interval: any;
    if (isLoading) {
      setProgress(0);
      interval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) return prev;
          return prev + Math.floor(Math.random() * 5) + 2;
        });
      }, 400);
    } else {
      setProgress(100);
    }
    return () => clearInterval(interval);
  }, [isLoading]);

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
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4 transition-colors duration-300">
        <Toaster position="top-center" richColors />
        <Card className="w-full max-w-md border-none shadow-2xl overflow-hidden rounded-2xl md:rounded-3xl dark:bg-slate-900">
          <CardHeader className="bg-indigo-600 text-white p-6 md:p-8 text-center">
            <div className="flex justify-end absolute top-4 right-4">
               <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
                className="text-white hover:bg-white/20 rounded-full"
              >
                {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
              </Button>
            </div>
            <GraduationCap className="w-10 h-10 md:w-12 md:h-12 mx-auto mb-2" />
            <CardTitle className="text-xl md:text-2xl font-black">LOGIN PENGGUNA</CardTitle>
            <CardDescription className="text-indigo-100 text-xs md:text-sm">Masukkan Kode Akses PIN Anda</CardDescription>
          </CardHeader>
          <CardContent className="p-6 md:p-8">
            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="login-pin" className="text-xs md:text-sm font-bold text-slate-500 uppercase tracking-wider">Kode PIN Akses</Label>
                <Input 
                  id="login-pin" 
                  name="login-pin"
                  type="password" 
                  autoComplete="current-password"
                  placeholder="••••••" 
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="text-center text-xl md:text-2xl tracking-[0.5em] md:tracking-[1em] h-12 md:h-14 font-black border-slate-200 focus:border-indigo-500 transition-all"
                  maxLength={6}
                />
              </div>
              <Button type="submit" className="w-full h-11 md:h-12 bg-indigo-600 hover:bg-indigo-700 font-bold text-base md:text-lg shadow-lg shadow-indigo-100 transition-all active:scale-[0.98]">
                Masuk ke Aplikasi
              </Button>
            </form>
            <p className="text-center mt-6 text-[10px] md:text-xs text-slate-400 font-medium">
              Gunakan PIN yang telah diberikan oleh operator sistem.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-100 selection:text-indigo-900 transition-colors duration-300">
      <Toaster position="top-center" richColors />
      
      {/* Decorative background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-50 dark:bg-indigo-900/10 rounded-full blur-3xl opacity-50" />
        <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-50 dark:bg-blue-900/10 rounded-full blur-3xl opacity-50" />
      </div>

      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 no-print">
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
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="rounded-full"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5 text-yellow-400" />}
            </Button>
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
                <h2 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight">
                  APLIKASI GENERATOR <span className="text-indigo-600 dark:text-indigo-400">AI PENDIDIKAN</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-sm sm:text-base md:text-lg leading-relaxed">
                  Pilih menu aplikasi di bawah ini untuk menyusun perangkat ajar Anda secara otomatis. 
                  <span className="block font-bold mt-1 text-indigo-500 dark:text-indigo-400">Support Kurikulum Merdeka dan Pembelajaran Mendalam.</span>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-3 border-none shadow-lg bg-indigo-50 dark:bg-indigo-900/20 p-6 flex flex-col sm:flex-row items-center gap-4">
                  <div className="flex-grow space-y-2 w-full">
                    <Label className="font-bold flex items-center gap-2">
                      <Zap className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Masukkan API Key Gemini (Opsional)
                    </Label>
                    <div className="flex gap-2">
                      <div className="relative flex-grow">
                        <Input 
                          id="gemini-api-key"
                          name="gemini-api-key"
                          type={showApiKey ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="AI_Studio_API_Key..." 
                          className="bg-white dark:bg-slate-950 pr-10 border-indigo-100 dark:border-indigo-900/50" 
                          value={userApiKey}
                          onChange={(e) => setUserApiKey(e.target.value)}
                        />
                        <button 
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            const trimmedKey = userApiKey.trim();
                            setUserApiKey(trimmedKey);
                            localStorage.setItem('user_gemini_key', trimmedKey);
                            toast.success("API Key Berhasil Disimpan!");
                          }}
                          className="bg-indigo-600 hover:bg-indigo-700"
                        >
                          <Save className="w-4 h-4 mr-2" /> Simpan
                        </Button>
                        {userApiKey && (
                          <Button 
                            variant="outline"
                            onClick={() => {
                              setUserApiKey('');
                              localStorage.removeItem('user_gemini_key');
                              toast.info("API Key Berhasil Dihapus");
                            }}
                            className="text-red-500 border-red-100 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
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
                      className="h-full border-2 border-transparent hover:border-indigo-100 dark:hover:border-indigo-900 shadow-xl shadow-slate-100 dark:shadow-none hover:shadow-indigo-100 dark:hover:shadow-indigo-900/20 transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center p-6 bg-white dark:bg-slate-900"
                      onClick={() => setView(item.id as ViewMode)}
                    >
                      <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110`} 
                           style={{ backgroundColor: theme === 'dark' ? 'rgba(99, 102, 241, 0.1)' : `var(--${item.color}-50, #f8fafc)` }}>
                        {item.icon}
                      </div>
                      <h3 className="text-xl font-bold mb-3 dark:text-white">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow">{item.description}</p>
                      <Button variant="ghost" className={`text-${item.color}-600 dark:text-${item.color}-400 font-bold group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/30 transition-colors`}>
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
              <GeneratorRPP onSuccess={onGenerateSuccess} onLoading={setIsLoading} />
            </motion.div>
          )}

          {view === 'soal' && (
            <motion.div key="soal" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
              </Button>
              <GeneratorSoal onSuccess={onGenerateSuccess} onLoading={setIsLoading} />
            </motion.div>
          )}

          {view === 'materi' && (
            <motion.div key="materi" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <Button variant="ghost" onClick={handleBack} className="mb-6 hover:bg-white -ml-4">
                <ArrowLeft className="w-4 h-4 mr-2" /> Kembali ke Menu Utama
              </Button>
              <GeneratorMateri onSuccess={onGenerateSuccess} onLoading={setIsLoading} />
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

        <Dialog open={isLoading} onOpenChange={() => {}}>
          <DialogContent className="sm:max-w-md border-none shadow-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
            <DialogHeader>
              <DialogTitle className="text-center flex flex-col items-center gap-4 py-4">
                <div className="relative">
                  <div className="w-20 h-20 border-4 border-indigo-100 dark:border-indigo-900/30 border-t-indigo-600 rounded-full animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Brain className="w-8 h-8 text-indigo-600 animate-pulse" />
                  </div>
                </div>
                <div className="space-y-1">
                  <h3 className="text-xl font-black text-slate-900 dark:text-white">Sedang Memproses...</h3>
                  <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">Gemini AI sedang menyusun dokumen terbaik untuk Anda.</p>
                </div>
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-6 pb-8">
              <div className="space-y-2">
                <div className="flex justify-between text-sm font-bold">
                  <span className="text-indigo-600 dark:text-indigo-400">Progress</span>
                  <span className="text-slate-900 dark:text-white">{progress}%</span>
                </div>
                <Progress value={progress} className="h-3 bg-indigo-50 dark:bg-slate-800" />
              </div>
              <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 space-y-3">
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle className={`w-4 h-4 ${progress > 20 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span>Menganalisis Kurikulum & Tujuan</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle className={`w-4 h-4 ${progress > 55 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span>Menyusun Narasi & Item Dokumen</span>
                 </div>
                 <div className="flex items-center gap-3 text-xs font-bold text-slate-600 dark:text-slate-300">
                    <CheckCircle className={`w-4 h-4 ${progress > 85 ? 'text-emerald-500' : 'text-slate-300 dark:text-slate-700'}`} />
                    <span>Finalisasi Format Siap Cetak (A4)</span>
                 </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </main>

      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 py-12 mt-20 relative z-10 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
          <p className="text-slate-500 dark:text-slate-400 font-medium tracking-tight">AI Pendidikan - Platform Penyusunan Perangkat Ajar Otomatis</p>
          <div className="flex items-center justify-center gap-6 text-sm text-slate-400 dark:text-slate-500">
            <span>Kurikulum Merdeka</span>
            <span>Pembelajaran Mendalam (Deep Learning)</span>
            <span>HOTS Assessment</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
