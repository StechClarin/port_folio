import React, { useEffect } from 'react';
import { ArrowLeft, Download, ShieldCheck, Zap, Globe, HardDrive, Sparkles, MousePointer2, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import ethernanosPreview from '../assets/ethernanos.png';

const EthernanosDetail = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 overflow-hidden font-sans">
      {/* Dynamic Background Elements */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-violet-600/20 blur-[120px] rounded-full animate-pulse-slow"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full animate-pulse-slow" style={{ animationDelay: '2s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-12">
        {/* Navigation */}
        <nav className="flex justify-between items-center mb-16 animate-in fade-in slide-in-from-top duration-700">
          <Link 
            to="/" 
            className="flex items-center gap-2 group text-slate-400 hover:text-white transition-all"
          >
            <div className="p-2 bg-slate-800/50 rounded-lg border border-slate-700/50 group-hover:border-violet-500/50 transition-colors">
              <ArrowLeft size={18} />
            </div>
            <span className="text-sm font-medium tracking-tight">Retour à l'accueil</span>
          </Link>
          <div className="px-4 py-1.5 bg-violet-500/10 rounded-full border border-violet-500/20 text-violet-400 text-xs font-bold tracking-widest uppercase">
            Product Showcase
          </div>
        </nav>

        {/* Hero Section */}
        <div className="text-center mb-24 max-w-4xl mx-auto relative">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-64 h-64 bg-violet-500/10 blur-[80px] rounded-full animate-pulse"></div>
          
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-800/40 rounded-full border border-slate-700/50 text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] mb-8 animate-in fade-in duration-1000">
            <Sparkles size={12} className="text-yellow-400" /> Lancement de la V2.1
          </div>
          
          <h1 className="text-5xl md:text-8xl font-black mb-8 tracking-tighter leading-none animate-in slide-in-from-bottom duration-700">
            L'Intelligence qui <br />
            <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-blue-400 bg-clip-text text-transparent [text-shadow:0_10px_40px_rgba(139,92,246,0.3)]">
              Pilote votre Succès
            </span>
          </h1>
          
          <p className="text-lg md:text-2xl text-slate-400 leading-relaxed mb-12 max-w-2xl mx-auto animate-in fade-in duration-1000 delay-200">
            Le Hub EtherNanos unifie tous vos outils professionnels dans un centre de commande unique, ultra-rapide et d'une sécurité absolue.
          </p>

          <div className="flex flex-wrap justify-center gap-4 animate-in fade-in duration-1000 delay-300">
            <a href="#download" className="px-10 py-5 bg-white text-slate-900 rounded-2xl font-black text-lg hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] transition-all transform hover:-translate-y-1 active:scale-95">
              Découvrir le Hub
            </a>
            <div className="flex items-center gap-6 px-8 py-5 bg-slate-800/40 backdrop-blur-md rounded-2xl border border-slate-700/50">
              <div className="flex -space-x-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className={`w-8 h-8 rounded-full border-2 border-slate-900 bg-slate-700 bg-cover bg-center shadow-lg`} style={{ backgroundImage: `url(https://i.pravatar.cc/100?u=${i})` }}></div>
                ))}
              </div>
              <span className="text-sm font-bold text-slate-300">Rejoint par +150 entreprises</span>
            </div>
          </div>
        </div>

        {/* Feature Visual */}
        <div className="relative mb-40 animate-in zoom-in duration-1000 delay-500">
          <div className="absolute inset-0 bg-violet-600/10 blur-[120px] rounded-full"></div>
          <div className="relative z-10 p-4 bg-slate-800/20 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 shadow-2xl">
            <img 
              src={ethernanosPreview} 
              alt="Dashboard Preview" 
              className="w-full h-auto rounded-[2rem] shadow-black/50 shadow-2xl"
            />
            {/* Floating Info Badges */}
            <div className="absolute top-1/4 -left-12 hidden lg:flex items-center gap-3 p-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow">
              <div className="p-2 bg-green-500/20 rounded-lg"><RefreshCw className="text-green-400 animate-spin-slow" size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Temps de Réponse</p>
                <p className="text-sm font-bold">0.02ms (Ultra-Rapide)</p>
              </div>
            </div>
            <div className="absolute bottom-1/3 -right-12 hidden lg:flex items-center gap-3 p-4 bg-slate-900/90 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow" style={{ animationDelay: '1.5s' }}>
              <div className="p-2 bg-blue-500/20 rounded-lg"><ShieldCheck className="text-blue-400" size={20} /></div>
              <div>
                <p className="text-[10px] uppercase font-black text-slate-500 tracking-widest">Protection Totale</p>
                <p className="text-sm font-bold">Vérifié & Sécurisé</p>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Benefits (The "Simpler Terms") */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-40">
          <div className="group relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-violet-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <div className="relative">
              <Zap className="text-violet-500 mb-8" size={48} strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-4">Un Seul QG Unique</h3>
              <p className="text-slate-400 leading-relaxed">
                Plus besoin de chercher vos outils. Toutes vos applications professionnelles sont réunies au même endroit, prêtes à l'action d'un simple clic.
              </p>
            </div>
          </div>
          <div className="group relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <div className="relative">
              <Globe className="text-blue-500 mb-8" size={48} strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-4">Adieu les Pertes de Connexion</h3>
              <p className="text-slate-400 leading-relaxed">
                Travaillez sur le terrain ou au bureau. Le Hub sauvegarde tout sur votre machine et synchronise avec le cloud dès que vous êtes en ligne.
              </p>
            </div>
          </div>
          <div className="group relative">
            <div className="absolute -inset-4 bg-gradient-to-b from-fuchsia-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-3xl"></div>
            <div className="relative">
              <HardDrive className="text-fuchsia-500 mb-8" size={48} strokeWidth={2.5} />
              <h3 className="text-2xl font-bold mb-4">Sérénité Absolue</h3>
              <p className="text-slate-400 leading-relaxed">
                Reposez-vous sur une technologie qui vérifie chaque centimètre de vos logiciels. Pas de virus, pas de pannes, juste une fluidité parfaite.
              </p>
            </div>
          </div>
        </div>

        {/* Call to Action (The Final Wow) */}
        <section id="download" className="relative group overflow-hidden bg-gradient-to-br from-violet-600 to-blue-700 py-24 rounded-[4rem] px-8 text-center shadow-[0_40px_100px_rgba(124,58,237,0.3)]">
          <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
          <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 blur-[100px] rounded-full"></div>
          <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-black/20 blur-[100px] rounded-full"></div>
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-black mb-8 text-white tracking-tight">
              Prenez les commandes. <br />
              <span className="text-violet-200">Maintenant.</span>
            </h2>
            <p className="text-xl text-violet-100/80 mb-12 font-medium">
              Rejoignez l'élite des entreprises qui ont choisi EtherNanos pour propulser leur productivité.
            </p>
            
            <div className="flex flex-wrap justify-center gap-6">
              <button className="group/btn flex items-center gap-4 px-10 py-5 bg-white text-slate-900 rounded-3xl font-black text-xl hover:scale-105 transition-all shadow-2xl">
                <Download size={24} className="group-hover/btn:translate-y-1 transition-transform" />
                Installer sur Windows
              </button>
              <button className="group/btn flex items-center gap-4 px-10 py-5 bg-slate-900 text-white rounded-3xl font-black text-xl hover:bg-slate-800 transition-all border border-white/10">
                <Download size={24} className="group-hover/btn:translate-y-1 transition-transform" />
                Version Linux
              </button>
            </div>
            
            <p className="mt-12 text-violet-200/50 text-[10px] font-black uppercase tracking-[0.4em]">
              Sûr | Vérifié | Prêt pour le futur
            </p>
          </div>
        </section>
      </div>

      {/* Animation Styles */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes pulse-slow {
          0%, 100% { transform: scale(1); opacity: 0.1; }
          50% { transform: scale(1.1); opacity: 0.2; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-pulse-slow { animation: pulse-slow 8s ease-in-out infinite; }
        .animate-spin-slow { animation: spin-slow 4s linear infinite; }
        .animate-bounce-slow { animation: bounce-slow 4s ease-in-out infinite; }
      `}} />
    </div>
  );
};

export default EthernanosDetail;
