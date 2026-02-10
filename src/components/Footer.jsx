import React, { useState } from 'react';
import { portfolioData } from '../data/portfolio';
import { supabase } from '../lib/supabaseClient';

// Icônes SVG pour la section "Follow Me"
// (Il est plus propre de les définir comme de petits composants ou des constantes)

const SvgGitHub = () => (
  <svg
    fill="currentColor"
    className="w-6 h-6"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.5.499.09.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.036 1.531 1.036.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.026 2.747-1.026.546 1.379.202 2.398.1 2.65.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.577.688.482A10.001 10.001 0 0022 12.017C22 6.484 17.522 2 12 2z"
      clipRule="evenodd"
    />
  </svg>
);

const SvgLinkedIn = () => (
  <svg
    fill="currentColor"
    className="w-6 h-6"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
  </svg>
);

const SvgTwitterX = () => (
  <svg
    fill="currentColor"
    className="w-6 h-6"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.617l-5.364-7.151-6.057 7.151h-3.308l7.73-8.99-8.158-10.5h6.741l4.811 6.349 5.751-6.349zm-1.149 19.484h1.765l-8.997-11.848-1.928 2.58-1.765-2.58 9.925-13.066h-1.765l8.997 11.848 1.928-2.58 1.765 2.58-9.925 13.066z" />
  </svg>
);

const Footer = () => {
  const [formStatus, setFormStatus] = useState('');
  const { socials, about } = portfolioData;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormStatus('Envoi en cours...');

    const formData = new FormData(e.target);
    const messageData = {
      name: formData.get('name'),
      email: formData.get('email'),
      content: formData.get('message'),
      subject: 'Portfolio Contact Form', // Default subject
    };

    try {
      const { error } = await supabase.from('messages').insert([messageData]);
      if (error) throw error;

      setFormStatus('Message envoyé avec succès !');
      e.target.reset();
    } catch (error) {
      console.error('Error sending message:', error);
      setFormStatus("Erreur lors de l'envoi.");
    } finally {
      setTimeout(() => setFormStatus(''), 3000);
    }
  };

  return (
    <footer className="bg-gray-800 text-gray-200 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-12">
        {/* --- Colonne 1: Contact Info --- */}
        <div>
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider mb-4">
            Contact Info
          </h3>
          <p className="mb-3 leading-relaxed">
            N'hésitez pas à me contacter. Je suis ouvert aux opportunités et aux
            collaborations.
          </p>
          <p className="mb-2">
            <a
              href={`mailto:${socials.email}`}
              className="text-purple-400 hover:text-purple-300 transition-colors duration-300"
            >
              {socials.email}
            </a>
          </p>
          <p>{socials.phone}</p>
        </div>

        {/* --- Colonne 2: Formulaire de Contact --- */}
        <div>
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider mb-4">
            Envoyer un Message
          </h3>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <label htmlFor="name" className="sr-only">
              Votre Nom
            </label>
            <input
              id="name"
              type="text"
              name="name"
              placeholder="Votre Nom"
              required
              className="bg-gray-700 border border-gray-600 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <label htmlFor="email" className="sr-only">
              Votre Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="Votre Email"
              required
              className="bg-gray-700 border border-gray-600 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
            />
            <label htmlFor="message" className="sr-only">
              Votre Message
            </label>
            <textarea
              id="message"
              name="message"
              placeholder="Votre Message"
              required
              className="bg-gray-700 border border-gray-600 text-white p-3 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all h-32 resize-none"
            ></textarea>
            <button
              type="submit"
              className="bg-gray-600 text-white py-3 px-6 rounded-md font-semibold hover:bg-gray-700 hover:scale-105 transform transition-all duration-300 shadow-lg hover:shadow-purple-500/50"
            >
              Envoyer
            </button>
          </form>
          {/* Message de statut du formulaire */}
          {formStatus && (
            <p className="text-center text-green-400 mt-4">{formStatus}</p>
          )}
        </div>

        {/* --- Colonne 3: Liens Sociaux --- */}
        <div>
          <h3 className="text-lg font-semibold text-white uppercase tracking-wider mb-4">
            Suivez-moi
          </h3>
          <p className="mb-4">Retrouvez-moi sur les plateformes suivantes :</p>
          <div className="flex gap-6">
            <a
              href={socials.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="text-gray-300 hover:text-purple-400 hover:scale-110 transform transition-all duration-300"
            >
              <SvgLinkedIn />
            </a>
            <a
              href={socials.github}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="GitHub"
              className="text-gray-300 hover:text-purple-400 hover:scale-110 transform transition-all duration-300"
            >
              <SvgGitHub />
            </a>
          </div>
        </div>
      </div>

      {/* --- Ligne de Copyright (Séparée) --- */}
      <div className="text-center text-gray-500 text-sm mt-12 pt-8 border-t border-gray-700">
        <p>
          &copy; {new Date().getFullYear()} {about.name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
