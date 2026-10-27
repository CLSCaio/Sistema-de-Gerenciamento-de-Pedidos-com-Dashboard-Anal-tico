import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Field } from '@/components/ui/Field';
import { Input } from '@/components/ui/Input';
import { ApiError } from '@/services/http';
import { fieldErrors, loginSchema } from '@/utils/validation';

interface LoginFormProps {
  onSuccess: (email: string, password: string) => Promise<void>;
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function touch(key: 'email' | 'password') {
    const parsed = loginSchema.safeParse({ email, password });
    setErrors((current) => {
      const next = { ...current };
      const message = parsed.success ? undefined : fieldErrors(parsed.error)[key];
      if (message) next[key] = message;
      else delete next[key];
      return next;
    });
  }

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = loginSchema.safeParse({ email, password });
    if (!parsed.success) {
      setErrors(fieldErrors(parsed.error));
      return;
    }
    setErrors({});
    setSubmitting(true);
    try {
      await onSuccess(parsed.data.email, parsed.data.password);
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : 'Não foi possível entrar');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={(event) => void submit(event)} noValidate>
      <Field label="E-mail" htmlFor="email" error={errors.email}>
        <Input id="email" type="email" autoComplete="username" inputMode="email" value={email} invalid={Boolean(errors.email)} onChange={(event) => setEmail(event.target.value)} onBlur={() => touch('email')} />
      </Field>
      <Field label="Senha" htmlFor="password" error={errors.password}>
        <Input id="password" type="password" autoComplete="current-password" value={password} invalid={Boolean(errors.password)} onChange={(event) => setPassword(event.target.value)} onBlur={() => touch('password')} />
      </Field>
      {formError ? <p className="text-sm text-clay">{formError}</p> : null}
      <Button type="submit" disabled={submitting}>
        {submitting ? 'Entrando...' : 'Entrar'}
      </Button>
    </form>
  );
}
