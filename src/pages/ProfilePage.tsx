import { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { Camera, Mail, Phone, MapPin, Globe, Bell, Shield, Key, Smartphone } from 'lucide-react';

export function ProfilePage() {
  const user = useAuthStore(s => s.user);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    firstName: 'Văn A',
    lastName: 'Nguyễn',
    bio: 'Passionate about preserving Vietnamese cultural heritage and exploring modern interpretations of traditional crafts.',
  });

  const [emailDigests, setEmailDigests] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(true);

  return (
    <div className="w-full max-w-[1440px] mx-auto p-4 md:p-8 lg:p-12 font-plus-jakarta pb-20">
      {/* Page Header */}
      <div className="mb-10">
        <h1 className="text-4xl md:text-[57px] font-normal leading-tight md:leading-[64px] text-[#191d17] tracking-[-0.25px] mb-2">
          Account Settings
        </h1>
        <p className="text-[#42493c] text-base tracking-[0.5px] leading-6">
          Manage your profile, preferences, and security settings.
        </p>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-12 gap-8">
        {/* Left Column - Profile Overview */}
        <div className="col-span-12 md:col-span-4 space-y-6">
          {/* User Profile Card */}
          <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6 relative overflow-hidden">
            {/* Header Background */}
            <div className="absolute top-0 left-0 right-0 h-32 bg-[#d8e7cb] opacity-50"></div>
            
            {/* Profile Content */}
            <div className="relative pt-12 pb-4">
              {/* Avatar */}
              <div className="flex justify-center mb-4">
                <div className="relative">
                  <div className="w-28 h-28 rounded-full bg-gray-200 border-4 border-white shadow-sm overflow-hidden">
                    <img 
                      src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200" 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button className="absolute bottom-0 right-0 w-8 h-8 bg-[#bdf59b] rounded-full flex items-center justify-center shadow-sm hover:bg-[#a5e582] transition-colors border border-white">
                    <Camera size={14} className="text-[#205107]" />
                  </button>
                </div>
              </div>

              {/* Name */}
              <h3 className="text-2xl md:text-[28px] font-normal text-center text-[#191d17] leading-9 mb-1">
                Nguyễn Văn A
              </h3>
              <p className="text-sm text-center text-[#42493c] tracking-[0.25px] mb-4">
                Member since Oct 2023
              </p>

              {/* Badges */}
              <div className="flex justify-center gap-2 mb-6">
                <span className="px-3 py-1 bg-[#386666] text-white text-xs font-medium rounded-full tracking-[0.5px]">
                  Verified Creator
                </span>
                <span className="px-3 py-1 bg-[#e7e8d5] text-[#191d17] text-xs font-medium rounded-full tracking-[0.5px]">
                  Premium
                </span>
              </div>

              {/* Contact Info */}
              <div className="border-t border-[#e0e4da] pt-4 space-y-3">
                <div className="flex items-center gap-3 text-sm text-[#42493c] tracking-[0.25px]">
                  <Mail size={17} className="shrink-0" />
                  <span className="truncate">{user?.email || 'nguyen.vana@example.com'}</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#42493c] tracking-[0.25px]">
                  <Phone size={15} />
                  <span>+84 90 123 4567</span>
                </div>
                <div className="flex items-center gap-3 text-sm text-[#42493c] tracking-[0.25px]">
                  <MapPin size={15} />
                  <span>Ho Chi Minh City, VN</span>
                </div>
              </div>
            </div>
          </div>

          {/* Activity Summary Card */}
          <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6">
            <h4 className="text-base font-medium text-[#191d17] tracking-[0.15px] mb-4">Activity Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-[#f3f6e8] rounded-xl p-6 text-center hover:bg-[#e8efd8] transition-colors cursor-pointer">
                <p className="text-[28px] font-normal text-[#205107] leading-9 mb-1">12</p>
                <p className="text-xs font-medium text-[#42493c] tracking-[0.5px]">Collections</p>
              </div>
              <div className="bg-[#f3f6e8] rounded-xl p-6 text-center hover:bg-[#e8efd8] transition-colors cursor-pointer">
                <p className="text-[28px] font-normal text-[#205107] leading-9 mb-1">48</p>
                <p className="text-xs font-medium text-[#42493c] tracking-[0.5px]">Stories<br/>Read</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column - Settings Details */}
        <div className="col-span-12 md:col-span-8 space-y-8">
          {/* Personal Information Form */}
          <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6 md:p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl md:text-[22px] font-medium text-[#191d17] leading-7">Personal Information</h3>
              <button 
                onClick={() => setEditing(!editing)}
                className="text-sm font-medium text-[#205107] tracking-[0.1px] hover:underline"
              >
                {editing ? 'Cancel' : 'Edit'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-medium text-[#42493c] tracking-[0.5px] mb-2 pl-4">
                  First Name
                </label>
                <input
                  type="text"
                  value={form.firstName}
                  onChange={e => setForm({...form, firstName: e.target.value})}
                  disabled={!editing}
                  className="w-full bg-[#e1e3cf] px-6 py-4 rounded-[28px] text-[#191d17] text-base tracking-[0.5px] leading-6 focus:outline-none focus:ring-2 focus:ring-[#205107] disabled:opacity-70 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#42493c] tracking-[0.5px] mb-2 pl-4">
                  Last Name
                </label>
                <input
                  type="text"
                  value={form.lastName}
                  onChange={e => setForm({...form, lastName: e.target.value})}
                  disabled={!editing}
                  className="w-full bg-[#e1e3cf] px-6 py-4 rounded-[28px] text-[#191d17] text-base tracking-[0.5px] leading-6 focus:outline-none focus:ring-2 focus:ring-[#205107] disabled:opacity-70 transition-all"
                />
              </div>
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-medium text-[#42493c] tracking-[0.5px] mb-2 pl-4">
                  Bio
                </label>
                <textarea
                  value={form.bio}
                  onChange={e => setForm({...form, bio: e.target.value})}
                  disabled={!editing}
                  rows={3}
                  className="w-full bg-[#e1e3cf] px-6 py-4 rounded-[28px] text-[#191d17] text-base tracking-[0.5px] leading-6 focus:outline-none focus:ring-2 focus:ring-[#205107] resize-none disabled:opacity-70 transition-all"
                />
              </div>
            </div>
          </div>

          {/* Preferences Bento Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Language & Region */}
            <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#d8e7cb] rounded-full flex items-center justify-center">
                  <Globe size={20} className="text-[#205107]" />
                </div>
                <h3 className="text-xl md:text-[22px] font-medium text-[#191d17] leading-7">
                  Language &<br/>Region
                </h3>
              </div>

              <div className="space-y-6">
                <div className="bg-[#f3f6e8] rounded-xl p-4 flex items-center justify-between">
                  <div>
                    <p className="text-base font-medium text-[#191d17] tracking-[0.5px] mb-1">
                      Display<br/>Language
                    </p>
                    <p className="text-sm text-[#42493c] tracking-[0.25px]">
                      Tiếng Việt<br/>(Vietnamese)
                    </p>
                  </div>
                  <button className="text-sm font-medium text-[#205107] tracking-[0.1px] hover:underline">
                    Change
                  </button>
                </div>

                <div className="bg-[#f3f6e8] rounded-xl p-4">
                  <p className="text-base font-medium text-[#191d17] tracking-[0.5px] mb-1">Time Zone</p>
                  <p className="text-sm text-[#42493c] tracking-[0.25px]">Indochina Time (ICT)</p>
                </div>
              </div>
            </div>

            {/* Notifications */}
            <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6 md:p-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#386666] rounded-full flex items-center justify-center">
                  <Bell size={20} className="text-white" />
                </div>
                <h3 className="text-xl md:text-[22px] font-medium text-[#191d17] leading-7">Notifications</h3>
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-normal text-[#191d17] tracking-[0.5px] mb-1">Email Digests</p>
                    <p className="text-sm text-[#42493c] tracking-[0.25px]">Weekly top stories</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={emailDigests}
                      onChange={e => setEmailDigests(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#386a20] relative transition-colors">
                      <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform peer-checked:translate-x-6 shadow-sm"></div>
                    </div>
                  </label>
                </div>

                <div className="border-t border-[#c3c8bc]/30 pt-5"></div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-base font-normal text-[#191d17] tracking-[0.5px] mb-1">
                      Push<br/>Notifications
                    </p>
                    <p className="text-sm text-[#42493c] tracking-[0.25px]">
                      Direct messages &<br/>replies
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={pushNotifications}
                      onChange={e => setPushNotifications(e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#386a20] relative transition-colors">
                      <div className="absolute top-0.5 left-0.5 bg-white rounded-full h-5 w-5 transition-transform peer-checked:translate-x-6 shadow-sm"></div>
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Security Section */}
          <div className="bg-white border border-[#e0e4da] rounded-[28px] shadow-sm p-6 md:p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-[#ffdad6] rounded-full flex items-center justify-center">
                <Shield size={20} className="text-[#ba1a1a]" />
              </div>
              <h3 className="text-xl md:text-[22px] font-medium text-[#191d17] leading-7">Account Security</h3>
            </div>

            <div className="space-y-4">
              <div className="bg-[#f3f6e8] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Key size={22} className="text-[#42493c] mt-1 shrink-0" />
                  <div>
                    <p className="text-base font-medium text-[#191d17] tracking-[0.5px] mb-1">Password</p>
                    <p className="text-sm text-[#42493c] tracking-[0.25px]">Last changed 3 months ago</p>
                  </div>
                </div>
                <button className="bg-white border-2 border-[#72796b] px-6 py-2 rounded-full text-sm font-medium text-[#191d17] tracking-[0.1px] hover:bg-gray-50 transition-colors shrink-0">
                  Update
                </button>
              </div>

              <div className="bg-[#f3f6e8] rounded-xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <Smartphone size={22} className="text-[#42493c] mt-1 shrink-0" />
                  <div>
                    <p className="text-base font-medium text-[#191d17] tracking-[0.5px] mb-1">Two-Factor Authentication</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-[#205107] rounded-full"></div>
                      <p className="text-sm text-[#42493c] tracking-[0.25px]">Currently enabled</p>
                    </div>
                  </div>
                </div>
                <button className="bg-white border-2 border-[#72796b] px-6 py-2 rounded-full text-sm font-medium text-[#191d17] tracking-[0.1px] hover:bg-gray-50 transition-colors shrink-0">
                  Manage
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-4 pb-10">
            <button className="px-6 py-3 rounded-full text-sm font-medium text-[#42493c] tracking-[0.1px] hover:bg-gray-100 transition-colors">
              Cancel
            </button>
            <button className="bg-[#205107] text-white px-8 py-3 rounded-full text-sm font-medium tracking-[0.1px] shadow-sm hover:bg-[#1a4106] transition-colors">
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
