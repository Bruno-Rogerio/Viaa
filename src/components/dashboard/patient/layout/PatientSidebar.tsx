// src/components/dashboard/patient/layout/PatientSidebar.tsx
// 🔧 CORRIGIDO - Links para estrutura correta

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

// 🎯 NAVEGAÇÃO ESPECÍFICA DO PACIENTE - LINKS CORRETOS
const navigation = [
  {
    name: "Início",
    href: "/dashboard/paciente", // Página principal do paciente
    icon: HomeIcon,
  },
  {
    name: "Perfil",
    href: "/dashboard/paciente/perfil",
    icon: UserIcon,
  },
  {
    name: "Buscar Profissionais",
    href: "/dashboard/paciente/profissionais",
    icon: UserGroupIcon,
  },
  {
    name: "Minhas Consultas",
    href: "/dashboard/paciente/consultas",
    icon: CalendarIcon,
  },
  {
    name: "Feed",
    href: "/dashboard/paciente/feed",
    icon: HeartIcon,
  },
  {
    name: "Mensagens",
    href: "/dashboard/paciente/mensagens",
    icon: ChatBubbleLeftRightIcon,
  },
  {
    name: "Configurações",
    href: "/dashboard/paciente/configuracoes",
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

  const nomeUsuario =
    profile?.dados && "nome" in profile.dados ? profile.dados.nome : "Paciente";

  return (
    <div
      className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "" : "lg:translate-x-0"}
      `}
    >
      {/* Header da Sidebar */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
              <span className="text-emerald-700 font-semibold">
                {nomeUsuario.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{nomeUsuario}</h3>
              <p className="text-sm text-gray-500">Paciente</p>
            </div>
          </div>
          {isMobile && (
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <XMarkIcon className="w-5 h-5 text-gray-500" />
            </button>
          )}
        </div>
      </div>

      {/* Navegação */}
      <nav className="flex-1 p-4">
        <ul className="space-y-2">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  onClick={() => isMobile && onClose()}
                  className={`
                    flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors
                    ${
                      isActive
                        ? "bg-emerald-100 text-emerald-700 border-r-2 border-emerald-500"
                        : "text-gray-700 hover:bg-gray-100"
                    }
                  `}
                >
                  <item.icon
                    className={`w-5 h-5 ${
                      isActive ? "text-emerald-600" : "text-gray-500"
                    }`}
                  />
                  <span className="font-medium">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <button
          onClick={handleLogout}
          className="flex items-center space-x-3 w-full px-4 py-3 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5" />
          <span className="font-medium">Sair</span>
        </button>
      </div>
    </div>
  );
}
