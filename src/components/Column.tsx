'use client';

import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';

type Lead = {
  id: string;
  name: string;
  company?: string;
  stage: string;
  lastActivityAt?: string | null;  // adicionado só o campo opcional
};

type ColumnProps = {
  leads: Lead[];
  title: string;
  id: string; // id da etapa/funil para droppable
};

export function Column({ leads, title, id }: ColumnProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <section
      ref={setNodeRef}
      id={id}
      className={`w-64 bg-gray-100 rounded p-2 flex flex-col ${
        isOver ? 'bg-blue-100' : ''
      }`}
    >
      <h2 className="font-semibold mb-2">{title}</h2>
      <ul className="flex flex-col gap-2 overflow-auto max-h-[60vh]">
        {leads.map((lead) => (
          <LeadCard key={lead.id} lead={lead} />
        ))}
      </ul>
    </section>
  );
}

function LeadCard({ lead }: { lead: Lead }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: lead.id,
  });

  const router = useRouter();

  const style = {
    transform: transform
      ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
      : undefined,
    opacity: isDragging ? 0.5 : 1,
    cursor: 'grab',
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className="bg-white rounded p-2 shadow cursor-pointer"
      onPointerUp={() => router.push(`/leads/${lead.id}`)}
    >
      {lead.name} {lead.company ? `| ${lead.company}` : ''}
    </li>
  );
}
