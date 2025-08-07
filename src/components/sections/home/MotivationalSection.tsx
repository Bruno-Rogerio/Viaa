// components/MotivationalSection.tsx
'use client'

import { useState, useEffect } from 'react'

const frasesMotivacionais = [
  {
    frase: "Cuidar da sua mente é um ato de amor próprio que transforma toda a sua vida.",
    autor: "Autoconhecimento"
  },
  {
    frase: "Cada pequeno passo em direção ao bem-estar mental é uma vitória que merece ser celebrada.",
    autor: "Progresso"
  },
  {
    frase: "Você não precisa carregar tudo sozinho. Buscar ajuda é um sinal de força, não de fraqueza.",
    autor: "Coragem"
  },
  {
    frase: "A jornada para o equilíbrio mental não tem um destino final, mas cada dia é uma oportunidade de crescer.",
    autor: "Crescimento"
  },
  {
    frase: "Suas emoções são válidas, seus sentimentos importam, e você merece cuidado e compreensão.",
    autor: "Validação"
  },
  {
    frase: "A terapia não é sobre consertar o que está quebrado, mas sobre descobrir a força que sempre existiu em você.",
    autor: "Empoderamento"
  },
  {
    frase: "Permita-se sentir, permita-se curar, permita-se começar de novo quantas vezes for necessário.",
    autor: "Renovação"
  },
  {
    frase: "O primeiro passo para a mudança é reconhecer que você merece uma vida plena e feliz.",
    autor: "Transformação"
  }
]

export default function MotivationalSection() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // Randomizar a primeira frase
    setCurrentIndex(Math.floor(Math.random() * frasesMotivacionais.length))
    
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % frasesMotivacionais.length)
    }, 6000)
    
    return () => clearInterval(timer)
  }, [])

  return (
    <section className="py-20 bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-800 text-white overflow-hidden relative">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-white/20 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-br from-white/10 to-transparent rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Inspiração para sua <span className="bg-gradient-to-r from-pink-300 to-purple-300 bg-clip-text text-transparent">Jornada</span>
          </h2>
          <p className="text-xl text-purple-100 max-w-3xl mx-auto">
            Palavras que nutrem a alma e fortalecem a mente para continuar caminhando
          </p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="relative min-h-[200px] flex items-center justify-center">
            <div className="text-center">
              <div className="mb-8">
                <span className="text-6xl md:text-8xl font-serif text-purple-300/50">"</span>
              </div>
              
              <blockquote className="text-2xl md:text-3xl font-light leading-relaxed mb-8 px-8 transition-all duration-1000 ease-in-out">
                {frasesMotivacionais[currentIndex].frase}
              </blockquote>
              
              <div className="text-purple-300 text-lg font-medium">
                — {frasesMotivacionais[currentIndex].autor}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mt-12">
            <div className="w-full bg-purple-700/30 rounded-full h-1 overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-400 to-purple-400 transition-all duration-75 ease-out"
                style={{
                  animation: 'progress 6s linear infinite',
                }}
              ></div>
            </div>
          </div>

          {/* Dots indicator */}
          <div className="flex justify-center space-x-2 mt-8">
            {frasesMotivacionais.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'bg-gradient-to-r from-pink-400 to-purple-400 scale-125' 
                    : 'bg-purple-400/40 hover:bg-purple-400/60'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes progress {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}</style>
    </section>
  )
}
