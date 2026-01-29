'use client';

import { useState, useRef, useEffect } from 'react';
import { User } from '@supabase/supabase-js';
import { LogOut, User as UserIcon, Settings, ChevronDown } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

interface UserDropdownProps {
  user: User;
  position?: 'top' | 'bottom';
}

export default function UserDropdown({ user, position = 'bottom' }: UserDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User';
  const userEmail = user.email || '';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    // Force a full page reload to clear all client state
    window.location.href = '/';
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 rounded-lg px-3 py-2 transition-colors hover:bg-gray-800"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-r from-purple-500 to-pink-500">
          <span className="text-sm font-medium text-white">{userName.charAt(0).toUpperCase()}</span>
        </div>
        <div className="hidden text-left sm:block">
          <p className="text-sm font-medium text-white">{userName}</p>
          <p className="text-xs text-gray-400">{userEmail}</p>
        </div>
        <ChevronDown
          className={`h-4 w-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div
          className={`absolute right-0 w-56 rounded-lg border border-gray-800 bg-[#18181b] shadow-xl ${position === 'top' ? 'bottom-full mb-2' : 'mt-2'}`}
        >
          <div className="border-b border-gray-800 p-3">
            <p className="text-sm font-medium text-white">{userName}</p>
            <p className="text-xs text-gray-400">{userEmail}</p>
          </div>

          <div className="p-1">
            <button
              onClick={() => {
                router.push('/dashboard/settings');
                setIsOpen(false);
              }}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-gray-300 transition-colors hover:bg-gray-800 hover:text-white"
            >
              <Settings className="h-4 w-4" />
              Settings
            </button>

            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-red-400 transition-colors hover:bg-gray-800 hover:text-red-300"
            >
              <LogOut className="h-4 w-4" />
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
