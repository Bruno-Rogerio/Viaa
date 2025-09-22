// src/components/dashboard/patient/layout/PatientSidebar.tsx
// 🔄 REUTILIZANDO 95% do ProfessionalSidebar - apenas navegação adaptada

"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  ChatBubbleLeftRightIcon,
  UserGroupIcon,
  HeartIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "@/contexts/AuthContext";

// 🎯 NAVEGAÇÃO ESPECÍFICA DO PACIENTE
const navigation = [
  {
    name: "Perfil",
    href: "/dashboard/perfil",
    icon: UserIcon,
  },
  {
    name: "Início",
    href: "/dashboard", // Dashboard principal
    icon: HomeIcon,
  },
  {
    name: "Buscar Profissionais",
    href: "/dashboard/profissionais",
    icon: UserGroupIcon,
  },
  {
    name: "Minhas Consultas",
    href: "/dashboard/consultas",
    icon: CalendarIcon,
  },
  {
    name: "Bem-estar",
    href: "/dashboard/bem-estar",
    icon: HeartIcon,
  },
  {
    name: "Mensagens",
    href: "/dashboard/mensagens",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: "Configurações",
    href: "/dashboard/configuracoes",
    icon: CogIcon,
  },
];

interface PatientSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  profile: any;
}

export default function PatientSidebar({
  isOpen,
  onClose,
  profile,
}: PatientSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { signOut } = useAuth();

  // 🔄 REUTILIZADO: Lógica mobile igual
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 1024);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  return (
    <div
      className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "" : "lg:translate-x-0"}
      `}
    >
      {/* 🔄 REUTILIZADO: Estrutura flexbox igual */}
      <div className="h-full flex flex-col">
        {/* 🔄 REUTILIZADO: Header */}
        <div className="flex-shrink-0 p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-gray-900">Menu</h2>
            {isMobile && (
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* 🎯 NAVEGAÇÃO ADAPTADA - cores emerald */}
        <nav className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={isMobile ? onClose : undefined}
                  className={`
                    flex items-center p-3 rounded-lg transition-colors group
                    ${
                      isActive
                        ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>
                </Link>
              );
            })}
          </div>
        </nav>

        {/* 🔄 REUTILIZADO: Logout igual */}
        <div className="flex-shrink-0 p-4 bg-gray-50 border-t border-gray-200">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3" />
            <span className="font-medium">Sair</span>
          </button>
        </div>
      </div>
    </div>
  );
}
