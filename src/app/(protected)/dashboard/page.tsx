// File: app/dashboard/page.tsx
"use client";

import { useState } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  ShoppingCart, 
  FileText, 
  Calendar,
  Settings
} from 'lucide-react';
import { LeadsDashboard } from '@/components/leads-dashboard';


type DashboardView = 'overview' | 'leads' | 'orders' | 'resumes' | 'consultations' | 'settings';

export default function MainDashboard() {
  const [activeView, setActiveView] = useState<DashboardView>('overview');

  const navigationItems = [
    { id: 'overview' as DashboardView, label: 'Overview', icon: LayoutDashboard },
    { id: 'leads' as DashboardView, label: 'Leads', icon: Users },
    { id: 'orders' as DashboardView, label: 'Orders', icon: ShoppingCart },
    { id: 'resumes' as DashboardView, label: 'Resumes', icon: FileText },
    { id: 'consultations' as DashboardView, label: 'Consultations', icon: Calendar },
    { id: 'settings' as DashboardView, label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-white shadow-md border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo/Brand */}
            <div className="flex items-center">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Admin Dashboard
              </h1>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-1">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all
                      ${isActive 
                        ? 'bg-blue-600 text-white shadow-md' 
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Mobile Navigation */}
          <div className="md:hidden pb-3 overflow-x-auto">
            <div className="flex space-x-2">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeView === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveView(item.id)}
                    className={`
                      flex flex-col items-center gap-1 px-4 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap
                      ${isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-600 hover:bg-gray-100'
                      }
                    `}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main>
        {activeView === 'overview' && <OverviewDashboard />}
        {activeView === 'leads' && <LeadsDashboard />}
        {activeView === 'orders' && <OrdersDashboard />}
        {activeView === 'resumes' && <ResumesDashboard />}
        {activeView === 'consultations' && <ConsultationsDashboard />}
        {activeView === 'settings' && <SettingsDashboard />}
      </main>
    </div>
  );
}

// ============================================================
// Placeholder Components (Create these as you build them)
// ============================================================

function OverviewDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600 mt-2">Welcome to your admin dashboard</p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Leads"
          value="152"
          change="+12%"
          icon={Users}
          color="blue"
        />
        <StatCard
          title="Active Orders"
          value="48"
          change="+8%"
          icon={ShoppingCart}
          color="green"
        />
        <StatCard
          title="Resumes"
          value="89"
          change="+23%"
          icon={FileText}
          color="purple"
        />
        <StatCard
          title="Consultations"
          value="34"
          change="+15%"
          icon={Calendar}
          color="orange"
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Activity</h2>
        <p className="text-gray-500">No recent activity to display</p>
      </div>
    </div>
  );
}

function OrdersDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <ShoppingCart className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Orders Dashboard</h2>
        <p className="text-gray-600">This section is coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          You&apos;ll be able to manage consultation orders here
        </p>
      </div>
    </div>
  );
}

function ResumesDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Resumes Dashboard</h2>
        <p className="text-gray-600">This section is coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          You&apos;ll be able to manage user resumes here
        </p>
      </div>
    </div>
  );
}

function ConsultationsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Consultations Dashboard</h2>
        <p className="text-gray-600">This section is coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          You&apos;ll be able to schedule and manage consultations here
        </p>
      </div>
    </div>
  );
}

function SettingsDashboard() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-xl shadow-md p-12 text-center">
        <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Settings</h2>
        <p className="text-gray-600">This section is coming soon...</p>
        <p className="text-sm text-gray-500 mt-2">
          You&apos;ll be able to configure system settings here
        </p>
      </div>
    </div>
  );
}

// ============================================================
// Stat Card Component
// ============================================================

interface StatCardProps {
  title: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: 'blue' | 'green' | 'purple' | 'orange';
}

function StatCard({ title, value, change, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600 border-blue-500',
    green: 'bg-green-100 text-green-600 border-green-500',
    purple: 'bg-purple-100 text-purple-600 border-purple-500',
    orange: 'bg-orange-100 text-orange-600 border-orange-500',
  };

  return (
    <div className={`bg-white rounded-xl shadow-md p-6 border-l-4 ${colorClasses[color].split(' ')[2]}`}>
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorClasses[color].split(' ')[0]}`}>
          <Icon className={`w-6 h-6 ${colorClasses[color].split(' ')[1]}`} />
        </div>
        <span className="text-green-600 text-sm font-medium">{change}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-600 mt-1">{title}</p>
    </div>
  );
}