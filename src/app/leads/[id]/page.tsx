'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Phone,
  Mail,
  MessageCircle,
  ShoppingCart,
  FileText,
  ArrowLeft,
  Wrench,
  PlusCircle, // Added for "Add Buyer" button
  Edit, // Added for "Edit Buyer" button
  Trash2, // Added for "Delete Buyer" button
} from 'lucide-react';

type Lead = {
  id: string;
  name: string;
  company?: string;
  document?: string;
  email?: string;
  phone?: string;
  origin?: string;
  market?: string;
  stage: string;
  createdAt: string;
};

type Activity = {
  id: string;
  type: 'CALL' | 'WHATSAPP' | 'EMAIL' | 'SALE' | 'QUOTE' | 'PRODUCT_DEVELOPMENT';
  content: string;
  createdAt: string;
};

type Buyer = {
  id: string;
  name: string;
  role?: string;
  phone?: string;
  email?: string;
  leadId: string;
};

const activityTypes = ['CALL', 'WHATSAPP', 'EMAIL', 'SALE', 'QUOTE', 'PRODUCT_DEVELOPMENT'] as const;

const activityTypeLabels: Record<Activity['type'], string> = {
  CALL: 'Ligação',
  WHATSAPP: 'WhatsApp',
  EMAIL: 'E-mail',
  SALE: 'Venda',
  QUOTE: 'Cotação',
  PRODUCT_DEVELOPMENT: 'Desenvolvimento de Produto',
};

const activityTypeColors: Record<Activity['type'], string> = {
  CALL: 'text-blue-600',
  WHATSAPP: 'text-green-600',
  EMAIL: 'text-yellow-600',
  SALE: 'text-purple-600',
  QUOTE: 'text-rose-600',
  PRODUCT_DEVELOPMENT: 'text-orange-600',
};

const activityIcons: Record<Activity['type'], React.ReactElement> = {
  CALL: <Phone className="w-4 h-4 text-blue-600 inline-block" />,
  WHATSAPP: <MessageCircle className="w-4 h-4 text-green-600 inline-block" />,
  EMAIL: <Mail className="w-4 h-4 text-yellow-600 inline-block" />,
  SALE: <ShoppingCart className="w-4 h-4 text-purple-600 inline-block" />,
  QUOTE: <FileText className="w-4 h-4 text-rose-600 inline-block" />,
  PRODUCT_DEVELOPMENT: <Wrench className="w-4 h-4 text-orange-600 inline-block" />,
};

export default function LeadDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [type, setType] = useState<Activity['type']>('CALL');
  const [content, setContent] = useState('');

  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [newBuyer, setNewBuyer] = useState({
    name: '',
    role: '',
    phone: '',
    email: '',
  });

  const [isSaleModalOpen, setIsSaleModalOpen] = useState(false);
  const [saleValue, setSaleValue] = useState('');
  const [modalContent, setModalContent] = useState('');
  const [nextActivityContent, setNextActivityContent] = useState('');
  const [nextActivityDate, setNextActivityDate] = useState('');
  const [editingBuyerId, setEditingBuyerId] = useState<string | null>(null);


  useEffect(() => {
    async function fetchLead() {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/leads/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setLead(data);
      } else {
        router.push('/dashboard');
      }
    }

    async function fetchActivities() {
      const token = localStorage.getItem('access_token');
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities/lead/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setActivities(data);
      }
    }

    if (id) {
      fetchLead();
      fetchActivities();
      fetchBuyers();
    }
  }, [id, router]);

  async function fetchBuyers() {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyers/lead/${id}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      const data = await res.json();
      setBuyers(data);
    }
  }

  async function handleDeleteBuyer(id: string) {
    if (!confirm('Deseja realmente excluir este comprador?')) return;

    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyers/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (res.ok) {
      setBuyers((prev) => prev.filter((b) => b.id !== id));
    } else {
      alert('Erro ao excluir comprador.');
    }
  }

  async function handleUpdateBuyer(id: string, updatedData: Partial<Buyer>) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyers/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(updatedData),
    });

    if (res.ok) {
      const updatedBuyer = await res.json();
      setBuyers((prev) => prev.map((b) => (b.id === id ? updatedBuyer : b)));
      setEditingBuyerId(null); // Exit editing mode
    } else {
      alert('Erro ao atualizar comprador.');
    }
  }

  function handleTypeChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const selectedType = e.target.value as Activity['type'];
    setType(selectedType);
    setContent('');
  }

  async function submitActivity(typeToSubmit: Activity['type'], contentToSubmit: string) {
    const token = localStorage.getItem('access_token');
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/activities`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        leadId: id,
        type: typeToSubmit,
        content: contentToSubmit,
      }),
    });

    if (!res.ok) {
      alert('Erro ao registrar atividade.');
      return null;
    }

    return await res.json();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (type === 'SALE') {
      alert('Para vendas, utilize o botão "Registrar Venda".');
      return;
    }

    if (!content.trim()) {
      alert('Por favor, preencha o conteúdo.');
      return;
    }

    const newActivity = await submitActivity(type, content.trim());

    if (newActivity) {
      setActivities((prev) => [newActivity, ...prev]);
      setContent('');
    }
  }

  async function handleConfirmSale() {
    if (!saleValue || Number(saleValue) <= 0) {
      alert('Informe um valor válido para a venda.');
      return;
    }

    if (!modalContent.trim()) {
      alert('Por favor, informe o conteúdo da venda.');
      return;
    }

    if (!nextActivityContent.trim()) {
      alert('Por favor, informe o conteúdo da próxima atividade.');
      return;
    }

    if (!nextActivityDate) {
      alert('Por favor, informe a data e hora da próxima atividade.');
      return;
    }

    const saleContent = `${modalContent.trim()} | Valor: R$ ${parseFloat(saleValue).toFixed(2)}`;
    const newSaleActivity = await submitActivity('SALE', saleContent);
    if (!newSaleActivity) return;

    setActivities((prev) => [newSaleActivity, ...prev]);

    const contentWithDate = `${nextActivityContent.trim()} | Agendado para: ${new Date(
      nextActivityDate
    ).toLocaleString()}`;
    const newNextActivity = await submitActivity('CALL', contentWithDate);
    if (!newNextActivity) return;

    setActivities((prev) => [newNextActivity, ...prev]);

    setNextActivityContent('');
    setNextActivityDate('');
    setIsSaleModalOpen(false);
    setSaleValue('');
    setModalContent('');
  }

  if (!lead)
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <p className="text-gray-600 text-lg">Carregando...</p>
      </div>
    );

  return (
    <div className="p-6 max-w-7xl mx-auto bg-gray-50 min-h-screen">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 mb-6 text-rose-500 hover:text-rose-700 font-semibold transition duration-200"
      >
        <ArrowLeft className="w-5 h-5" />
        Voltar
      </button>

      {/* Lead Company Name */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8 border-b-2 border-gray-200 pb-4">
        {lead.company}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lead Details Card */}
        <div className="lg:col-span-1 bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Detalhes do Lead</h2>
          <p>
            <strong className="text-gray-600">Nome:</strong> {lead.name}
          </p>
          <p>
            <strong className="text-gray-600">Empresa:</strong> {lead.company || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Documento:</strong> {lead.document || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Email:</strong> {lead.email || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Telefone:</strong> {lead.phone || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Origem:</strong> {lead.origin || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Mercado:</strong> {lead.market || '-'}
          </p>
          <p>
            <strong className="text-gray-600">Etapa do funil:</strong>{' '}
            <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-sm font-medium">
              {lead.stage}
            </span>
          </p>
          <p>
            <strong className="text-gray-600">Criado em:</strong>{' '}
            {new Date(lead.createdAt).toLocaleString()}
          </p>
        </div>

        {/* Buyers Section */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-lg border border-gray-200 p-6 space-y-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Compradores</h2>

          {buyers.length === 0 && (
            <p className="text-gray-500 italic">Nenhum comprador cadastrado.</p>
          )}

          <ul className="space-y-4">
            {buyers.map((b) => (
              <li
                key={b.id}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3"
              >
                {editingBuyerId === b.id ? (
                  // Edit Form for Buyer
                  <form
                    onSubmit={async (e) => {
                      e.preventDefault();
                      const formData = new FormData(e.currentTarget);
                      const updatedData: Partial<Buyer> = {
                        name: formData.get('name') as string,
                        role: formData.get('role') as string,
                        phone: formData.get('phone') as string,
                        email: formData.get('email') as string,
                      };
                      await handleUpdateBuyer(b.id, updatedData);
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-3 flex-1"
                  >
                    <input
                      type="text"
                      name="name"
                      placeholder="Nome*"
                      defaultValue={b.name}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    <input
                      type="text"
                      name="role"
                      placeholder="Cargo"
                      defaultValue={b.role || ''}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      name="phone"
                      placeholder="Telefone"
                      defaultValue={b.phone || ''}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="email"
                      name="email"
                      placeholder="E-mail"
                      defaultValue={b.email || ''}
                      className="w-full border border-gray-300 rounded-md p-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="col-span-full flex gap-2 justify-end">
                      <button
                        type="button"
                        onClick={() => setEditingBuyerId(null)}
                        className="px-4 py-2 text-sm rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 text-sm rounded-md bg-blue-600 text-white hover:bg-blue-700 transition duration-200"
                      >
                        Salvar
                      </button>
                    </div>
                  </form>
                ) : (
                  // Display Buyer Details
                  <div className="flex-1 space-y-1">
                    <p>
                      <strong className="text-gray-700">Nome:</strong> {b.name}
                    </p>
                    <p>
                      <strong className="text-gray-700">Cargo:</strong> {b.role || '-'}
                    </p>
                    <p>
                      <strong className="text-gray-700">Telefone:</strong> {b.phone || '-'}
                    </p>
                    <p>
                      <strong className="text-gray-700">Email:</strong> {b.email || '-'}
                    </p>
                  </div>
                )}

                <div className="flex gap-2 mt-2 md:mt-0">
                  <button
                    onClick={() => setEditingBuyerId(b.id)}
                    className="p-2 rounded-full text-blue-600 hover:bg-blue-100 transition duration-200"
                    title="Editar Comprador"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBuyer(b.id)}
                    className="p-2 rounded-full text-red-600 hover:bg-red-100 transition duration-200"
                    title="Excluir Comprador"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {buyers.length < 10 && (
            <form
              onSubmit={async (e) => {
                e.preventDefault();
                if (!newBuyer.name.trim()) {
                  alert('Nome é obrigatório');
                  return;
                }

                const token = localStorage.getItem('access_token');
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/buyers`, {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                  },
                  body: JSON.stringify({
                    ...newBuyer,
                    leadId: id,
                  }),
                });

                if (res.ok) {
                  const created = await res.json();
                  setBuyers((prev) => [...prev, created]);
                  setNewBuyer({ name: '', role: '', phone: '', email: '' });
                } else {
                  alert('Erro ao adicionar comprador.');
                }
              }}
              className="space-y-3 mt-6 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50"
            >
              <h4 className="font-semibold text-lg text-gray-700 flex items-center gap-2">
                <PlusCircle className="w-5 h-5 text-green-600" /> Adicionar Novo Comprador
              </h4>
              <input
                type="text"
                placeholder="Nome*"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={newBuyer.name}
                onChange={(e) => setNewBuyer((prev) => ({ ...prev, name: e.target.value }))}
                required
              />
              <input
                type="text"
                placeholder="Cargo"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={newBuyer.role}
                onChange={(e) => setNewBuyer((prev) => ({ ...prev, role: e.target.value }))}
              />
              <input
                type="text"
                placeholder="Telefone"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={newBuyer.phone}
                onChange={(e) => setNewBuyer((prev) => ({ ...prev, phone: e.target.value }))}
              />
              <input
                type="email"
                placeholder="E-mail"
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-green-500 text-sm"
                value={newBuyer.email}
                onChange={(e) => setNewBuyer((prev) => ({ ...prev, email: e.target.value }))}
              />
              <button
                type="submit"
                className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-md shadow-md transition duration-200 flex items-center gap-2"
              >
                <PlusCircle className="w-5 h-5" /> Adicionar Comprador
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Activities Section */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Register Activity Form */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-700 mb-5">Registrar Atividade</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="activityType" className="block font-medium text-gray-700 mb-1">
                Tipo
              </label>
              <select
                id="activityType"
                value={type}
                onChange={handleTypeChange}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200 bg-white"
              >
                {activityTypes.map((t) => (
                  <option key={t} value={t}>
                    {activityTypeLabels[t]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="activityContent" className="block font-medium text-gray-700 mb-1">
                Conteúdo
              </label>
              <textarea
                id="activityContent"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                rows={4}
                placeholder="Digite o conteúdo da atividade"
                disabled={type === 'SALE'} // não permite editar aqui se for venda
              />
            </div>

            <div className="flex gap-4 pt-2">
              <button
                type="submit"
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-2.5 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold"
                disabled={type === 'SALE'}
              >
                Registrar
              </button>
              {type === 'SALE' && (
                <button
                  type="button"
                  onClick={() => setIsSaleModalOpen(true)}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-lg shadow-md hover:from-purple-700 hover:to-purple-900 transition duration-200 font-semibold"
                >
                  Registrar Venda
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Activity History */}
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-6">
          <h3 className="text-xl font-semibold text-gray-700 mb-5">Histórico de Atividades</h3>
          <ul className="space-y-4 max-h-[400px] overflow-y-auto pr-3 custom-scrollbar">
            {activities.length === 0 && (
              <p className="text-gray-500 italic">Nenhuma atividade registrada ainda.</p>
            )}
            {activities.map((a) => (
              <li key={a.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                <div className="flex items-center gap-3 mb-1">
                  {activityIcons[a.type]}
                  <strong className={`${activityTypeColors[a.type]} text-md font-semibold`}>
                    {activityTypeLabels[a.type]}
                  </strong>
                  <span className="text-sm text-gray-500 ml-auto">
                    {new Date(a.createdAt).toLocaleString()}
                  </span>
                </div>
                <p className="text-gray-700 leading-relaxed">{a.content}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sale Modal */}
      {isSaleModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 p-4"
          onClick={() => setIsSaleModalOpen(false)}
        >
          <div
            className="bg-white rounded-xl p-8 max-w-lg w-full shadow-2xl border border-gray-200 relative"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-2xl font-bold text-gray-800 mb-6">Registrar Venda</h3>

            <div className="space-y-4">
              <div>
                <label htmlFor="saleValue" className="block mb-2 font-medium text-gray-700">
                  Valor da Venda (R$)
                </label>
                <input
                  id="saleValue"
                  type="number"
                  min="0"
                  step="0.01"
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                  value={saleValue}
                  onChange={(e) => setSaleValue(e.target.value)}
                  autoFocus
                  required
                />
              </div>

              <div>
                <label htmlFor="modalContent" className="block mb-2 font-medium text-gray-700">
                  Descrição da Venda
                </label>
                <textarea
                  id="modalContent"
                  value={modalContent}
                  onChange={(e) => setModalContent(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-purple-500 transition duration-200"
                  rows={3}
                  placeholder="Descreva os detalhes da venda"
                  required
                />
              </div>

              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-lg font-semibold text-gray-700 mb-3">Próxima Atividade</h4>
                <div>
                  <label htmlFor="nextActivityDate" className="block mb-2 font-medium text-gray-700">
                    Data e hora da próxima atividade
                  </label>
                  <input
                    id="nextActivityDate"
                    type="datetime-local"
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    value={nextActivityDate}
                    onChange={(e) => setNextActivityDate(e.target.value)}
                    required
                  />
                </div>

                <div className="mt-4">
                  <label htmlFor="nextActivityContent" className="block mb-2 font-medium text-gray-700">
                    Descrição da próxima atividade
                  </label>
                  <textarea
                    id="nextActivityContent"
                    value={nextActivityContent}
                    onChange={(e) => setNextActivityContent(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition duration-200"
                    rows={2}
                    placeholder="Conteúdo da próxima atividade"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-8">
              <button
                type="button"
                className="px-6 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition duration-200 font-semibold"
                onClick={() => setIsSaleModalOpen(false)}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmSale}
                className="bg-gradient-to-r from-purple-600 to-purple-800 text-white px-6 py-2.5 rounded-lg shadow-md hover:from-purple-700 hover:to-purple-900 transition duration-200 font-semibold"
              >
                Confirmar Venda
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}