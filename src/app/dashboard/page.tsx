'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { DndContext, closestCenter } from '@dnd-kit/core';
import { Column } from '@/components/Column'; // Assuming Column component handles individual lead display
import { Button } from '@/components/ui/button';
import { Plus, Boxes } from 'lucide-react'; // Added icons for buttons

const FUNIL_ETAPAS = ['entrada', 'primeiro_contato', 'cotacao', 'venda'];
const FUNIL_NOMES: Record<string, string> = {
  entrada: 'Entrada',
  primeiro_contato: 'Primeiro Contato',
  cotacao: 'Cotação',
  venda: 'Venda',
};

type Lead = {
  id: string;
  name: string;
  company?: string;
  stage: string;
};

export default function DashboardPage(): React.ReactNode {
  const router = useRouter();
  const [leads, setLeads] = useState<Lead[]>([]);
  const [userName, setUserName] = useState<string | null>(null);

  useEffect(() => {
    async function fetchLeads() {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setLeads(data);
    }
    fetchLeads();

    const storedName = localStorage.getItem('user_name');
    setUserName(storedName);
  }, []);

  function handleDragEnd(event: any) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const dragged = leads.find((l) => l.id === active.id);
    if (!dragged) return;

    const newLeads = leads.map((lead) =>
      lead.id === active.id ? { ...lead, stage: over.id } : lead
    );
    setLeads(newLeads);

    const token = localStorage.getItem('access_token');
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${active.id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ stage: over.id }),
    }).catch((error) => {
      console.error('Erro ao atualizar estágio do lead:', error);
    });
  }

  function logout() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_name');
    router.push('/login');
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8 lg:p-10">
      <div className="max-w-[1600px] mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 pb-4 border-b border-gray-200">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-6 sm:mb-0 lg:text-5xl">
            CRM Prometal EPIs
          </h1>
          <div className="flex items-center space-x-6">
            {userName && (
              <p className="text-gray-700 font-semibold">
                Seja bem-vindo, <span className="text-blue-600">{userName}</span> |{' '}
                <button
                  onClick={logout}
                  className="text-red-600 hover:underline focus:outline-none"
                >
                  Sair
                </button>
              </p>
            )}
            <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
              <Button
                onClick={() => router.push('/leads/new')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2 font-semibold text-base"
              >
                <Plus className="w-5 h-5" /> Cadastrar Lead
              </Button>
              <Button
                onClick={() => router.push('/leads/bulk')}
                className="bg-gray-700 hover:bg-gray-800 text-white px-6 py-3 rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2 font-semibold text-base"
              >
                <Boxes className="w-5 h-5" /> Cadastro em Massa
              </Button>
            </div>
          </div>
        </div>

        {/* Sales Funnel (Kanban Board) */}
        <DndContext onDragEnd={handleDragEnd} collisionDetection={closestCenter}>
          <div className="flex gap-8 overflow-x-auto pb-4 custom-scrollbar">
            {FUNIL_ETAPAS.map((etapa) => (
              <div
                key={etapa}
                className="bg-white rounded-xl shadow-lg flex-shrink-0 w-[340px] flex flex-col border border-gray-200"
              >
                {/* Column Header */}
                <div className="px-6 py-4 bg-gradient-to-r from-blue-500 to-blue-700 rounded-t-xl">
                  <h2 className="text-white text-xl font-bold uppercase tracking-wide">
                    {FUNIL_NOMES[etapa]}
                  </h2>
                </div>

                {/* Leads List within Column */}
                <div className="p-5 space-y-4 min-h-[350px] flex-grow">
                  <Column
                    id={etapa}
                    title={FUNIL_NOMES[etapa]}
                    leads={leads.filter((l) => l.stage === etapa)}
                  />
                </div>
              </div>
            ))}
          </div>
        </DndContext>
      </div>
    </div>
  );
}
