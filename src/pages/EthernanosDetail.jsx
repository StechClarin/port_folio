import React, { useEffect, useState } from 'react';
import { ArrowLeft, ShieldCheck, RefreshCw, LayoutGrid, Cpu, CloudDownload, Server, Download, Lock, Zap } from 'lucide-react';
import { Link } from 'react-router-dom';
import logoEthernanos from '../assets/ethernanos-hub.png';
import ethernanosIcon from '../assets/ethernanos-icon.png';
import { useLanguage } from '../context/LanguageContext';
import FooterEthernanos from '../components/FooterEthernanos';
import ParticleBackground from '../components/ParticleBackground';
import { supabase } from '../lib/supabaseClient';

const EthernanosDetail = () => {
  const { language } = useLanguage();

  const [storeApps, setStoreApps] = useState([]);

  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchApps = async () => {
      try {
        const { data, error } = await supabase
          .from('apps')
          .select('*')
          .eq('is_active', true)
          .order('created_at', { ascending: false });
        if (!error && data) {
          setStoreApps(data);
        }
      } catch (err) {
        console.error('Error fetching apps:', err);
      }
    };
    fetchApps();
  }, []);

  const features = [
    {
      icon: <LayoutGrid className="text-violet-400" size={28} />,
      title: language === 'fr' ? 'Store & Déploiement' : 'Store & Deployment',
      description: language === 'fr' 
        ? "Expérience 'App Store' unifiée. Installez vos applications métier d'un clic, le Hub gère automatiquement la création de l'environnement sécurisé associé." 
        : "Unified 'App Store' experience. Install business apps with a click, the Hub automatically handles local secure environment creation.",
      color: "from-violet-500/20 to-violet-500/0",
      border: "border-violet-500/30"
    },
    {
      icon: <RefreshCw className="text-blue-400" size={28} />,
      title: language === 'fr' ? 'Synchronisation Intelligente' : 'Smart Synchronization',
      description: language === 'fr'
        ? "Système de Health Polling avancé. Les données ne sont synchronisées que lorsque le serveur local est 100% prêt, garantissant aucune perte de données."
        : "Advanced Health Polling system. Data is only synchronized when the local server is 100% ready, guaranteeing zero data loss.",
      color: "from-blue-500/20 to-blue-500/0",
      border: "border-blue-500/30"
    },
    {
      icon: <ShieldCheck className="text-emerald-400" size={28} />,
      title: language === 'fr' ? 'Intégrité SHA-256' : 'SHA-256 Integrity',
      description: language === 'fr'
        ? "Sécurité absolue. Le moteur central recalcule et vérifie l'empreinte cryptographique de chaque exécutable téléchargé avant son exécution."
        : "Absolute security. The core engine recalculates and verifies the cryptographic footprint of every downloaded executable before running it.",
      color: "from-emerald-500/20 to-emerald-500/0",
      border: "border-emerald-500/30"
    },
    {
      icon: <Server className="text-fuchsia-400" size={28} />,
      title: language === 'fr' ? 'Architecture Cloud-to-Local' : 'Cloud-to-Local Architecture',
      description: language === 'fr'
        ? "La puissance du Cloud, la fiabilité du Local. Continuez à travailler hors-ligne, le Hub synchronisera vos données dès le retour de la connexion."
        : "The power of the Cloud, the reliability of Local. Keep working offline, the Hub will sync your data as soon as connection is restored.",
      color: "from-fuchsia-500/20 to-fuchsia-500/0",
      border: "border-fuchsia-500/30"
    },
    {
      icon: <CloudDownload className="text-amber-400" size={28} />,
      title: language === 'fr' ? 'Mises à Jour Silencieuses' : 'Silent Updates',
      description: language === 'fr'
        ? "Le Hub se met à jour automatiquement en arrière-plan sans perturber votre travail. Une notification subtile vous prévient de la nouveauté."
        : "The Hub automatically updates in the background without disrupting your workflow. A subtle notification alerts you of new features.",
      color: "from-amber-500/20 to-amber-500/0",
      border: "border-amber-500/30"
    },
    {
      icon: <Cpu className="text-rose-400" size={28} />,
      title: language === 'fr' ? 'Ports Dynamiques & Always-On' : 'Dynamic Ports & Always-On',
      description: language === 'fr'
        ? "Gestion automatisée des conflits réseaux (Manifest-Driven). Conçu pour être toujours actif avec une empreinte mémoire quasi inexistante et des performances optimales."
        : "Automated network conflict management (Manifest-Driven). Designed to be always-on with an almost non-existent memory footprint and optimal performance.",
      color: "from-rose-500/20 to-rose-500/0",
      border: "border-rose-500/30"
    }
  ];

  return (
    <div className="min-h-screen bg-[#030305] text-slate-100 overflow-hidden font-sans selection:bg-violet-500/30 selection:text-white">
      {/* Dynamic Background Elements - Warp Speed Effect & Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        {/* Particle Warp Speed Effect */}
        <ParticleBackground />
        
        {/* Subtle glows over the particles */}
        <div className="absolute top-[-20%] left-[-10%] w-[60%] h-[60%] bg-violet-600/10 blur-[150px] rounded-full animate-pulse-slow mix-blend-screen"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] bg-blue-600/10 blur-[150px] rounded-full animate-pulse-slow mix-blend-screen" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 md:py-12">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16 md:mb-24 animate-in fade-in slide-in-from-top duration-700">
          <div className="flex items-center gap-3 text-white">
            <img src={ethernanosIcon} alt="EtherNanos Logo" className="w-8 h-8 md:w-10 md:h-10 object-contain drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]" />
            <span className="text-xl md:text-2xl font-black tracking-tighter">
              EtherNanos <span className="text-violet-500">Hub</span>
            </span>
          </div>
          <div className="flex items-center gap-2 px-4 py-1.5 bg-violet-500/10 backdrop-blur-md rounded-full border border-violet-500/20 text-violet-400 text-xs font-black tracking-widest uppercase">
            <Zap size={14} className="text-violet-400" /> V 2.0
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-24 max-w-5xl mx-auto relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/20 blur-[120px] rounded-full animate-pulse pointer-events-none"></div>
          
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black mb-8 tracking-tighter leading-[1.1] animate-in slide-in-from-bottom duration-700 relative z-10">
            {language === 'fr' ? (
              <>Le <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]">Command Center</span><br />
                de vos Applications
              </>
            ) : (
              <>The <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent drop-shadow-[0_0_40px_rgba(139,92,246,0.5)]">Command Center</span><br />
                for your Applications
              </>
            )}
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 leading-relaxed mb-12 max-w-3xl mx-auto animate-in fade-in duration-1000 delay-200 font-medium">
            {language === 'fr' 
              ? "EtherNanos Hub 2.0 est la plateforme Cloud-to-Local ultime. Une architecture hybride de pointe qui déploie vos applications métier avec la simplicité d'un App Store et la sécurité d'une forteresse."
              : "EtherNanos Hub 2.0 is the ultimate Cloud-to-Local platform. A cutting-edge hybrid architecture that deploys your business apps with App Store simplicity and fortress-level security."}
          </p>

          <div className="flex flex-wrap justify-center gap-5 animate-in fade-in duration-1000 delay-300">
            <a href="#features" className="px-8 py-4 bg-white text-black rounded-2xl font-black text-sm md:text-base uppercase tracking-widest hover:shadow-[0_0_40px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1 active:scale-95">
              {language === 'fr' ? 'Découvrir la Technologie' : 'Discover the Technology'}
            </a>
            <a href="#download" className="group flex items-center gap-3 px-8 py-4 bg-slate-900/50 backdrop-blur-md rounded-2xl border border-white/10 font-bold text-sm md:text-base text-white hover:bg-slate-800 transition-all">
              <Download size={20} className="text-slate-400 group-hover:text-white transition-colors group-hover:-translate-y-1 duration-300" />
              {language === 'fr' ? 'Télécharger' : 'Download'}
            </a>
          </div>

        </div>

        {/* Apps Slider Banner */}
        <div className="mt-20 overflow-hidden relative w-full border-y border-white/5 bg-slate-900/20 backdrop-blur-sm py-8 animate-in fade-in duration-1000 delay-500 mb-24 md:mb-32">
          <div className="absolute inset-y-0 left-0 w-24 md:w-48 bg-gradient-to-r from-[#030305] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute inset-y-0 right-0 w-24 md:w-48 bg-gradient-to-l from-[#030305] to-transparent z-10 pointer-events-none"></div>
          
          <div className="text-center mb-8">
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">
              {language === 'fr' ? 'Écosystème : Les Applications Les Plus Déployées' : 'Ecosystem: Most Deployed Applications'}
            </p>
          </div>

          <div className="flex w-max animate-marquee hover:[animation-play-state:paused]">
            {storeApps.length > 0 ? (
              [...Array(4)].map((_, idx) => (
                <div key={idx} className="flex items-center gap-8 px-4">
                  {storeApps.map((app, i) => (
                    <div key={i} className="flex flex-col w-64 md:w-72 bg-white/5 backdrop-blur-md rounded-3xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.5)] hover:bg-white/10 hover:border-violet-500/30 transition-all duration-300 cursor-pointer group overflow-hidden">
                      {/* Card Image Header */}
                      <div className="h-32 w-full bg-[#0a0a0f] relative overflow-hidden">
                        {app.banner_url ? (
                           <img src={app.banner_url} alt={app.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" />
                        ) : (
                           <div className="w-full h-full bg-gradient-to-br from-violet-900/30 to-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform duration-700">
                              <LayoutGrid size={32} className="text-white/20" />
                           </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-[#030305] to-transparent opacity-90"></div>
                        
                        {/* Icon Overlapping */}
                        <div className="absolute bottom-4 left-5">
                           <div className="w-12 h-12 rounded-xl bg-[#030305] border border-white/10 shadow-xl flex items-center justify-center overflow-hidden p-2 group-hover:-translate-y-1 transition-transform duration-300">
                             {app.icon_svg ? (
                               <div dangerouslySetInnerHTML={{ __html: app.icon_svg }} className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
                             ) : (
                               <LayoutGrid size={20} className="text-violet-400" />
                             )}
                           </div>
                        </div>
                      </div>

                      {/* Card Body */}
                      <div className="p-5 pt-3 flex flex-col gap-1.5">
                        <span className="text-xl font-black tracking-wide text-white group-hover:text-violet-300 transition-colors">{app.name}</span>
                        {app.builder ? (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                            By {app.builder}
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 opacity-0">
                             Placeholder
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="flex items-center gap-8 px-4 opacity-50">
                <span className="text-sm text-slate-500 font-bold tracking-widest uppercase">
                  {language === 'fr' ? "Chargement de l'écosystème..." : "Loading ecosystem..."}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Dashboard Visual Mockup / Interface Presentation */}
        <div className="relative mb-32 md:mb-48 animate-in zoom-in duration-1000 delay-500">
          <div className="absolute inset-0 bg-gradient-to-t from-[#030305] via-transparent to-transparent z-20 h-full w-full bottom-0 top-1/2"></div>
          <div className="relative z-10 p-2 md:p-4 bg-white/5 backdrop-blur-3xl rounded-[2rem] border border-white/10 shadow-[0_0_100px_rgba(139,92,246,0.15)] group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000"></div>
            
            {/* Top Bar MacOS style */}
            <div className="h-8 md:h-12 w-full bg-slate-900/50 rounded-t-[1.5rem] border-b border-white/5 flex items-center px-4 md:px-6 gap-2 mb-2 md:mb-4">
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-rose-500"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-amber-500"></div>
              <div className="w-2.5 h-2.5 md:w-3 md:h-3 rounded-full bg-emerald-500"></div>
              <div className="mx-auto flex items-center gap-2 opacity-50">
                <Lock size={12} /> <span className="text-[10px] md:text-xs font-mono">ethernanos-hub.local</span>
              </div>
            </div>

            <img 
              src={logoEthernanos} 
              alt="EtherNanos Dashboard" 
              className="w-full h-auto rounded-[1rem] shadow-2xl relative z-10"
            />

          </div>

          {/* Floating Tech Badges - 100% Responsive */}
          {/* Badge 1: Top Left */}
          <div className="absolute top-2 sm:top-1/4 left-2 sm:-left-6 md:-left-12 z-30 flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-slate-900/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow scale-[0.6] sm:scale-75 md:scale-100 origin-top-left">
            <div className="p-2 sm:p-3 bg-emerald-500/20 rounded-lg sm:rounded-xl"><ShieldCheck className="text-emerald-400 w-4 h-4 sm:w-6 sm:h-6" /></div>
            <div>
              <p className="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-widest">Core Engine</p>
              <p className="text-[10px] sm:text-sm font-bold text-white">SHA-256 Validated</p>
            </div>
          </div>

          {/* Badge 2: Bottom Right */}
          <div className="absolute bottom-2 sm:bottom-1/4 right-2 sm:-right-6 md:-right-12 z-30 flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-slate-900/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow scale-[0.6] sm:scale-75 md:scale-100 origin-bottom-right" style={{ animationDelay: '1.5s' }}>
            <div className="p-2 sm:p-3 bg-blue-500/20 rounded-lg sm:rounded-xl"><RefreshCw className="text-blue-400 animate-spin-slow w-4 h-4 sm:w-6 sm:h-6" /></div>
            <div>
              <p className="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-widest">Health Polling</p>
              <p className="text-[10px] sm:text-sm font-bold text-white">Sync 100% Fiable</p>
            </div>
          </div>

          {/* Badge 3: Top Right */}
          <div className="absolute top-[25%] sm:top-1/3 right-2 sm:-right-8 md:-right-16 z-30 flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-slate-900/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow scale-[0.6] sm:scale-75 md:scale-100 origin-top-right" style={{ animationDelay: '0.7s' }}>
            <div className="p-2 sm:p-3 bg-amber-500/20 rounded-lg sm:rounded-xl"><CloudDownload className="text-amber-400 w-4 h-4 sm:w-6 sm:h-6" /></div>
            <div>
              <p className="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-widest">Offline-First</p>
              <p className="text-[10px] sm:text-sm font-bold text-white">Cloud-to-Local</p>
            </div>
          </div>

          {/* Badge 4: Bottom Left */}
          <div className="absolute bottom-[25%] sm:bottom-1/3 left-2 sm:-left-8 md:-left-16 z-30 flex items-center gap-2 sm:gap-4 p-2 sm:p-4 bg-slate-900/90 backdrop-blur-2xl rounded-xl sm:rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow scale-[0.6] sm:scale-75 md:scale-100 origin-bottom-left" style={{ animationDelay: '2.2s' }}>
            <div className="p-2 sm:p-3 bg-fuchsia-500/20 rounded-lg sm:rounded-xl"><LayoutGrid className="text-fuchsia-400 w-4 h-4 sm:w-6 sm:h-6" /></div>
            <div>
              <p className="text-[8px] sm:text-[10px] uppercase font-black text-slate-400 tracking-widest">App Store</p>
              <p className="text-[10px] sm:text-sm font-bold text-white">One-Click Deploy</p>
            </div>
          </div>
        </div>

        {/* Features Bento Grid */}
        <section id="features" className="mb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-6 tracking-tight">
              {language === 'fr' ? "L'Excellence" : "Engineering"} <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 to-blue-400">Technologique</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto text-lg">
              {language === 'fr' 
                ? "Une architecture pensée pour la robustesse, la sécurité et l'expérience utilisateur sans compromis." 
                : "An architecture designed for uncompromising robustness, security, and user experience."}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 relative z-10">
            {features.map((feature, idx) => (
              <div 
                key={idx} 
                className="group relative bg-slate-800/95 backdrop-blur-3xl rounded-3xl p-8 border border-white/20 hover:border-white/40 hover:shadow-[0_0_50px_rgba(139,92,246,0.3)] transition-all duration-500 hover:-translate-y-2 overflow-hidden shadow-[0_15px_50px_rgba(0,0,0,0.6)]"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-20 group-hover:opacity-100 transition-opacity duration-500`}></div>
                
                {/* Subtle highlight line at top of card */}
                <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-white/40 to-transparent"></div>

                <div className="relative z-10">
                  <div className="w-14 h-14 rounded-2xl bg-slate-900 border border-white/30 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500 shadow-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-black mb-4 text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-slate-100">
                    {feature.title}
                  </h3>
                  <p className="text-slate-200 leading-relaxed group-hover:text-white transition-colors font-semibold">
                    {feature.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Section */}
        <section id="download" className="relative group overflow-hidden bg-gradient-to-br from-violet-600/20 to-blue-600/20 backdrop-blur-xl border border-white/10 py-24 rounded-[3rem] px-8 text-center">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10 mix-blend-overlay"></div>
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-violet-500 to-transparent opacity-50"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight">
              {language === 'fr' ? 'Passez à la Vitesse Supérieure.' : 'Step up to the Next Level.'}
            </h2>
            <p className="text-xl text-slate-300 mb-12 font-medium">
              {language === 'fr' 
                ? "Rejoignez le futur des applications d'entreprise. Sécurisé, synchronisé, et toujours prêt."
                : "Join the future of enterprise applications. Secured, synchronized, and always ready."}
            </p>
            
            {/* Desktop Download Buttons */}
            <div className="hidden md:flex flex-wrap justify-center gap-4 mt-8">
              <a href="https://github.com/StechClarin/DesktopLauncherApp/releases/download/v1.0.50/EtherNanos.Hub_0.1.0_x64-setup.exe" className="group/btn flex items-center gap-3 px-6 py-4 bg-white text-slate-900 rounded-2xl font-black text-sm uppercase tracking-widest hover:scale-105 transition-all shadow-[0_0_30px_rgba(255,255,255,0.2)] hover:shadow-[0_0_50px_rgba(255,255,255,0.4)] w-full sm:w-auto justify-center">
                <Download size={20} className="group-hover/btn:-translate-y-1 transition-transform" />
                Windows (.exe)
              </a>
              
              <a href="https://github.com/StechClarin/DesktopLauncherApp/releases/download/v1.0.50/EtherNanos.Hub_0.1.0_universal.dmg" className="group/btn flex items-center gap-3 px-6 py-4 bg-slate-800 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-700 hover:scale-105 transition-all border border-white/10 w-full sm:w-auto justify-center shadow-lg">
                <Download size={20} className="text-slate-400 group-hover/btn:text-white group-hover/btn:-translate-y-1 transition-all" />
                macOS (.dmg)
              </a>

              <a href="https://github.com/StechClarin/DesktopLauncherApp/releases/download/v1.0.50/EtherNanos.Hub_0.1.0_amd64.deb" className="group/btn flex items-center gap-3 px-6 py-4 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 hover:scale-105 transition-all border border-white/10 w-full sm:w-auto justify-center shadow-lg">
                <Download size={20} className="text-slate-500 group-hover/btn:text-white group-hover/btn:-translate-y-1 transition-all" />
                Linux (.deb)
              </a>

              <a href="https://github.com/StechClarin/DesktopLauncherApp/releases/download/v1.0.50/EtherNanos.Hub_universal.app.tar.gz" className="group/btn flex items-center gap-3 px-6 py-4 bg-slate-900/50 text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-slate-800 hover:scale-105 transition-all border border-white/5 w-full sm:w-auto justify-center">
                <Download size={20} className="text-slate-600 group-hover/btn:text-white group-hover/btn:-translate-y-1 transition-all" />
                Linux (.tar.gz)
              </a>
            </div>

            {/* Mobile Fallback Message */}
            <div className="md:hidden mt-8 p-6 bg-slate-900/50 border border-white/10 rounded-2xl">
              <p className="text-slate-300 font-medium text-sm">
                {language === 'fr' 
                  ? "🖥️ L'application EtherNanos Hub est conçue pour les ordinateurs de bureau. Veuillez visiter cette page depuis un PC, un Mac ou un appareil Linux pour télécharger le logiciel."
                  : "🖥️ The EtherNanos Hub application is designed for desktop computers. Please visit this page from a PC, Mac, or Linux device to download the software."}
              </p>
            </div>
          </div>
        </section>
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.5; }
          50% { transform: scale(1.1); opacity: 0.8; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        @keyframes marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 8s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 6s ease-in-out infinite; }
        .animate-marquee { animation: marquee 30s linear infinite; }
      `}} />
      <FooterEthernanos />
    </div>
  );
};

export default EthernanosDetail;
