import React from 'react';
import toast from 'react-hot-toast';
import { AlertTriangle } from 'lucide-react';

export const confirmAction = (message, onConfirm) => {
  toast.custom((t) => (
    <div className={`fixed inset-0 z-[9999] flex items-center justify-center p-4 transition-all duration-300 ${t.visible ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div 
         className="absolute inset-0 bg-black/60 backdrop-blur-sm"
         onClick={() => toast.dismiss(t.id)}
      />
      
      {/* Modal Dialog */}
      <div className={`bg-gray-900 border border-gray-700 shadow-2xl rounded-2xl p-6 w-full max-w-md relative z-10 transform transition-all duration-300 ${t.visible ? 'scale-100 translate-y-0' : 'scale-95 translate-y-8'}`}>
        <div className="flex items-start gap-4 mb-6">
           <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl border border-red-500/20 shrink-0">
              <AlertTriangle size={24} />
           </div>
           <div className="pt-1">
             <h3 className="font-bold text-white text-lg mb-1">Confirm Action</h3>
             <p className="text-gray-400 text-sm leading-relaxed">{message}</p>
           </div>
        </div>
        
        <div className="flex justify-end gap-3 pt-2">
           <button onClick={() => toast.dismiss(t.id)} className="px-5 py-2.5 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-700 transition appearance-none">
              Cancel
           </button>
           <button 
              onClick={() => {
                 toast.dismiss(t.id);
                 setTimeout(onConfirm, 100);
              }} 
              className="px-5 py-2.5 bg-red-500 hover:bg-red-400 text-white font-medium rounded-xl transition appearance-none shadow-lg shadow-red-500/20"
           >
              Yes, I'm sure
           </button>
        </div>
      </div>
    </div>
  ), { 
    duration: Infinity,
    id: 'global-confirmation-modal' // single instance across app
  });
};
