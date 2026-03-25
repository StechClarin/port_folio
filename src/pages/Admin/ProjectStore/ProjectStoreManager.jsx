import React, { useState } from 'react';
import { Layers, Rocket, Users, Key, Server, Plus, Store, Tag, Package } from 'lucide-react';
import AppsCatalogueTab from './components/AppsCatalogueTab';
import ReleasesTab from './components/ReleasesTab';
import CustomersTab from './components/CustomersTab';
import LicensesTab from './components/LicensesTab';
import PromotionsTab from './components/PromotionsTab';
import BundlesTab from './components/BundlesTab';

const tabs = [
  { id: 'catalogue', label: 'Catalogue', icon: Layers, desc: 'Apps & Modules' },
  { id: 'releases', label: 'Releases', icon: Rocket, desc: 'Versions & Files' },
  { id: 'customers', label: 'Tenants', icon: Users, desc: 'Schools & Hubs' },
  { id: 'licenses', label: 'Licenses', icon: Key, desc: 'Access Rights' },
  { id: 'promotions', label: 'Promotions', icon: Tag, desc: 'Discount Codes' },
  { id: 'bundles', label: 'Packs', icon: Package, desc: 'Bundle Offers' },
];

const ProjectStoreManager = () => {
  const [activeTab, setActiveTab] = useState('catalogue');

  const renderTabContent = () => {
    switch (activeTab) {
      case 'catalogue':
        return <AppsCatalogueTab />;
      case 'releases':
        return <ReleasesTab />;
      case 'customers':
        return <CustomersTab />;
      case 'licenses':
        return <LicensesTab />;
      case 'promotions':
        return <PromotionsTab />;
      case 'bundles':
        return <BundlesTab />;
      default:
        return <AppsCatalogueTab />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-fuchsia-400 text-transparent bg-clip-text flex items-center gap-3">
            <Store className="text-violet-400" size={32} />
            EtherNanos Hub Store
          </h1>
          <p className="text-gray-400 mt-2">
            Central orchestration for applications, distributions, and licensing.
          </p>
        </div>
        
        {/* Quick Stats or Global Actions could go here */}
        <div className="flex items-center gap-3 bg-gray-800/50 p-2 rounded-xl border border-gray-700/50 backdrop-blur-sm">
             <div className="flex flex-col items-center px-4 border-r border-gray-700/50">
                <span className="text-sm text-gray-400">Total Apps</span>
                <span className="text-xl font-bold text-white">1</span>
             </div>
             <div className="flex flex-col items-center px-4 border-r border-gray-700/50">
                <span className="text-sm text-gray-400">Active Tenants</span>
                <span className="text-xl font-bold text-emerald-400">0</span>
             </div>
             <div className="flex flex-col items-center px-4">
                <span className="text-sm text-gray-400">System Status</span>
                <span className="text-sm font-medium text-emerald-400 flex items-center gap-1 mt-1">
                    <Server size={14}/> Online
                </span>
             </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-300 min-w-max ${
                isActive
                  ? 'bg-violet-600 shadow-lg shadow-violet-500/25 text-white'
                  : 'bg-gray-800/50 text-gray-400 hover:bg-gray-800 hover:text-white border border-transparent hover:border-gray-700/50'
              }`}
            >
              <Icon size={20} className={isActive ? 'text-white' : 'text-gray-400'} />
              <div className="text-left">
                <div className="font-semibold text-sm leading-none">{tab.label}</div>
                <div className={`text-xs mt-1 opacity-70 ${isActive ? 'text-violet-100' : 'text-gray-500'}`}>
                  {tab.desc}
                </div>
              </div>
              
              {isActive && (
                <div
                  className="absolute inset-0 border-2 border-violet-400/30 rounded-xl pointer-events-none transition-all duration-300"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div
        key={activeTab}
        className="min-h-[600px] mt-6 bg-gray-800/30 border border-gray-700/50 rounded-2xl p-6 backdrop-blur-xl animate-in fade-in duration-300"
      >
          {renderTabContent()}
      </div>
    </div>
  );
};

export default ProjectStoreManager;
