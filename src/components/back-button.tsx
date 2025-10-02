'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface BackButtonProps {
  className?: string;
}

export function BackButton({ className }: BackButtonProps) {
  const router = useRouter();

  return (
    <Button variant="outline" size="icon" onClick={() => router.back()} className={className}>
      <ArrowLeftIcon />
    </Button>
  );
};
