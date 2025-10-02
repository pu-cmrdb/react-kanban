import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface StatusBadgeProps {
  status: string;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const className = {
    todo: 'bg-sky-500/10 text-sky-500 border-sky-500',
    doing: 'bg-amber-500/10 text-amber-500 border-amber-500',
    done: 'bg-green-500/10 text-green-500 border-green-500',
    closed: 'bg-gray-500/10 text-gray-500 border-gray-500',
  }[status] ?? 'bg-gray-500/10 text-gray-500 border-gray-500';

  const label = {
    todo: '📝 還沒做',
    doing: '🚧 正在做',
    done: '✅ 做完ㄌ',
    closed: '📦 放棄',
  }[status] ?? '? 未知狀態';

  return <Badge variant="outline" className={cn('text-base', className)}>{label}</Badge>;
}
