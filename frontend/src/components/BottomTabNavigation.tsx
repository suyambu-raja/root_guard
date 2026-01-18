import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import {
  Home,
  Gauge,
  Droplet,
  AlertTriangle,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TabItem {
  id: string;
  path: string;
  icon: React.ComponentType<any>;
  labelKey: string;
}

const tabs: TabItem[] = [
  {
    id: 'dashboard',
    path: '/',
    icon: Home,
    labelKey: 'nav.dashboard'
  },
  {
    id: 'irrigation',
    path: '/irrigation',
    icon: Droplet,
    labelKey: 'nav.irrigation'
  },
  {
    id: 'alerts',
    path: '/alerts',
    icon: AlertTriangle,
    labelKey: 'nav.alerts'
  },
  {
    id: 'analytics',
    path: '/analytics',
    icon: Gauge,
    labelKey: 'nav.analytics'
  },
  {
    id: 'settings',
    path: '/settings',
    icon: Settings,
    labelKey: 'nav.settings'
  }
];

export const BottomTabNavigation: React.FC = () => {
  const { t } = useTranslation();
  const location = useLocation();

  return (
    <>
      {/* Spacer to prevent content from being hidden behind the floating nav */}
      <div className="h-24" />

      {/* Full Width Navbar Container */}
      <div className="fixed bottom-0 left-0 right-0 z-50">
        <div className="w-full bg-white/95 backdrop-blur-xl border-t border-green-100 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.1)]">
          <div className="flex items-center justify-between px-6 py-3 pb-5 md:justify-center md:gap-12">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = location.pathname === tab.path;

              return (
                <NavLink
                  key={tab.id}
                  to={tab.path}
                  className={({ isActive }) => cn(
                    "flex flex-col items-center justify-center w-full py-2 px-1 relative rounded-xl transition-all duration-300",
                    "focus:outline-none focus:ring-2 focus:ring-green-400 lazy-tap",
                    isActive ? "text-emerald-700" : "text-stone-400 hover:text-stone-600"
                  )}
                  aria-label={`Navigate to ${t(tab.labelKey)}`}
                >
                  <div className="relative flex flex-col items-center">
                    {/* Active Background Indicator */}
                    {isActive && (
                      <motion.div
                        layoutId="activeTabProp"
                        className="absolute -inset-x-3 -inset-y-2 bg-gradient-to-t from-emerald-100 to-green-50/50 rounded-xl -z-10"
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                      />
                    )}

                    {/* Icon */}
                    <div className="relative">
                      <motion.div
                        animate={{
                          scale: isActive ? 1.1 : 1,
                          y: isActive ? -2 : 0
                        }}
                        transition={{ duration: 0.2 }}
                      >
                        <Icon
                          className={cn(
                            "w-6 h-6",
                            isActive ? "stroke-[2.5px]" : "stroke-[1.5px]"
                          )}
                        />
                      </motion.div>

                      {/* Natural Dot Indicator */}
                      {isActive && (
                        <motion.div
                          layoutId="activeDot"
                          className="absolute -bottom-2 left-0 right-0 h-1 w-1 mx-auto bg-emerald-500 rounded-full"
                          transition={{ duration: 0.2 }}
                        />
                      )}
                    </div>

                    {/* Label */}
                    <motion.span
                      className="text-[10px] font-semibold mt-1"
                      animate={{
                        opacity: isActive ? 1 : 0.7,
                        fontWeight: isActive ? 600 : 500
                      }}
                    >
                      {t(tab.labelKey)}
                    </motion.span>
                  </div>
                </NavLink>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
};