'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button'; // shadcn/ui button

// Schema de validação com zod
const registerSchema = z.object({
  name: z.string().min(1, 'Nome obrigatório'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha mínima 6 caracteres'),
  role: z.enum(['ADMIN', 'COLLABORATOR']),
});

type RegisterFormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const API_URL = process.env.NEXT_PUBLIC_API_URL;

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setError('');

    if (!API_URL) {
      setError('Erro interno: API URL não configurada.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.message || 'Erro ao criar usuário');
        setLoading(false);
        return;
      }

      alert('Usuário criado com sucesso!');
      reset();
      router.push('/login'); // Redireciona para login após registro
    } catch (err) {
      console.error('Erro ao criar usuário:', err);
      setError('Erro inesperado, tente novamente.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded shadow-md bg-white">
      <h1 className="text-2xl font-bold mb-6 text-center">Cadastrar Usuário</h1>

      {error && (
        <div className="mb-4 text-red-600 font-semibold text-center">{error}</div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block font-medium mb-1">
            Nome
          </label>
          <input
            id="name"
            type="text"
            {...register('name')}
            className="input input-bordered w-full"
            placeholder="Nome completo"
            disabled={loading}
          />
          {errors.name && (
            <p className="text-red-600 text-sm mt-1">{errors.name.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="block font-medium mb-1">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register('email')}
            className="input input-bordered w-full"
            placeholder="email@exemplo.com"
            disabled={loading}
          />
          {errors.email && (
            <p className="text-red-600 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block font-medium mb-1">
            Senha
          </label>
          <input
            id="password"
            type="password"
            {...register('password')}
            className="input input-bordered w-full"
            placeholder="Senha"
            disabled={loading}
          />
          {errors.password && (
            <p className="text-red-600 text-sm mt-1">{errors.password.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="role" className="block font-medium mb-1">
            Papel
          </label>
          <select
            id="role"
            {...register('role')}
            className="select select-bordered w-full"
            defaultValue="ADMIN"
            disabled={loading}
          >
            <option value="ADMIN">ADMIN</option>
            <option value="COLLABORATOR">COLLABORATOR</option>
          </select>
          {errors.role && (
            <p className="text-red-600 text-sm mt-1">{errors.role.message}</p>
          )}
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full"
        >
          {loading ? 'Cadastrando...' : 'Cadastrar'}
        </Button>
      </form>
    </div>
  );
}
