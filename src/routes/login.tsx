import { Icon } from "@iconify/react";
import { createFileRoute, redirect, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { getCurrentUserFn, loginFn } from "../server/auth";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: typeof search.redirect === "string" ? search.redirect : "/",
  }),
  beforeLoad: async ({ search }) => {
    const user = await getCurrentUserFn();
    if (user) {
      throw redirect({ to: "/", replace: true, search });
    }
  },
  component: Login,
});

function Login() {
  const navigate = useNavigate();
  const { redirect: redirectTo } = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canSubmit = useMemo(
    () =>
      email.trim().length > 0 && password.trim().length > 0 && !isSubmitting,
    [email, password, isSubmitting],
  );

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      const result = await loginFn({
        data: { email: email.trim(), password },
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }

      await navigate({ to: redirectTo });
    } catch {
      setError("Une erreur est survenue. Réessaie.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-svh w-full max-w-sm flex-col justify-center px-6 py-10">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-sm">
        <Icon icon="mdi:wrench" className="h-7 w-7" />
      </div>

      <h1 className="mt-5 text-center text-2xl font-semibold tracking-tight">
        AliMecano
      </h1>

      <form className="mt-8 space-y-5" onSubmit={onSubmit}>
        <div className="space-y-2">
          <Label
            className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground"
            htmlFor="email"
          >
            E-MAIL
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setEmail(e.target.value)
            }
            placeholder="Entrez votre e-mail"
            className="h-12 rounded-xl text-sm"
            required
          />
        </div>

        <div className="space-y-2">
          <Label
            className="text-[11px] font-medium tracking-[0.16em] text-muted-foreground"
            htmlFor="password"
          >
            MOT DE PASSE
          </Label>

          <div className="relative">
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              value={password}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                setPassword(e.target.value)
              }
              placeholder="Entrez votre mot de passe"
              className="h-12 rounded-xl pr-12 text-sm"
              required
            />

            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              aria-label={
                showPassword
                  ? "Masquer le mot de passe"
                  : "Afficher le mot de passe"
              }
            >
              <Icon
                icon={showPassword ? "mdi:eye-off-outline" : "mdi:eye-outline"}
                className="h-5 w-5"
              />
            </button>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        ) : null}

        <Button
          type="submit"
          className="h-12 w-full rounded-xl bg-blue-600 text-white hover:bg-blue-700"
          disabled={!canSubmit}
        >
          {isSubmitting ? "Connexion…" : "Se connecter"}
        </Button>
      </form>
    </main>
  );
}
