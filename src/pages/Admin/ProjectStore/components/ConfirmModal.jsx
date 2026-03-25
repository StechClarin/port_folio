import React, { useEffect } from 'react';
import { AlertTriangle, X, Check, Trash2, Power } from 'lucide-react';

const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  message, 
  confirmText = "Confirmer", 
  cancelText = "Annuler",
  type = "info" // "info", "danger", "warning"
}) => {
  // Prevent body scrolling when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          bg: 'bg-red-500/10',
          border: 'border-red-500/20',
          text: 'text-red-500',
          btn: 'bg-red-600 hover:bg-red-500 shadow-red-500/20',
          icon: <Trash2 size={24} />
        };
      case 'warning':
        return {
          bg: 'bg-amber-500/10',
          border: 'border-amber-500/20',
          text: 'text-amber-500',
          btn: 'bg-amber-600 hover:bg-amber-500 shadow-amber-500/20',
          icon: <AlertTriangle size={24} />
        };
      default:
        return {
          bg: 'bg-pink-500/10',
          border: 'border-pink-500/20',
          text: 'text-pink-500',
          btn: 'bg-pink-600 hover:bg-pink-500 shadow-pink-500/20',
          icon: <Power size={24} />
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Modal Content */}
      <div 
        className="relative bg-gray-900 border border-gray-700 w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 fade-in duration-200"
      >
        <div className="absolute top-0 right-0 p-4">
            <button 
                onClick={onClose}
                className="text-gray-500 hover:text-white transition-colors"
            >
                <X size={20} />
            </button>
        </div>

        <div className="p-8 text-center">
          <div className={`mx-auto w-16 h-16 ${styles.bg} ${styles.border} border rounded-2xl flex items-center justify-center ${styles.text} mb-6 shadow-inner`}>
            {styles.icon}
          </div>
          
          <h2 className="text-xl font-black text-white mb-2 uppercase tracking-tight">{title}</h2>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            {message}
          </p>
          
          <div className="flex gap-3">
            <button 
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-800 text-gray-400 rounded-xl hover:bg-gray-700 hover:text-white transition font-black uppercase tracking-widest text-[10px] border border-gray-700"
            >
              {cancelText}
            </button>
            <button 
              onClick={onConfirm}
              className={`flex-1 px-6 py-3 ${styles.btn} text-white font-black rounded-xl transition shadow-lg uppercase tracking-widest text-[10px] flex items-center justify-center gap-2`}
            >
              <Check size={14} />
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
