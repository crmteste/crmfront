'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createLead } from '@/lib/api'; // Assuming this path is correct
import { ArrowLeft, Save, Loader2 } from 'lucide-react'; // Added Save and Loader2 icons

export default function NewLeadPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    name: '',
    company: '',
    document: '',
    email: '',
    phone: '',
    origin: '',
    market: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Primeira etapa do funil fixa
  const FIRST_STAGE = 'entrada';

  // userId será fixo ou pegar via autenticação
  // por enquanto vamos usar userId fictício '123'
  const USER_ID = '123';

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await createLead({ ...form, stage: FIRST_STAGE, userId: USER_ID });
      router.push('/dashboard'); // voltar para funil após criar
    } catch (err: any) {
      setError(err.message || 'Ocorreu um erro ao cadastrar o lead.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 lg:p-10">
      <div className="max-w-2xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 mb-8 text-rose-500 hover:text-rose-700 font-semibold transition duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Voltar
        </button>

        {/* Form Container */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200">
          <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Cadastrar Novo Lead</h1>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
              <strong className="font-bold">Erro:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <input
              type="text"
              name="name"
              placeholder="Nome *"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="text"
              name="company"
              placeholder="Empresa"
              value={form.company}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="text"
              name="document"
              placeholder="CPF ou CNPJ"
              value={form.document}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="email"
              name="email"
              placeholder="E-mail"
              value={form.email}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="tel"
              name="phone"
              placeholder="Telefone"
              value={form.phone}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="text"
              name="origin"
              placeholder="Origem"
              value={form.origin}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />
            <input
              type="text"
              name="market"
              placeholder="Mercado"
              value={form.market}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
            />

            <button
              type="submit"
              disabled={loading}
              className="mt-4 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Salvando...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" /> Salvar Lead
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}