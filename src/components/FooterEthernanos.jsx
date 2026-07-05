import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { Link } from 'react-router-dom';

const FooterEthernanos = () => {
  const [formStatus, setFormStatus] = useState('');
  const { language } = useLanguage();
  const contactEmail = 'ethernanoshub@gmail.com';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus(language === 'fr' ? 'Envoi en cours...' : 'Sending...');

    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name'),
      email: formData.get('email'),
      content: formData.get('message'),
      subject: `Ethernanos Hub Contact - ${language.toUpperCase()}`,
    };

    try {
      const { error } = await supabase.from('messages').insert([messageData]);
      if (error) throw error;

      setFormStatus(language === 'fr' ? 'Message envoyé avec succès !' : 'Message sent successfully!');
      e.target.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus(language === 'fr' ? "Erreur lors de l'envoi." : "Error while sending.");
    } finally {
      setTimeout(() => setFormStatus(''), 3000);
    }
  };

  return (
    <footer className="relative mt-32 bg-[#050508] text-gray-300 py-16 px-6 md:px-12 border-t border-white/5">
      <div className="absolute inset-0 bg-gradient-to-t from-violet-900/10 to-transparent pointer-events-none"></div>
      
      <div className="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-16">
        
        {/* --- Colonne 1: Présentation --- */}
        <div className="space-y-6">
          <h3 className="text-2xl font-black text-white tracking-tighter">
            EtherNanos <span className="text-violet-500">Hub</span>
          </h3>
          <p className="text-slate-400 leading-relaxed">
            {language === 'fr' 
              ? "La plateforme Cloud-to-Local ultime pour déployer, sécuriser et synchroniser vos applications d'entreprise avec une efficacité inégalée."
              : "The ultimate Cloud-to-Local platform to deploy, secure, and synchronize your enterprise applications with unmatched efficiency."}
          </p>
          <div className="pt-4 border-t border-white/10">
            <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-3">
              {language === 'fr' ? 'Nous Contacter' : 'Contact Us'}
            </h4>
            <a href={`mailto:${contactEmail}`} className="inline-block text-violet-400 hover:text-violet-300 transition-colors font-medium">
              {contactEmail}
            </a>
          </div>
        </div>

        {/* --- Colonne 2: Formulaire de Contact --- */}
        <div className="lg:col-span-1">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
            {language === 'fr' ? 'Laissez un message' : 'Leave a message'}
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder={language === 'fr' ? 'Votre Nom' : 'Your Name'}
              required
              className="bg-slate-900/50 backdrop-blur-sm border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
            />
            <input
              type="email"
              name="email"
              placeholder={language === 'fr' ? 'Votre Email' : 'Your Email'}
              required
              className="bg-slate-900/50 backdrop-blur-sm border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 transition-all placeholder:text-slate-500"
            />
            <textarea
              name="message"
              placeholder={language === 'fr' ? 'Votre Message' : 'Your Message'}
              required
              className="bg-slate-900/50 backdrop-blur-sm border border-white/10 text-white p-3 rounded-xl focus:outline-none focus:border-violet-500/50 focus:ring-1 focus:ring-violet-500 transition-all h-32 resize-none placeholder:text-slate-500"
            ></textarea>
            <button
              type="submit"
              className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-3 px-6 rounded-xl font-bold hover:shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all transform hover:-translate-y-0.5"
            >
              {language === 'fr' ? 'Envoyer' : 'Send'}
            </button>
          </form>
          {formStatus && (
            <p className="text-center text-emerald-400 mt-4 text-sm font-medium">{formStatus}</p>
          )}
        </div>

        {/* --- Colonne 3: Liens Utiles & Développeur --- */}
        <div className="space-y-6">
          <h3 className="text-lg font-bold text-white uppercase tracking-wider mb-6">
            {language === 'fr' ? 'Le Créateur' : 'The Creator'}
          </h3>
          <p className="text-slate-400 mb-6">
            {language === 'fr' 
              ? "Ce projet a été conçu et développé avec passion par un ingénieur full stack dédié à l'innovation." 
              : "This project was designed and developed with passion by a full stack engineer dedicated to innovation."}
          </p>
          
          <Link 
            to="/portfolio" 
            className="group inline-flex items-center justify-center gap-3 w-full bg-slate-800/80 hover:bg-violet-600 text-white py-4 px-6 rounded-xl font-black uppercase tracking-widest border border-white/10 transition-all duration-300"
          >
            {language === 'fr' ? 'Voir le développeur' : 'View the developer'}
            <svg 
              className="w-5 h-5 group-hover:translate-x-1 transition-transform" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
        
      </div>

      <div className="relative z-10 text-center text-slate-500 text-xs mt-16 pt-8 border-t border-white/5 font-medium tracking-wide">
        <p>&copy; {new Date().getFullYear()} EtherNanos. {language === 'fr' ? 'Tous droits réservés.' : 'All rights reserved.'}</p>
      </div>
    </footer>
  );
};

export default FooterEthernanos;
