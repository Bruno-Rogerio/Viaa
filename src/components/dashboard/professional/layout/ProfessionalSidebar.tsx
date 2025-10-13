"use client";
import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";

import {
  HomeIcon,
  CalendarIcon,
  UserIcon,
  DocumentTextIcon,
  ChartBarIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

import { useAuth } from "@/contexts/AuthContext";
import { contarConsultasPendentesProfissional } from "@/utils/consultas-client"; // <- IMPORTADO!

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
  const [isMobile, setIsMobile] = useState(false);

  // NOVO: Estado para guardar o número de pendentes
  const [consultasPendentes, setConsultasPendentes] = useState(0);

  // NOVO: Recupera o id do profissional certinho
  const profissionalId = profile?.dados?.id;

  // NOVO: Busca a quantidade toda vez que profile mudar (ou ao abrir)
  useEffect(() => {
    if (!profissionalId) {
      setConsultasPendentes(0);
      return;
    }
    contarConsultasPendentesProfissional(profissionalId).then(
      setConsultasPendentes
    );
  }, [profissionalId]);

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

  // Agora você pode usar consultasPendentes aqui!
  const navigation = [
    {
      name: "Perfil",
      href: "/dashboard/perfil",
      icon: UserIcon,
    },
    {
      name: "Feed",
      href: "/dashboard", // Feed é o dashboard principal
      icon: HomeIcon,
    },
    {
      name: "Agenda",
      href: "/dashboard/agenda",
      icon: CalendarIcon,
    },
    {
      name: "Consultas",
      href: "/dashboard/profissional/consultas",
      icon: CalendarIcon,
      badge: consultasPendentes,
    },
    {
      name: "Prontuários",
      href: "/dashboard/prontuarios",
      icon: DocumentTextIcon,
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: ChartBarIcon,
    },
    {
      name: "Configurações",
      href: "/dashboard/configuracoes",
      icon: CogIcon,
    },
  ];

  return (
    <div
      className={`
        fixed top-16 left-0 z-50 h-[calc(100vh-4rem)] w-72 bg-white border-r border-gray-200 shadow-lg
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        ${isMobile ? "" : "lg:translate-x-0"}
      `}
    >
      {/* 🔧 ESTRUTURA FLEXBOX SIMPLES */}
      <div className="h-full flex flex-col">
        {/* 📱 HEADER */}
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
        {/* 🔧 NAVEGAÇÃO - ÁREA QUE EXPANDE */}
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
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50"
                    }
                  `}
                >
                  <Icon className="w-5 h-5 mr-3" />
                  <span className="font-medium">{item.name}</span>

                  {/* MOSTRA BADGE SE FOR CONSULTAS E HOUVER PENDENTES */}
                  {item.name === "Consultas" && !!item.badge && (
                    <span className="ml-auto bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </nav>
        {/* 🔧 LOGOUT - SEMPRE NO BOTTOM */}
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
