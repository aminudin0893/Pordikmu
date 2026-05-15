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
              <Zap className="text-white w-6 h-6 fill-white" />
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight tracking-tight">RPM AI</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold text-center">Portal Ekosistem</p>
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
              className="space-y-16"
            >
              <div className="text-center space-y-6 max-w-4xl mx-auto pt-10">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-indigo-500/10 to-blue-500/10 border border-indigo-100 dark:border-indigo-900/50 text-indigo-700 dark:text-indigo-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4"
                >
                  <Globe className="w-3.5 h-3.5 animate-spin-slow" /> Indonesia's Most Advanced AI Edu Ecosystem
                </motion.div>
                <h2 className="text-4xl sm:text-6xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.95]">
                  RPM AI <span className="text-transparent bg-clip-text bg-gradient-to-br from-indigo-600 to-blue-600 dark:from-indigo-400 dark:to-blue-400">PORTAL</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto text-base sm:text-lg md:text-xl leading-relaxed font-medium">
                  Transformasi ekosistem pendidikan dengan kecerdasan buatan. Susun perangkat ajar berstandar <span className="text-indigo-600 dark:text-indigo-400 font-bold">Kurikulum Merdeka</span> & <span className="text-indigo-600 dark:text-indigo-400 font-bold">Deep Learning</span> dalam hitungan detik.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <Card className="md:col-span-3 border-none shadow-2xl glass-effect p-8 flex flex-col md:flex-row items-center gap-8 rounded-[2.5rem] relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/5 rounded-full -mr-32 -mt-32 blur-3xl group-hover:bg-indigo-600/10 transition-all duration-700" />
                  <div className="shrink-0 w-24 h-24 bg-gradient-to-br from-indigo-600 to-blue-600 rounded-3xl flex items-center justify-center shadow-2xl shadow-indigo-200 relative z-10 animate-bounce-slow">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <div className="flex-grow space-y-4 w-full relative z-10">
                    <div className="space-y-1">
                      <Label className="text-xs font-black uppercase tracking-widest text-indigo-500 flex items-center gap-2">
                        <Zap className="w-3 h-3 fill-current" /> Personalized Intelligence
                      </Label>
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white">Aktivasi AI Engine Personal</h3>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-grow">
                        <Input 
                          id="gemini-api-key"
                          name="gemini-api-key"
                          type={showApiKey ? "text" : "password"}
                          placeholder="Masukkan Google Gemini API Key Anda..." 
                          className="bg-white/50 backdrop-blur-sm dark:bg-slate-950/50 pr-10 border-slate-200 dark:border-slate-800 h-13 rounded-2xl focus:ring-2 focus:ring-indigo-500 transition-all" 
                          value={userApiKey}
                          onChange={(e) => setUserApiKey(e.target.value)}
                        />
                        <button 
                          type="button"
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-600 transition-colors"
                          onClick={() => setShowApiKey(!showApiKey)}
                        >
                          {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                        </button>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          onClick={() => {
                            const trimmedKey = userApiKey.trim();
                            setUserApiKey(trimmedKey);
                            localStorage.setItem('user_gemini_key', trimmedKey);
                            toast.success("AI Engine Diaktifkan!");
                          }}
                          className="bg-slate-900 hover:bg-black dark:bg-white dark:hover:bg-slate-100 dark:text-slate-950 h-13 px-8 font-black text-sm uppercase tracking-widest rounded-2xl shadow-xl transition-all"
                        >
                          Aktifkan
                        </Button>
                      </div>
                    </div>
                    <p className="text-[10px] text-slate-400 font-bold italic flex items-center gap-1.5 underline-offset-4 decoration-indigo-500/30">
                      * RPM AI akan menggunakan AI Global jika API Key tidak diisi.
                    </p>
                  </div>
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
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3 + (idx * 0.1) } }}
                    whileHover={{ y: -10, scale: 1.02 }}
                    className="group"
                  >
                    <Card 
                      className="h-full border-none shadow-2xl shadow-indigo-100/50 dark:shadow-none transition-all cursor-pointer overflow-hidden flex flex-col items-center text-center p-8 bg-white dark:bg-slate-900 rounded-[2rem] border-b-4 border-transparent hover:border-indigo-600"
                      onClick={() => setView(item.id as ViewMode)}
                    >
                      <div className={`w-20 h-20 rounded-3xl flex items-center justify-center mb-8 transition-transform group-hover:rotate-6 bg-indigo-50 dark:bg-indigo-950/30 ring-8 ring-indigo-50/50 dark:ring-indigo-900/10`}>
                        {React.cloneElement(item.icon as React.ReactElement, { className: "w-10 h-10 " + (item.icon as React.ReactElement).props.className })}
                      </div>
                      <h3 className="text-2xl font-black mb-4 dark:text-white leading-tight">{item.title}</h3>
                      <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed mb-8 flex-grow font-medium">{item.description}</p>
                      <div className="w-full pt-4">
                        <Button className="w-full bg-indigo-600 hover:bg-black dark:bg-indigo-600 dark:hover:bg-indigo-700 text-white font-black text-xs uppercase tracking-widest h-12 rounded-xl transition-all shadow-lg">
                          {item.action}
                        </Button>
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 py-8 border-t border-slate-100 dark:border-slate-800 text-slate-400 text-xs font-bold uppercase tracking-widest">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" /> Global Portal
                </span>
                <span className="hidden sm:block">•</span>
                <span className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4" /> Curriculum Merdeka
                </span>
                <span className="hidden sm:block">•</span>
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Verified AI
                </span>
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
          <p className="text-slate-400 dark:text-slate-500 font-black text-[10px] uppercase tracking-[0.3em]">RPM AI - PORTAL EKOSISTEM PENDIDIKAN INDONESIA</p>
          <div className="flex items-center justify-center gap-8 text-[10px] font-black uppercase tracking-widest text-slate-300 dark:text-slate-600">
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Integrasi Pordik</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Portal Merdeka</span>
            <span className="hover:text-indigo-500 cursor-pointer transition-colors">Deep Learning Labs</span>
          </div>
          <p className="text-slate-300 dark:text-slate-700 text-[9px] pt-8">© 2024 Pordik Ecosystem. Seluruh Hak Cipta Dilindungi.</p>
        </div>
      </footer>
    </div>
  );
}
