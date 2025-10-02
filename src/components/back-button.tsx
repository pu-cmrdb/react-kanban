'use client';

import { ArrowLeftIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import Link from 'next/link';

import { Button } from '@/components/ui/button';

export function BackButton({ className, ...props }: React.ComponentProps<typeof Link>) {
  const router = useRouter();

  return (
    <Button variant="outline" size="icon" onClick={() => router.back()} className={className}>
      <Link {...props}>
        <ArrowLeftIcon />
      </Link>
    </Button>
  );
};
