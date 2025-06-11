'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { useRouter } from 'next/navigation';
import dayjs from 'dayjs';

type Lead = {
  id: string;
  name: string;
  company?: string;
  stage: string;
  lastActivityAt?: string | null;
};

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

  // Define a cor de fundo conforme a data da última atividade
  let bgColor = 'bg-white';

  if (lead.lastActivityAt) {
    const daysSince = dayjs().diff(dayjs(lead.lastActivityAt), 'day');

    if (daysSince <= 15) bgColor = 'bg-green-100';
    else if (daysSince <= 25) bgColor = 'bg-yellow-100';
    else bgColor = 'bg-red-100';
  } else {
    bgColor = 'bg-red-100'; // sem atividade registrada, vermelho
  }

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`${bgColor} rounded p-2 shadow cursor-pointer`}
      onPointerUp={() => router.push(`/leads/${lead.id}`)}
    >
      {lead.name} {lead.company ? `| ${lead.company}` : ''}
    </li>
  );
}

export { LeadCard };
