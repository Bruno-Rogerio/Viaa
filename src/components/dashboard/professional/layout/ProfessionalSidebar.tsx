// src/components/dashboard/professional/layout/ProfessionalSidebar.tsx
// 🔧 VERSÃO CORRIGIDA - Botão logout fixo e JSX válido

"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

const navigation = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
    description: "Visão geral",
    color: "text-blue-600",
  },
  {
    name: "Agenda",
    href: "/dashboard/agenda",
    icon: CalendarIcon,
    description: "Consultas e horários",
    color: "text-emerald-600",
  },
  {
    name: "Perfil",
    href: "/dashboard/perfil",
    icon: UserIcon,
    description: "Meus dados",
    color: "text-purple-600",
  },
  {
    name: "Feed",
    href: "/dashboard/feed",
    icon: ChatBubbleLeftRightIcon,
    description: "Rede social",
    color: "text-rose-600",
  },
  {
    name: "Prontuários",
    href: "/dashboard/prontuarios",
    icon: DocumentTextIcon,
    description: "Registros médicos",
    color: "text-amber-600",
  },
  {
    name: "Analytics",
    href: "/dashboard/analytics",
    icon: ChartBarIcon,
    description: "Relatórios",
    color: "text-cyan-600",
  },
];

interface ProfessionalSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function ProfessionalSidebar({
  isOpen,
  onClose,
  profile,
}: ProfessionalSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  // Detectar se é mobile
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  return (
    <div
      className={`
        ${isMobile ? "fixed" : "fixed lg:static"} 
        inset-y-0 left-0 z-50 
        ${isMobile ? "w-80" : "w-80 lg:w-72"} 
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${!isMobile ? "lg:translate-x-0" : ""}
        bg-white shadow-xl border-r border-gray-200
      `}
    >
      {/* 🔧 CONTAINER PRINCIPAL COM FLEXBOX E ALTURA TOTAL */}
      <div className="h-full flex flex-col">
        {/* 📱 HEADER DA SIDEBAR */}
        <div className="flex-shrink-0 p-4 lg:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg lg:text-xl font-bold text-gray-900">
              Dashboard
            </h2>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 🔧 NAVEGAÇÃO PRINCIPAL - ÁREA EXPANSÍVEL */}
        <nav className="flex-1 overflow-y-auto p-3 lg:p-4">
          <div className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`
                    flex items-center w-full p-2 lg:p-3 rounded-lg transition-all duration-200 group
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200 shadow-sm"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <div
                    className={`
                      p-1.5 lg:p-2 rounded-lg mr-3 transition-colors
                      ${
                        isActive
                          ? item.color
                          : "text-gray-400 group-hover:text-gray-600"
                      }
                    `}
                  >
                    <Icon className="w-4 h-4 lg:w-5 lg:h-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm lg:text-base font-medium truncate">
                      {item.name}
                    </div>
                    <div className="text-xs text-gray-500 truncate mt-0.5 lg:block hidden">
                      {item.description}
                    </div>
                  </div>

                  {isActive && (
                    <div className="w-2 h-2 bg-blue-600 rounded-full flex-shrink-0" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 🔧 SEÇÃO LOGOUT - FIXADA NO RODAPÉ */}
        <div className="flex-shrink-0 p-3 lg:p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-2 lg:p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors group"
          >
            <div className="p-1.5 lg:p-2 rounded-lg mr-3 text-red-500 group-hover:bg-red-100 transition-colors">
              <ArrowRightOnRectangleIcon className="w-4 h-4 lg:w-5 lg:h-5" />
            </div>
            <span className="text-sm lg:text-base font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
