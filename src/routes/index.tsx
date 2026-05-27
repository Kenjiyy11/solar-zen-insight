import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sun, Zap, Brain, Bell, Home, TrendingDown, ArrowRight, Sparkles, Plug, LineChart } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "SolarMind — Monitoramento Inteligente de Energia Solar" },
      { name: "description", content: "Entenda, economize e aproveite melhor sua energia solar com inteligência artificial." },
      { property: "og:title", content: "SolarMind — Monitoramento Inteligente de Energia Solar" },
      { property: "og:description", content: "Sistema inteligente que conecta tomadas e medidores e usa IA para reduzir desperdícios." },
    ],
  }),
  component: Landing,
});

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Sun className="h-5 w-5" />
            </div>
            <span className="font-semibold tracking-tight">SolarMind</span>
          </div>
          <nav className="hidden gap-6 text-sm text-muted-foreground md:flex">
            <a href="#problema" className="hover:text-foreground">Problema</a>
            <a href="#solucao" className="hover:text-foreground">Solução</a>
            <a href="#como" className="hover:text-foreground">Como funciona</a>
            <a href="#beneficios" className="hover:text-foreground">Benefícios</a>
          </nav>
          <Button asChild size="sm">
            <Link to="/dashboard">Abrir painel</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--solar)_0%,_transparent_55%)] opacity-30" />
        <div className="mx-auto max-w-6xl px-6 pb-20 pt-16 md:pt-24">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs text-muted-foreground">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              IA para sua energia solar
            </div>
            <h1 className="text-4xl font-semibold tracking-tight md:text-6xl">
              Sistema Inteligente de<br />
              <span className="bg-gradient-to-r from-primary to-[var(--solar)] bg-clip-text text-transparent">
                Monitoramento de Energia Solar
              </span>
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-lg text-muted-foreground">
              Entenda, economize e aproveite melhor sua energia solar com inteligência artificial.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Button asChild size="lg" className="gap-2">
                <Link to="/dashboard">
                  Comece agora <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="#solucao">Ver como funciona</a>
              </Button>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              👉 Descubra onde você pode economizar mais.
            </p>
          </div>

          {/* Mock preview card */}
          <div className="mx-auto mt-16 max-w-4xl">
            <Card className="overflow-hidden border-2 p-0 shadow-2xl shadow-primary/10">
              <div className="grid gap-0 md:grid-cols-3">
                <Stat label="Gerado hoje" value="18,4 kWh" tone="solar" icon={<Sun className="h-4 w-4" />} />
                <Stat label="Consumo agora" value="2,3 kW" tone="primary" icon={<Zap className="h-4 w-4" />} />
                <Stat label="Economia no mês" value="R$ 387,20" tone="success" icon={<TrendingDown className="h-4 w-4" />} />
              </div>
              <div className="border-t bg-muted/30 p-5">
                <div className="flex items-start gap-3">
                  <Brain className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <p className="text-sm text-foreground/90">
                    <span className="font-medium">Insight da IA:</span> A sala teve um aumento de 25% no consumo nesta semana. O maior gasto aconteceu entre 18h e 22h — considere reduzir o ar-condicionado nesse horário.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Problema */}
      <Section id="problema" eyebrow="Problema" title="Você tem placas solares — mas sabe como está usando?">
        <div className="grid gap-4 md:grid-cols-2">
          {[
            "Onde você está gastando mais energia.",
            "Quais aparelhos consomem mais.",
            "Se está aproveitando bem a energia solar.",
            "Quanto realmente está economizando.",
          ].map((t) => (
            <Card key={t} className="flex items-start gap-3 p-5">
              <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-destructive" />
              <p className="text-foreground/90">{t}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Solução */}
      <Section id="solucao" eyebrow="Solução" title="Conecte. Entenda. Economize.">
        <p className="mb-8 max-w-2xl text-muted-foreground">
          Conectamos suas tomadas inteligentes e medidores existentes, coletamos dados em tempo real e usamos IA para interpretar e recomendar.
        </p>
        <div className="grid gap-4 md:grid-cols-3">
          <Feature icon={<Home className="h-5 w-5" />} title="Consumo por cômodo" text="Veja em tempo real quanto cada ambiente consome." />
          <Feature icon={<LineChart className="h-5 w-5" />} title="Comparativos" text="Diário, semanal e mensal — entenda tendências." />
          <Feature icon={<Bell className="h-5 w-5" />} title="Alertas inteligentes" text="Avisos quando algum cômodo gastar demais." />
          <Feature icon={<Brain className="h-5 w-5" />} title="Sugestões da IA" text="Recomendações automáticas para reduzir desperdícios." />
          <Feature icon={<Sun className="h-5 w-5" />} title="Relatórios solares" text="Quanto você gerou e o que isso economizou." />
          <Feature icon={<Plug className="h-5 w-5" />} title="Compatível" text="Funciona com várias marcas de sensores e tomadas." />
        </div>
      </Section>

      {/* Como funciona */}
      <Section id="como" eyebrow="Como funciona" title="Em quatro passos simples">
        <ol className="grid gap-4 md:grid-cols-4">
          {[
            "Conecte suas tomadas inteligentes.",
            "O app coleta consumo e geração solar.",
            "A IA interpreta e gera recomendações.",
            "Você acompanha em gráficos e relatórios.",
          ].map((t, i) => (
            <li key={t} className="rounded-xl border bg-card p-5">
              <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                {i + 1}
              </div>
              <p className="text-sm text-foreground/90">{t}</p>
            </li>
          ))}
        </ol>
      </Section>

      {/* Benefícios + Pitch */}
      <Section id="beneficios" eyebrow="Pitch" title="Economia, sustentabilidade e tecnologia em um só produto">
        <Card className="bg-gradient-to-br from-primary to-[oklch(0.45_0.15_160)] p-8 text-primary-foreground md:p-12">
          <p className="text-lg leading-relaxed md:text-xl">
            “Nosso sistema inteligente ajuda famílias com placas solares a entender e otimizar seu consumo de energia. Com IA, mostramos onde está o maior gasto, quanto foi economizado e damos sugestões práticas para reduzir desperdícios.”
          </p>
          <div className="mt-6">
            <Button asChild size="lg" variant="secondary" className="gap-2">
              <Link to="/dashboard">Abrir o painel <ArrowRight className="h-4 w-4" /></Link>
            </Button>
          </div>
        </Card>
      </Section>

      <footer className="border-t py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} SolarMind — Inteligência para sua energia solar.
        </div>
      </footer>
    </div>
  );
}

function Section({ id, eyebrow, title, children }: { id?: string; eyebrow: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="mx-auto max-w-6xl px-6 py-16 md:py-24">
      <div className="mb-10 max-w-2xl">
        <div className="mb-2 text-xs font-medium uppercase tracking-wider text-primary">{eyebrow}</div>
        <h2 className="text-3xl font-semibold tracking-tight md:text-4xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

function Feature({ icon, title, text }: { icon: React.ReactNode; title: string; text: string }) {
  return (
    <Card className="p-5">
      <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-accent-foreground">
        {icon}
      </div>
      <h3 className="mb-1 font-medium">{title}</h3>
      <p className="text-sm text-muted-foreground">{text}</p>
    </Card>
  );
}

function Stat({ label, value, tone, icon }: { label: string; value: string; tone: "primary" | "solar" | "success"; icon: React.ReactNode }) {
  const toneClass =
    tone === "solar" ? "text-[var(--solar-foreground)] bg-[var(--solar)]/20"
    : tone === "success" ? "text-[var(--success)] bg-[var(--success)]/15"
    : "text-primary bg-primary/10";
  return (
    <div className="p-6">
      <div className={`mb-3 inline-flex h-8 w-8 items-center justify-center rounded-md ${toneClass}`}>{icon}</div>
      <div className="text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-sm text-muted-foreground">{label}</div>
    </div>
  );
}
