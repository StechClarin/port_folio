import React, { useEffect, useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { FolderOpen, Briefcase, Mail, Eye } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    projects: 0,
    experiences: 0,
    messages: 0,
    views: 0, // Placeholder if you track views later
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: projectsCount } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true });

        const { count: experienceCount } = await supabase
          .from('experiences')
          .select('*', { count: 'exact', head: true });

        const { count: messagesCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('is_read', false);

        setStats({
          projects: projectsCount || 0,
          experiences: experienceCount || 0,
          messages: messagesCount || 0,
          views: 1234, // Mock data
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.projects,
      icon: <FolderOpen size={24} className="text-violet-500" />,
      color: 'bg-violet-500/10',
    },
    {
      label: 'Experience Entries',
      value: stats.experiences,
      icon: <Briefcase size={24} className="text-blue-500" />,
      color: 'bg-blue-500/10',
    },
    {
      label: 'Unread Messages',
      value: stats.messages,
      icon: <Mail size={24} className="text-amber-500" />,
      color: 'bg-amber-500/10',
    },
    {
      label: 'Total Views',
      value: stats.views,
      icon: <Eye size={24} className="text-emerald-500" />,
      color: 'bg-emerald-500/10',
    },
  ];

  if (loading) {
    return <div className="text-white">Loading stats...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => (
          <div
            key={index}
            className="bg-gray-800 p-6 rounded-xl border border-gray-700 shadow-lg"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-lg ${stat.color}`}>{stat.icon}</div>
              <span className="text-2xl font-bold text-white">
                {stat.value}
              </span>
            </div>
            <h3 className="text-gray-400 font-medium">{stat.label}</h3>
          </div>
        ))}
      </div>

      <div className="mt-8 bg-gray-800 p-6 rounded-xl border border-gray-700">
        <h2 className="text-xl font-bold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">Activity logging coming soon...</p>
      </div>
    </div>
  );
};

export default Dashboard;
