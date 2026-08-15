import {
  Utensils,
  Bus,
  GraduationCap,
  Home,
  Smartphone,
  ShoppingBag,
  Film,
  User,
  Repeat,
  CircleEllipsis,
  type LucideIcon,
} from 'lucide-react';
import type { ExpenseCategory } from '../types/expense';

/** Shared so the list and the breakdown can never drift apart. */
export const categoryIcons: Record<ExpenseCategory, LucideIcon> = {
  Food: Utensils,
  Transport: Bus,
  Education: GraduationCap,
  'Rent/Hostel': Home,
  'Mobile/Internet': Smartphone,
  Shopping: ShoppingBag,
  Entertainment: Film,
  Personal: User,
  Subscriptions: Repeat,
  Other: CircleEllipsis,
};

export const fallbackCategoryIcon = CircleEllipsis;
