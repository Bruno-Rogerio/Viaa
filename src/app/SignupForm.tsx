"use client";
import { useState } from "react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    // Para produção: integraria um backend aqui (fetch/post)!  
  }

  if (sent) {
    return (
      <div className="text-cyan-400 font-semibold py-2">
        Obrigado pelo interesse! Em breve entraremos em contato. 🚀
      </div>
    );
  }

  return (
    <form
      className="flex flex-col sm:flex-row gap-3 justify-center items-center"
      onSubmit={handleSubmit}
    >
      <input
        type="email"
        placeholder="Seu melhor e-mail"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="px-4 py-2 rounded-md text-gray-900 bg-white focus:outline-cyan-400 w-full sm:w-auto min-w-[200px]"
      />
      <button
        type="submit"
        className="bg-cyan-500 hover:bg-cyan-400 text-white font-semibold rounded-md px-6 py-2 transition"
      >
        Quero ser avisado!
      </button>
    </form>
  );
}
