'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LineChart, ReceiptText, Plus, Wallet } from 'lucide-react';
import Dock, { type DockItemData } from './Dock';

interface MobileBottomNavProps {
  onOpenAddExpense?: () => void;
}

export function MobileBottomNav({ onOpenAddExpense }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  // Add sits in the middle: it is the action, the others are destinations.
  const dockItems: DockItemData[] = [
    {
      icon: <Wallet className="w-5 h-5" />,
      label: 'Today',
      onClick: () => router.push('/'),
      className: pathname === '/' ? 'active' : '',
    },
    {
      icon: <LineChart className="w-5 h-5" />,
      label: 'Insights',
      onClick: () => router.push('/insights'),
      className: pathname === '/insights' ? 'active' : '',
    },
    ...(onOpenAddExpense
      ? [
          {
            icon: <Plus className="w-6 h-6" />,
            label: 'Add expense',
            onClick: onOpenAddExpense,
            className: 'bg-black text-white dark:bg-white dark:text-black shadow-lg',
          },
        ]
      : []),
    {
      icon: <ReceiptText className="w-5 h-5" />,
      label: 'Expenses',
      onClick: () => router.push('/expenses'),
      className: pathname === '/expenses' ? 'active' : '',
    },
  ];

  return (
    <div className="lg:hidden fixed bottom-2 left-0 right-0 z-50 pointer-events-auto">
      <Dock items={dockItems} panelHeight={64} baseItemSize={46} magnification={62} distance={140} />
    </div>
  );
}
