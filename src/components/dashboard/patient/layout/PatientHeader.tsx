// src/components/dashboard/patient/layout/PatientHeader.tsx
// 🔄 REUTILIZANDO 90% do ProfessionalHeader - apenas adaptações específicas

"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
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

  // 🎯 NAVEGAÇÃO ESPECÍFICA DO PACIENTE
  const navigationItems = [
    {
      name: "Início",
      href: "/dashboard",
      icon: HomeIcon,
      current: pathname === "/dashboard",
    },
    {
      name: "Buscar Profissionais",
      href: "/dashboard/profissionais",
      icon: UserGroupIcon,
      current: pathname.startsWith("/dashboard/profissionais"),
    },
    {
      name: "Minhas Consultas",
      href: "/dashboard/consultas",
      icon: CalendarDaysIcon,
      current: pathname.startsWith("/dashboard/consultas"),
    },
    {
      name: "Bem-estar",
      href: "/dashboard/bem-estar",
      icon: HeartIcon,
      current: pathname.startsWith("/dashboard/bem-estar"),
    },
    {
      name: "Mensagens",
      href: "/dashboard/mensagens",
      icon: ChatBubbleLeftRightIcon,
      current: pathname.startsWith("/dashboard/mensagens"),
    },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 🔄 REUTILIZADO: Logo e menu mobile */}
          <div className="flex items-center">
            <button
              onClick={onMenuClick}
              className="lg:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <Bars3Icon className="w-6 h-6" />
            </button>

            <Link href="/dashboard" className="flex items-center ml-4 lg:ml-0">
              <Image
                src="/logo-viaa.png"
                alt="VIAA"
                width={500}
                height={2000}
                className="h-20 w-auto"
                priority
              />
            </Link>
          </div>

          {/* 🎯 NAVEGAÇÃO ADAPTADA PARA PACIENTE */}
          <nav className="hidden lg:flex items-center space-x-8">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    item.current
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="w-5 h-5 mr-2" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* 🔄 REUTILIZADO: Busca, notificações e avatar */}
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <SearchBar
                placeholder="Buscar terapeutas, especialidades..."
                onSearch={(query) => {
                  // Redirecionar para busca de profissionais
                  router.push(
                    `/dashboard/profissionais?busca=${encodeURIComponent(
                      query
                    )}`
                  );
                }}
              />
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="md:hidden p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            >
              <MagnifyingGlassIcon className="w-6 h-6" />
            </button>

            <NotificationBell />

            <div className="flex items-center space-x-3">
              <Avatar
                src={profile?.dados?.foto_perfil_url}
                alt={`${profile?.dados?.nome} ${profile?.dados?.sobrenome}`}
                size="sm"
                onClick={() => router.push("/dashboard/perfil")}
                className="cursor-pointer"
              />

              <span className="hidden md:block text-sm font-medium text-gray-700">
                {profile?.dados?.nome}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 🔄 REUTILIZADO: Busca mobile */}
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
