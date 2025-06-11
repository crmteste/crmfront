export interface Lead {
  id: string;
  name: string;
  email: string;
  stage: 'entrada' | 'primeiro_contato' | 'cotacao' | 'venda';
  lastActivityAt?: string | null; // ⬅️ adicionado
}
