// src/components/dashboard/professional/layout/ProfessionalSidebar.tsx
// 📱 VERSÃO TOTALMENTE RESPONSIVA COM Z-INDEX CORRETO

"use client";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  CalendarDaysIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ShoppingBagIcon,
  ChartBarIcon,
  CogIcon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import { Avatar } from "../../common";
import { useAuth } from "@/contexts/AuthContext";

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
  const router = useRouter();
  const pathname = usePathname();
  const { signOut } = useAuth();

  const navigationItems = [
    {
      name: "Início",
      href: "/dashboard",
      icon: HomeIcon,
      description: "Feed e visão geral",
      color: "text-blue-600 bg-blue-50",
    },
    {
      name: "Minha Agenda",
      href: "/dashboard/agenda",
      icon: CalendarDaysIcon,
      description: "Consultas e disponibilidade",
      color: "text-emerald-600 bg-emerald-50",
    },
    {
      name: "Meus Pacientes",
      href: "/dashboard/pacientes",
      icon: UserGroupIcon,
      description: "Gestão de pacientes",
      color: "text-purple-600 bg-purple-50",
    },
    {
      name: "Prontuários",
      href: "/dashboard/prontuarios",
      icon: DocumentTextIcon,
      description: "Histórico e anotações",
      color: "text-orange-600 bg-orange-50",
    },
    {
      name: "Loja/Serviços",
      href: "/dashboard/loja",
      icon: ShoppingBagIcon,
      description: "Produtos e consultas",
      color: "text-green-600 bg-green-50",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: ChartBarIcon,
      description: "Métricas e relatórios",
      color: "text-indigo-600 bg-indigo-50",
    },
    {
      name: "Configurações",
      href: "/dashboard/configuracoes",
      icon: CogIcon,
      description: "Conta e preferências",
      color: "text-gray-600 bg-gray-50",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const profileData = profile?.dados;

  return (
    <>
      {/* 🔧 SIDEBAR COM Z-INDEX CORRIGIDO */}
      <div
        className={`
        fixed top-16 left-0 z-50 w-80 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
        shadow-xl lg:shadow-none
      `}
      >
        {/* 📱 BOTÃO FECHAR MOBILE */}
        <div className="lg:hidden flex justify-end p-4 border-b border-gray-100">
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 📱 PERFIL DO USUÁRIO - RESPONSIVO */}
        <div className="p-4 lg:p-6 border-b border-gray-200">
          <Link
            href="/dashboard/perfil"
            className="flex items-start space-x-3 lg:space-x-4 p-3 lg:p-4 rounded-xl hover:bg-gray-50 transition-colors group"
            onClick={onClose}
          >
            <Avatar
              src={profileData?.foto_perfil_url}
              alt={`${profileData?.nome} ${profileData?.sobrenome}`}
              size="md"
              className="flex-shrink-0"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-base lg:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                {profileData?.nome} {profileData?.sobrenome}
              </h3>

              <p className="text-xs lg:text-sm text-gray-600 mb-2 line-clamp-2">
                {profileData?.especialidades || "Profissional de Saúde Mental"}
              </p>

              <div className="flex items-center text-xs text-gray-500 mb-2">
                <span className="inline-flex items-center truncate">
                  📍 {profileData?.endereco_cidade},{" "}
                  {profileData?.endereco_estado}
                </span>
              </div>

              <div className="flex items-center">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verificado
                </span>
              </div>
            </div>
          </Link>

          {/* 📱 MÉTRICAS COMPACTAS */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="text-center p-2 lg:p-3 rounded-lg bg-blue-50">
              <div className="text-sm lg:text-lg font-semibold text-blue-600">
                52
              </div>
              <div className="text-xs text-blue-600">Visualizações</div>
            </div>
            <div className="text-center p-2 lg:p-3 rounded-lg bg-emerald-50">
              <div className="text-sm lg:text-lg font-semibold text-emerald-600">
                26
              </div>
              <div className="text-xs text-emerald-600">Conexões</div>
            </div>
          </div>
        </div>

        {/* 📱 NAVEGAÇÃO RESPONSIVA */}
        <nav className="p-3 lg:p-4">
          <div className="space-y-1 lg:space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center p-2 lg:p-3 rounded-lg transition-all duration-200 group
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

        {/* 📱 SEÇÃO INFERIOR - LOGOUT */}
        <div className="absolute bottom-0 left-0 right-0 p-3 lg:p-4 bg-gray-50 border-t border-gray-200">
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
    </>
  );
}
