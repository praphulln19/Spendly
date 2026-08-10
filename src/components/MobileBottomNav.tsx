'use client';

import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ReceiptText, Plus } from 'lucide-react';
import Dock, { type DockItemData } from './Dock';

interface MobileBottomNavProps {
  onOpenAddExpense?: () => void;
}

export function MobileBottomNav({ onOpenAddExpense }: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();

  const dockItems: DockItemData[] = [
    {
      icon: <LayoutDashboard className="w-5 h-5" />,
      label: 'Dashboard',
      onClick: () => router.push('/'),
      className: pathname === '/' ? 'active' : '',
    },
    ...(onOpenAddExpense
      ? [
          {
            icon: <Plus className="w-6 h-6" />,
            label: 'Add Expense',
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
      <Dock
        items={dockItems}
        panelHeight={64}
        baseItemSize={48}
        magnification={64}
        distance={140}
      />
    </div>
  );
}
