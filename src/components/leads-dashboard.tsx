/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from 'react';
import { Search, Phone, Mail, ExternalLink, Users, Target, Download, Eye, CheckCircle2, Clock, AlertCircle, Loader2, DollarSign, TrendingUp} from 'lucide-react';

interface Lead {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  headline: string | null;
  location: string | null;
  industry: string | null;
  profileUrl: string | null;
  overallScore: number;
  headlineScore: number;
  summaryScore: number;
  experienceScore: number;
  skillsScore: number;
  skills: string[];
  marketingConsent: boolean;
  contacted: boolean;
  createdAt: string;
  status: string;
  experiences?: any[];
  education?: any[];
}

interface Stats {
  total: number;
  new: number;
  contacted: number;
  avgScore: number;
  withPhone: number;
  marketingConsent: number;
}

export const LeadsDashboard = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    new: 0,
    contacted: 0,
    avgScore: 0,
    withPhone: 0,
    marketingConsent: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [sortBy, setSortBy] = useState('date');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  useEffect(() => {
    fetchLeads();
    console.log(fetchLeads);
  }, [searchTerm, filterStatus, sortBy]);
 
  

  const fetchLeads = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams({
        search: searchTerm,
        status: filterStatus,
        sortBy: sortBy,
      });

      console.log('🔍 Fetching leads:', `/api/leads?${params}`);
      const response = await fetch(`/api/leads?${params}`);
      
      console.log('📡 Response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || errorData.details || `Server error: ${response.status}`);
      }

      const data = await response.json();
      console.log('✅ Data received:', { leadCount: data.leads?.length, stats: data.stats });
      
      setLeads(data.leads || []);
      setStats(data.stats || {
        total: 0,
        new: 0,
        contacted: 0,
        avgScore: 0,
        withPhone: 0,
        marketingConsent: 0,
      });
    } catch (err) {
      console.error('❌ Fetch error:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load leads. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateLead = async (leadId: string, updates: any) => {
    try {
      const response = await fetch('/api/leads', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ leadId, updates }),
      });

      if (!response.ok) {
        throw new Error('Failed to update lead');
      }

      await fetchLeads();
    } catch (err) {
      console.error('Error updating lead:', err);
      alert('Failed to update lead. Please try again.');
    }
  };

  const markAsContacted = async (leadId: string) => {
    await updateLead(leadId, { contacted: true });
  };

  const handleConvertToSale = (lead: Lead) => {
    setConvertingLead(lead);
    setShowConvertModal(true);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      new: { text: 'New Lead', color: 'bg-blue-100 text-blue-700', icon: AlertCircle },
      contacted: { text: 'Contacted', color: 'bg-purple-100 text-purple-700', icon: Clock },
      converted: { text: 'Converted', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
    } as const;
    
    const badge = badges[status as keyof typeof badges] ?? badges.new;
    const Icon = badge.icon;
    
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Phone', 'Headline', 'Location', 'Industry', 'Overall Score', 'Status', 'Created At'];
    const csvContent = [
      headers.join(','),
      ...leads.map(lead => [
        `"${lead.name}"`,
        lead.email,
        lead.phone || 'N/A',
        `"${lead.headline || 'N/A'}"`,
        `"${lead.location || 'N/A'}"`,
        `"${lead.industry || 'N/A'}"`,
        lead.overallScore,
        lead.status,
        new Date(lead.createdAt).toLocaleDateString(),
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getConversionRate = () => {
    if (stats.total === 0) return 0;
    const converted = leads.filter(l => l.status === 'converted').length;
    return Math.round((converted / stats.total) * 100);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Error Loading Leads</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={fetchLeads}
              className="w-full px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
            <details className="text-left">
              <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                Troubleshooting tips
              </summary>
              <div className="mt-2 text-xs text-gray-600 space-y-1 bg-gray-50 p-3 rounded">
                <p>• Check if your database is connected</p>
                <p>• Run: npx prisma db push</p>
                <p>• Run: npx prisma generate</p>
                <p>• Restart your dev server</p>
                <p>• Check browser console for details</p>
              </div>
            </details>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">LinkedIn Leads Dashboard</h1>
          <p className="text-gray-600">Manage and convert your LinkedIn profile optimization leads</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
              <span className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">Total</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            <p className="text-sm text-gray-600 mt-1">All Leads</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-green-100 p-3 rounded-lg">
                <Target className="w-6 h-6 text-green-600" />
              </div>
              <span className="text-xs text-gray-500 bg-green-50 px-2 py-1 rounded-full">Score</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.avgScore}</p>
            <p className="text-sm text-gray-600 mt-1">Avg. Score</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-purple-100 p-3 rounded-lg">
                <Phone className="w-6 h-6 text-purple-600" />
              </div>
              <span className="text-xs text-gray-500 bg-purple-50 px-2 py-1 rounded-full">Contact</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.contacted}</p>
            <p className="text-sm text-gray-600 mt-1">Contacted</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-orange-100 p-3 rounded-lg">
                <TrendingUp className="w-6 h-6 text-orange-600" />
              </div>
              <span className="text-xs text-gray-500 bg-orange-50 px-2 py-1 rounded-full">Rate</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{getConversionRate()}%</p>
            <p className="text-sm text-gray-600 mt-1">Conversion</p>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between mb-2">
              <div className="bg-yellow-100 p-3 rounded-lg">
                <Mail className="w-6 h-6 text-yellow-600" />
              </div>
              <span className="text-xs text-gray-500 bg-yellow-50 px-2 py-1 rounded-full">Marketing</span>
            </div>
            <p className="text-3xl font-bold text-gray-900">{stats.marketingConsent}</p>
            <p className="text-sm text-gray-600 mt-1">Opt-ins</p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md mb-6 p-5">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, industry..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="all">All Status</option>
              <option value="new">New Leads</option>
              <option value="contacted">Contacted</option>
              <option value="converted">Converted</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            >
              <option value="date">Sort by Date</option>
              <option value="score">Sort by Score</option>
              <option value="name">Sort by Name</option>
            </select>

            <button 
              onClick={exportToCSV}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium"
            >
              <Download className="w-4 h-4" />
              Export
            </button>
          </div>
        </div>

        {loading ? (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <Loader2 className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600">Loading leads...</p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lead Info</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Score</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {leads.map((lead) => (
                    <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-11 w-11 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-md">
                            {lead.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-semibold text-gray-900">{lead.name}</div>
                            <div className="text-sm text-gray-600 truncate max-w-xs">{lead.headline}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                              <span>{lead.location}</span>
                              {lead.industry && (
                                <>
                                  <span>•</span>
                                  <span>{lead.industry}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <a href={`mailto:${lead.email}`} className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1.5">
                            <Mail className="w-3.5 h-3.5" />
                            {lead.email}
                          </a>
                          {lead.phone ? (
                            <a href={`tel:${lead.phone}`} className="text-sm text-green-600 hover:text-green-800 flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5" />
                              {lead.phone}
                            </a>
                          ) : (
                            <span className="text-xs text-gray-400">No phone</span>
                          )}
                          {lead.marketingConsent && (
                            <span className="text-xs text-green-600 flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3" />
                              Marketing OK
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`text-2xl font-bold px-3 py-1 rounded-lg ${getScoreColor(lead.overallScore)}`}>
                            {lead.overallScore}
                          </div>
                          <div className="text-xs text-gray-500 space-y-0.5">
                            <div>H: {lead.headlineScore}</div>
                            <div>S: {lead.summaryScore}</div>
                            <div>E: {lead.experienceScore}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {getStatusBadge(lead.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{formatDate(lead.createdAt)}</div>
                        <div className="text-xs text-gray-500">
                          {new Date(lead.createdAt).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedLead(lead)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="View details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {lead.profileUrl && (
                            <a
                              href={lead.profileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="View LinkedIn"
                            >
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          )}
                          {!lead.contacted && lead.status !== 'converted' && (
                            <button
                              onClick={() => markAsContacted(lead.id)}
                              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                              title="Mark as contacted"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                          )}
                          {lead.status !== 'converted' && (
                            <button
                              onClick={() => handleConvertToSale(lead)}
                              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                              title="Convert to sale"
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {leads.length === 0 && !loading && (
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No leads found matching your filters</p>
              </div>
            )}
          </div>
        )}

        {selectedLead && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <div className="p-6 border-b border-gray-200 flex justify-between items-start bg-gradient-to-r from-blue-50 to-purple-50">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{selectedLead.name}</h2>
                  <p className="text-gray-600 mt-1">{selectedLead.headline}</p>
                </div>
                <button
                  onClick={() => setSelectedLead(null)}
                  className="text-gray-400 hover:text-gray-600 text-3xl font-light leading-none"
                >
                  ✕
                </button>
              </div>

              <div className="p-6 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2 text-lg">
                      <Mail className="w-5 h-5" />
                      Contact Information
                    </h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Email:</span>{' '}
                        <a href={`mailto:${selectedLead.email}`} className="text-blue-600 hover:underline">
                          {selectedLead.email}
                        </a>
                      </p>
                      {selectedLead.phone && (
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Phone:</span>{' '}
                          <a href={`tel:${selectedLead.phone}`} className="text-green-600 hover:underline">
                            {selectedLead.phone}
                          </a>
                        </p>
                      )}
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Location:</span> {selectedLead.location}
                      </p>
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Industry:</span> {selectedLead.industry}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 text-lg">Profile Scores</h3>
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-gray-600">Overall</span>
                        <span className={`font-bold text-lg px-3 py-1 rounded-lg ${getScoreColor(selectedLead.overallScore)}`}>
                          {selectedLead.overallScore}/100
                        </span>
                      </div>
                      <div className="space-y-2 pt-2 border-t border-gray-200">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Headline</span>
                          <span className="text-sm font-medium">{selectedLead.headlineScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Summary</span>
                          <span className="text-sm font-medium">{selectedLead.summaryScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Experience</span>
                          <span className="text-sm font-medium">{selectedLead.experienceScore}/100</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">Skills</span>
                          <span className="text-sm font-medium">{selectedLead.skillsScore}/100</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {selectedLead.skills && selectedLead.skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3 text-lg">
                      Skills ({selectedLead.skills.length})
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedLead.skills.map((skill, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <a
                    href={`mailto:${selectedLead.email}`}
                    className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 font-medium"
                  >
                    <Mail className="w-4 h-4" />
                    Send Email
                  </a>
                  {selectedLead.phone && (
                    <a
                      href={`tel:${selectedLead.phone}`}
                      className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <Phone className="w-4 h-4" />
                      Call Now
                    </a>
                  )}
                  {selectedLead.profileUrl && (
                    <a
                      href={selectedLead.profileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-3 border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                      <ExternalLink className="w-4 h-4" />
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

