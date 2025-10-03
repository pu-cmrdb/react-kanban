'use client';

import { useMemo } from 'react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IssueCard } from '@/components/issue-card';
import { useIssue } from '@/components/providers/issue';

interface StatusColumnProps extends React.ComponentProps<typeof Card> {
  title: string;
  status: string;
}

export function StatusColumn({ title, status, ...props }: StatusColumnProps) {
  const { issues, patchIssue } = useIssue();

  const filtered = useMemo(() => issues.filter((issue) => issue.status === status), [issues, status]);
  const children = filtered.map((issue) => <IssueCard key={issue.id} issue={issue} />);

  const onDragOver: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  };

  const onDrop: React.DragEventHandler<HTMLDivElement> = (event) => {
    event.preventDefault();
    const id = event.dataTransfer.getData('text/plain');
    patchIssue(id, { status });
  };

  return (
    <Card
      onDragOver={onDragOver}
      onDrop={onDrop}
      {...props}
    >
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="text-base">
          {filtered.length}
          {' '}
          個
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {children}
        </div>
      </CardContent>
    </Card>
  );
}
