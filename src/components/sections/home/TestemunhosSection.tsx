// viaa\src\components\sections\home\TestemunhosSection.tsx

"use client";

import { useState, useEffect } from "react";

interface Testemunho {
  id: number;
  nome: string;
  profissao: string;
  texto: string;
  avatar: string;
  tipo: "paciente" | "profissional" | "clinica";
}

const testemunhos: Testemunho[] = [
  {
    id: 1,
    nome: "Maria Silva",
    profissao: "Paciente",
    texto:
      "A VIAA transformou como eu cuido da minha saúde mental. Encontrar a psicóloga ideal nunca foi tão fácil!",
    avatar: "👩‍💼",
    tipo: "paciente",
  },
  {
    id: 2,
    nome: "Dr. Carlos Santos",
    profissao: "Psicólogo",
    texto:
      "Como profissional, a plataforma me ajudou a organizar minha agenda e alcançar mais pacientes. Excelente!",
    avatar: "👨‍⚕️",
    tipo: "profissional",
  },
  {
    id: 3,
    nome: "Clínica Bem Estar",
    profissao: "Clínica",
    texto:
      "Gerenciar nossa equipe de 15 profissionais ficou muito mais eficiente. Recomendamos a todos!",
    avatar: "🏥",
    tipo: "clinica",
  },
];

export default function TestemunhosSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testemunhos.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const getGradientClass = (tipo: string) => {
    switch (tipo) {
      case "paciente":
        return "from-rose-400 to-pink-500";
      case "profissional":
        return "from-emerald-400 to-teal-500";
      case "clinica":
        return "from-sky-400 to-blue-500";
      default:
        return "from-slate-400 to-slate-500";
    }
  };

  return (
    <section
      id="depoimentos"
      className="py-20 bg-gradient-to-br from-slate-50 to-warm-50"
    >
      <div className="container mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-800 mb-6">
            O que dizem sobre a{" "}
            <span className="bg-gradient-to-r from-rose-400 via-sky-400 to-emerald-400 bg-clip-text text-transparent">
              VIAA
            </span>
          </h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Histórias reais de transformação e crescimento através da nossa
            plataforma
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="relative overflow-hidden">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${currentIndex * 100}%)` }}
            >
              {testemunhos.map((testemunho) => (
                <div key={testemunho.id} className="w-full flex-shrink-0 px-4">
                  <div className="bg-white/70 backdrop-blur-sm rounded-3xl p-12 border border-warm-200/50 shadow-lg hover:shadow-xl transition-all duration-300">
                    <div className="text-center">
                      <div className="text-6xl mb-6">{testemunho.avatar}</div>
                      <blockquote className="text-2xl text-slate-700 font-medium leading-relaxed mb-8 italic">
                        "{testemunho.texto}"
                      </blockquote>
                      <div
                        className={`inline-flex items-center space-x-3 bg-gradient-to-r ${getGradientClass(
                          testemunho.tipo
                        )} bg-clip-text text-transparent`}
                      >
                        <div className="text-xl font-bold">
                          {testemunho.nome}
                        </div>
                        <div className="w-2 h-2 bg-current rounded-full opacity-60"></div>
                        <div className="text-lg font-medium">
                          {testemunho.profissao}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="flex justify-center space-x-3 mt-12">
            {testemunhos.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-4 h-4 rounded-full transition-all duration-300 ${
                  index === currentIndex
                    ? "bg-gradient-to-r from-rose-400 to-emerald-400 scale-110"
                    : "bg-slate-300 hover:bg-slate-400"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
