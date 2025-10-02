'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Issue } from '@/types/issue';

interface IssueCardProps {
  issue: Issue;
}

export function IssueCard({ issue }: IssueCardProps) {
  const router = useRouter();
  const [isDragging, setIsDragging] = useState(false);

  const onDragStart: React.DragEventHandler<HTMLDivElement> = (event) => {
    setIsDragging(true);
    event.dataTransfer.setData('text/plain', issue.id);
  };

  const onDragEnd: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    setIsDragging(false);
  };

  return (
    <Card
      className="cursor-pointer hover:scale-102 active:scale-98 hover:shadow-md active:shadow-none"
      onClick={() => router.push(`/issues/${issue.id}`)}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      style={{ cursor: isDragging ? 'grabbing' : 'pointer' }}
      draggable
    >
      <CardHeader>
        <CardTitle>{issue.title}</CardTitle>
        <CardDescription className="line-clamp-3 text-ellipsis">{issue.description}</CardDescription>
      </CardHeader>
    </Card>
  );
}
