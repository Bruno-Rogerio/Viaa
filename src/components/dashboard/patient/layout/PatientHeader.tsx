// src/components/dashboard/patient/layout/PatientHeader.tsx
// 🔧 CORRIGIDO - Links para estrutura correta

"use client";
import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  HomeIcon,
  CalendarDaysIcon,
  ChatBubbleLeftRightIcon,
  MagnifyingGlassIcon,
  Bars3Icon,
  UserGroupIcon,
  HeartIcon,
} from "@heroicons/react/24/outline";
import { SearchBar, NotificationBell, Avatar } from "../../common";

interface PatientHeaderProps {
  onMenuClick: () => void;
  user: any;
  profile: any;
}

export default function PatientHeader({
  onMenuClick,
  user,
  profile,
}: PatientHeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchOpen, setSearchOpen] = useState(false);

  // 🎯 NAVEGAÇÃO ESPECÍFICA DO PACIENTE - LINKS CORRETOS
  const navigationItems = [
    {
      name: "Início",
      href: "/dashboard/paciente",
      icon: HomeIcon,
      current: pathname === "/dashboard/paciente",
    },
    {
      name: "Profissionais",
      href: "/dashboard/paciente/profissionais",
      icon: UserGroupIcon,
      current: pathname.startsWith("/dashboard/paciente/profissionais"),
    },
    {
      name: "Consultas",
      href: "/dashboard/paciente/consultas",
      icon: CalendarDaysIcon,
      current: pathname.startsWith("/dashboard/paciente/consultas"),
    },
    {
      name: "Feed",
      href: "/dashboard/paciente/feed",
      icon: HeartIcon,
      current: pathname.startsWith("/dashboard/paciente/feed"),
    },
    {
      name: "Mensagens",
      href: "/dashboard/paciente/mensagens",
      icon: ChatBubbleLeftRightIcon,
      current: pathname.startsWith("/dashboard/paciente/mensagens"),
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo e Menu Mobile */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="p-2 rounded-md text-gray-500 hover:text-gray-600 hover:bg-gray-100 lg:hidden"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <Link
              href="/dashboard/paciente"
              className="flex items-center ml-4 lg:ml-0"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900 hidden sm:block">
                  VIAA
                </span>
              </div>
            </Link>
          </div>

          {/* Navegação Desktop */}
          <nav className="hidden lg:flex lg:space-x-8">
            {navigationItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`
                  flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                  ${
                    item.current
                      ? "bg-emerald-100 text-emerald-700"
                      : "text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                  }
                `}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>

          {/* Ações do usuário */}
          <div className="flex items-center space-x-4">
            {/* Search */}
            <button
              onClick={() => setSearchOpen(true)}
              className="p-2 text-gray-500 hover:text-gray-600 hover:bg-gray-100 rounded-md"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
            </button>

            {/* Notificações */}
            <NotificationBell />

            {/* Avatar */}
            <Avatar
              src={profile?.foto_perfil_url}
              alt={profile?.dados?.nome || user?.email || "Usuário"}
              size="sm"
            />
          </div>
        </div>
      </div>

      {/* Search Modal */}
      {searchOpen && (
        <div className="md:hidden absolute top-16 left-0 right-0 bg-white border-b border-gray-200 p-4">
          <SearchBar
            placeholder="Buscar terapeutas..."
            onSearch={(query) => {
              router.push(
                `/dashboard/profissionais?busca=${encodeURIComponent(query)}`
              );
              setSearchOpen(false);
            }}
            autoFocus
          />
          <button
            onClick={() => setSearchOpen(false)}
            className="mt-3 w-full text-center text-sm text-gray-500"
          >
            Cancelar
          </button>
        </div>
      )}
    </header>
  );
}
