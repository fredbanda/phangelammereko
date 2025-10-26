'use client';

import { useState, useTransition } from 'react';
import { addConsultant} from '@/actions/consultantActions';
import { useRouter } from 'next/navigation';

interface ConsultantFormData {
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  title?: string;
  bio?: string;
  specializations?: string[];
  skills?: string[];
  experience?: number;
  hourlyRate?: number;
  maxOrders?: number;
  isActive?: boolean;
}

export default function ConsultantForm() {
  const [formData, setFormData] = useState<ConsultantFormData>({
    name: '',
    email: '',
    phone: '',
    avatar: '',
    title: '',
    bio: '',
    specializations: [],
    skills: [],
    experience: 0,
    hourlyRate: 0,
    maxOrders: 5,
    isActive: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'experience' || name === 'hourlyRate' || name === 'maxOrders' 
        ? parseInt(value) || 0 
        : name === 'isActive' 
        ? value === 'true' 
        : value,
    }));
  };

  const handleArrayChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'specializations' | 'skills') => {
    const value = e.target.value.split(',').map((item) => item.trim()).filter((item) => item);
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    startTransition(async () => {
      try {
        const result = await addConsultant(formData);
        if (result.success) {
          setSuccess('Consultant added successfully!');
          setFormData({
            name: '',
            email: '',
            phone: '',
            avatar: '',
            title: '',
            bio: '',
            specializations: [],
            skills: [],
            experience: 0,
            hourlyRate: 0,
            maxOrders: 5,
            isActive: true,
          });
          router.refresh(); // Refresh to update any server-rendered consultant list
        } else {
          setError(result.error || 'Failed to add consultant');
        }
      } catch (err) {
        setError('An unexpected error occurred');
        console.log(err);
        
      }
    });
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Consultant</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            name="email"
            id="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone (Optional)
          </label>
          <input
            type="text"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="avatar" className="block text-sm font-medium text-gray-700">
            Avatar URL (Optional)
          </label>
          <input
            type="text"
            name="avatar"
            id="avatar"
            value={formData.avatar}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            Title (Optional)
          </label>
          <input
            type="text"
            name="title"
            id="title"
            value={formData.title}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="bio" className="block text-sm font-medium text-gray-700">
            Bio (Optional)
          </label>
          <textarea
            name="bio"
            id="bio"
            value={formData.bio}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            rows={4}
          />
        </div>

        <div>
          <label htmlFor="specializations" className="block text-sm font-medium text-gray-700">
            Specializations (Comma-separated, Optional)
          </label>
          <input
            type="text"
            name="specializations"
            id="specializations"
            onChange={(e) => handleArrayChange(e, 'specializations')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g. LinkedIn Optimization, Career Coaching"
          />
        </div>

        <div>
          <label htmlFor="skills" className="block text-sm font-medium text-gray-700">
            Skills (Comma-separated, Optional)
          </label>
          <input
            type="text"
            name="skills"
            id="skills"
            onChange={(e) => handleArrayChange(e, 'skills')}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            placeholder="e.g. Resume Writing, Interview Prep"
          />
        </div>

        <div>
          <label htmlFor="experience" className="block text-sm font-medium text-gray-700">
            Experience (Years, Optional)
          </label>
          <input
            type="number"
            name="experience"
            id="experience"
            value={formData.experience}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="hourlyRate" className="block text-sm font-medium text-gray-700">
            Hourly Rate (Optional)
          </label>
          <input
            type="number"
            name="hourlyRate"
            id="hourlyRate"
            value={formData.hourlyRate}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="maxOrders" className="block text-sm font-medium text-gray-700">
            Max Orders (Optional)
          </label>
          <input
            type="number"
            name="maxOrders"
            id="maxOrders"
            value={formData.maxOrders}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          />
        </div>

        <div>
          <label htmlFor="isActive" className="block text-sm font-medium text-gray-700">
            Active Status
          </label>
          <select
            name="isActive"
            id="isActive"
            value={formData.isActive ? 'true' : 'false'}
            onChange={handleChange}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="true">Active</option>
            <option value="false">Inactive</option>
          </select>
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}
        {success && <p className="text-green-500 text-sm">{success}</p>}

        <button
          type="submit"
          disabled={isPending}
          className={`w-full py-2 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 ${
            isPending ? 'opacity-50 cursor-not-allowed' : ''
          }`}
        >
          {isPending ? 'Adding Consultant...' : 'Add Consultant'}
        </button>
      </form>
    </div>
  );
}