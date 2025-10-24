import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  loginSchema,
  type LoginFormData,
} from '@/schemas';

// Specific form hooks for better type safety and reusability
export function useLoginForm(defaultValues?: Partial<LoginFormData>) {
  return useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues,
    mode: 'onChange'
  });
}