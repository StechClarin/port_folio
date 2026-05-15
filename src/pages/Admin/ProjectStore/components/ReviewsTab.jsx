import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Star, Trash2, Loader2, RefreshCw, User, Building2, Globe, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '../../../../lib/supabaseClient';
import toast from 'react-hot-toast';
import { confirmAction } from '../../../../utils/toastUtils';

const ReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apps, setApps] = useState([]);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const { data: appsData } = await supabase.from('apps').select('id, name');
      setApps(appsData || []);

      const { data, error } = await supabase
        .from('app_reviews')
        .select('*, apps(name)')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      setReviews(data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleDeleteReview = async (id) => {
    confirmAction('Are you sure you want to delete this review?', async () => {
      try {
        const { error } = await supabase.from('app_reviews').delete().eq('id', id);
        if (error) throw error;
        setReviews(reviews.filter(r => r.id !== id));
        toast.success('Review deleted');
      } catch (err) {
        console.error(err);
        toast.error('Failed to delete review');
      }
    });
  };

  const handleToggleStatus = async (review) => {
    const newStatus = !review.is_published;
    try {
      const { error } = await supabase
        .from('app_reviews')
        .update({ is_published: newStatus })
        .eq('id', review.id);
      
      if (error) throw error;
      setReviews(reviews.map(r => r.id === review.id ? { ...r, is_published: newStatus } : r));
      toast.success(newStatus ? 'Review published' : 'Review hidden');
    } catch (err) {
      console.error(err);
      toast.error('Failed to update status');
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] text-violet-500">
        <Loader2 className="animate-spin mb-4" size={48} />
        <p className="text-gray-400">Loading community feedback...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-white flex items-center gap-2">
          <MessageSquare className="text-violet-400" size={24} />
          Community Reviews & Ratings
        </h2>
        <button 
          onClick={fetchData}
          className="text-gray-400 hover:text-white p-2 rounded-lg transition-colors bg-gray-900/50 hover:bg-gray-800"
        >
          <RefreshCw size={20} />
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {reviews.map((review) => (
          <div 
            key={review.id} 
            className={`bg-gray-800/40 border rounded-2xl p-5 backdrop-blur-sm transition-all ${
              review.is_published ? 'border-gray-700/50' : 'border-amber-500/30 bg-amber-500/5'
            }`}
          >
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 border border-violet-500/20">
                    <User size={20} />
                  </div>
                  <div>
                    <h3 className="text-white font-bold flex items-center gap-2">
                      {review.author_name}
                      {!review.is_published && (
                        <span className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-0.5 rounded-full border border-amber-500/30 uppercase font-bold">Draft</span>
                      )}
                    </h3>
                    <div className="flex items-center gap-3 text-xs text-gray-400">
                      <span className="flex items-center gap-1"><Building2 size={12} /> {review.company_name}</span>
                      <span className="flex items-center gap-1"><Globe size={12} /> {review.country}</span>
                      <span className="text-violet-400 font-bold bg-violet-400/10 px-1.5 rounded">@{review.apps?.name}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 mb-3">
                  {[...Array(5)].map((_, i) => (
                    <Star 
                      key={i} 
                      size={14} 
                      className={i < review.rating ? "text-amber-400 fill-amber-400" : "text-gray-600"} 
                    />
                  ))}
                  <span className="text-xs text-gray-500 ml-2 italic">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>

                <p className="text-gray-300 text-sm leading-relaxed italic">
                  "{review.comment}"
                </p>
              </div>

              <div className="flex md:flex-col items-center justify-end gap-2 border-t md:border-t-0 md:border-l border-gray-700/50 pt-4 md:pt-0 md:pl-6">
                <button 
                  onClick={() => handleToggleStatus(review)}
                  className={`flex-1 md:w-32 flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    review.is_published 
                      ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20'
                  }`}
                >
                  {review.is_published ? <XCircle size={14} /> : <CheckCircle size={14} />}
                  {review.is_published ? 'Unpublish' : 'Publish'}
                </button>
                <button 
                  onClick={() => handleDeleteReview(review.id)}
                  className="p-2 text-red-500 hover:text-white hover:bg-red-600 rounded-xl transition-colors border border-transparent hover:border-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          </div>
        ))}

        {reviews.length === 0 && (
          <div className="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-700">
            <MessageSquare size={48} className="mx-auto mb-4 text-gray-700" />
            <p className="text-gray-500">No community reviews to manage yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsTab;
