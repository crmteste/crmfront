'use client';

import React, { useState } from 'react';
import Papa from 'papaparse';
import { Button } from '@/components/ui/button';
import { createLead } from '@/lib/api';
import { useRouter } from 'next/navigation';
import { ArrowLeft, UploadCloud, FileText, Loader2 } from 'lucide-react'; // Added icons

export default function BulkLeadUploadPage() {
  const [csvLeads, setCsvLeads] = useState<any[]>([]); // Changed to any[] for flexibility with PapaParse data
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      setFileName(null);
      setCsvLeads([]);
      setError(null);
      return;
    }
    setFileName(file.name);
    setError(null); // Clear previous errors

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        if (results.errors.length > 0) {
          setError('Erro ao processar o CSV. Verifique a formatação.');
          setCsvLeads([]);
          console.error('Erro no parsing do CSV:', results.errors);
          return;
        }
        setCsvLeads(results.data);
      },
      error: (error) => {
        setError('Erro ao ler o arquivo CSV.');
        setCsvLeads([]);
        console.error('Erro no parsing do CSV:', error);
      },
    });
  }

  async function handleImport() {
    setLoading(true);
    setError(null);

    if (csvLeads.length === 0) {
      setError('Nenhum lead para importar. Por favor, selecione um arquivo CSV válido.');
      setLoading(false);
      return;
    }

    try {
      // You can make in parallel with Promise.all, but be careful with rate limits
      for (const lead of csvLeads) {
        // Basic validation for 'name' field
        if (!lead.name || typeof lead.name !== 'string' || lead.name.trim() === '') {
          throw new Error('Cada lead no CSV deve ter um "name" válido.');
        }

        await createLead({
          name: lead.name,
          company: lead.company || '',
          document: lead.document || '',
          email: lead.email || '',
          phone: lead.phone || '',
          origin: lead.origin || '',
          market: lead.market || '',
          stage: 'entrada', // fixed funnel stage
          userId: '123', // or get userId from context/authentication
        });
      }
      router.push('/dashboard');
    } catch (err: any) {
      setError('Erro na importação: ' + (err.message || 'Verifique o formato do CSV.'));
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

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8 border border-gray-200 text-center">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Importar Leads via CSV</h1>

          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-8 mb-6 bg-gray-50 hover:border-blue-400 transition duration-200 relative">
            <input
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              aria-label="Upload CSV file"
            />
            <UploadCloud className="w-16 h-16 text-gray-400 mb-4" />
            <p className="text-gray-600 font-medium text-lg mb-2">
              Arraste e solte seu arquivo CSV aqui, ou clique para selecionar.
            </p>
            <p className="text-sm text-gray-500">
              Formato esperado: `name`, `company`, `document`, `email`, `phone`, `origin`, `market`
            </p>
          </div>

          {fileName && (
            <p className="mb-6 text-base text-gray-700 flex items-center justify-center gap-2">
              <FileText className="w-5 h-5 text-blue-600" />
              Arquivo selecionado:{' '}
              <strong className="text-blue-700">{fileName}</strong> -{' '}
              <span className="font-semibold">{csvLeads.length}</span> leads carregados.
            </p>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg relative mb-6">
              <strong className="font-bold">Erro:</strong>
              <span className="block sm:inline ml-2">{error}</span>
            </div>
          )}

          {csvLeads.length > 0 && (
            <Button
              onClick={handleImport}
              disabled={loading}
              className="w-full bg-gradient-to-r from-blue-600 to-blue-800 text-white px-6 py-3 rounded-lg shadow-md hover:from-blue-700 hover:to-blue-900 transition duration-200 disabled:opacity-60 disabled:cursor-not-allowed font-semibold flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin w-5 h-5" /> Importando Leads...
                </>
              ) : (
                <>
                  <UploadCloud className="w-5 h-5" /> Importar Leads
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}