'use client'
import { useState, useEffect } from 'react'

const motivationalQuotes = [
  "A coragem não é a ausência do medo, mas a capacidade de agir apesar dele.",
  "Cada pequeno passo é uma vitória em sua jornada de autoconhecimento.",
  "Você tem o poder de reescrever sua história a qualquer momento.",
  "O autocuidado não é egoísmo, é necessidade.",
  "Suas emoções são válidas e merecem ser ouvidas.",
  "A mudança começa quando você decide que merece algo melhor.",
  "Você é mais resiliente do que imagina.",
  "Não existe momento perfeito para começar a se cuidar. O momento é agora."
]

export default function MotivationalCarousel() {
  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % motivationalQuotes.length)
    }, 4000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="py-12 bg-gradient-to-r from-[#A8C3A0]/20 to-[#FF6B6B]/20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-xl md:text-2xl font-bold text-[#1E1E2F] mb-8">
          Inspiração para sua jornada
        </h2>
        
        <div className="relative h-20 flex items-center justify-center">
          <p className="text-base md:text-lg text-[#1E1E2F] font-light italic leading-relaxed">
            "{motivationalQuotes[currentQuote]}"
          </p>
        </div>
        
        <div className="flex justify-center space-x-2 mt-6">
          {motivationalQuotes.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuote(index)}
              className={`w-2 h-2 rounded-full transition-all ${
                index === currentQuote ? 'bg-[#FF6B6B]' : 'bg-[#A8C3A0]/50'
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
