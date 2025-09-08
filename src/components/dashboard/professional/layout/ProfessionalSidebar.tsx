// viaa\src\components\dashboard\professional\layout\ProfessionalSidebar.tsx

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
} from "@heroicons/react/24/outline";
import { Avatar } from "../../common"; // Corrigido para ../../common
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
      name: "Minha Agenda",
      href: "/dashboard/agenda",
      icon: CalendarDaysIcon,
      description: "Consultas e disponibilidade",
    },
    {
      name: "Meus Pacientes",
      href: "/dashboard/pacientes",
      icon: UserGroupIcon,
      description: "Gestão de pacientes",
    },
    {
      name: "Prontuários",
      href: "/dashboard/prontuarios",
      icon: DocumentTextIcon,
      description: "Histórico e anotações",
    },
    {
      name: "Loja/Serviços",
      href: "/dashboard/loja",
      icon: ShoppingBagIcon,
      description: "Produtos e consultas",
    },
    {
      name: "Analytics",
      href: "/dashboard/analytics",
      icon: ChartBarIcon,
      description: "Métricas e relatórios",
    },
    {
      name: "Configurações",
      href: "/dashboard/configuracoes",
      icon: CogIcon,
      description: "Conta e preferências",
    },
  ];

  const handleLogout = async () => {
    await signOut();
    router.push("/");
  };

  const profileData = profile?.dados;

  return (
    <>
      <div
        className={`
        fixed top-16 left-0 z-40 w-80 h-[calc(100vh-4rem)] bg-white border-r border-gray-200 transform transition-transform duration-300 ease-in-out overflow-y-auto
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        lg:translate-x-0
      `}
      >
        <div className="lg:hidden flex justify-end p-4">
          <button
            onClick={onClose}
            className="p-2 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
          >
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 border-b border-gray-200">
          <Link
            href="/dashboard/perfil"
            className="flex items-start space-x-4 p-4 rounded-xl hover:bg-gray-50 transition-colors group"
            onClick={onClose}
          >
            <Avatar
              src={profileData?.foto_perfil_url}
              alt={`${profileData?.nome} ${profileData?.sobrenome}`}
              size="lg"
            />

            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {profileData?.nome} {profileData?.sobrenome}
              </h3>

              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {profileData?.especialidades || "Profissional de Saúde Mental"}
              </p>

              <div className="flex items-center text-xs text-gray-500">
                <span className="inline-flex items-center">
                  📍 {profileData?.endereco_cidade},{" "}
                  {profileData?.endereco_estado}
                </span>
              </div>

              <div className="mt-2">
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  ✓ Verificado
                </span>
              </div>
            </div>
          </Link>

          <div className="mt-4 grid grid-cols-2 gap-4">
            <div className="text-center p-3 rounded-lg bg-blue-50">
              <div className="text-lg font-semibold text-blue-600">52</div>
              <div className="text-xs text-blue-600">Visualizações</div>
            </div>
            <div className="text-center p-3 rounded-lg bg-emerald-50">
              <div className="text-lg font-semibold text-emerald-600">26</div>
              <div className="text-xs text-emerald-600">Conexões</div>
            </div>
          </div>
        </div>

        <nav className="p-4">
          <div className="space-y-2">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname.startsWith(item.href);

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={onClose}
                  className={`
                    flex items-center p-3 rounded-lg transition-colors group
                    ${
                      isActive
                        ? "bg-blue-50 text-blue-700 border border-blue-200"
                        : "text-gray-700 hover:bg-gray-50 hover:text-gray-900"
                    }
                  `}
                >
                  <Icon
                    className={`w-5 h-5 mr-3 ${
                      isActive
                        ? "text-blue-600"
                        : "text-gray-500 group-hover:text-gray-700"
                    }`}
                  />
                  <div>
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-gray-500">
                      {item.description}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="mt-8 pt-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg text-gray-700 hover:bg-red-50 hover:text-red-700 transition-colors group"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5 mr-3 text-gray-500 group-hover:text-red-600" />
              <span className="font-medium">Sair</span>
            </button>
          </div>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-gray-50">
          <div className="text-center">
            <div className="text-xs text-gray-500 mb-1">VIAA Profissional</div>
            <div className="text-xs text-gray-400">v1.0.0 • Janeiro 2025</div>
          </div>
        </div>
      </div>
    </>
  );
}
