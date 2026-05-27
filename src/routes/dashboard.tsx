import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { houses as initialHouses, roomWatts, houseWatts, generateHistory, generateHourly, type House, type Room } from "@/lib/mock-data";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Sun, Zap, Bell, Brain, TrendingDown, TrendingUp, Calendar, Home, Power } from "lucide-react";
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell, Legend,
} from "recharts";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Painel — SolarMind" },
      { name: "description", content: "Monitore o consumo de cada cômodo, alertas em tempo real e insights da IA." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [houses, setHouses] = useState<House[]>(() => structuredClone(initialHouses));
  const [houseId, setHouseId] = useState(houses[0].id);
  const house = houses.find((h) => h.id === houseId)!;
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(house.rooms[0].id);
  const selectedRoom = house.rooms.find((r) => r.id === selectedRoomId) ?? null;

  const toggleAppliance = (roomId: string, applianceName: string) => {
    setHouses((prev) =>
      prev.map((h) =>
        h.id !== houseId ? h : {
          ...h,
          rooms: h.rooms.map((r) =>
            r.id !== roomId ? r : {
              ...r,
              appliances: r.appliances.map((a) =>
                a.name === applianceName ? { ...a, on: !a.on } : a
              ),
            }
          ),
        }
      )
    );
  };


  // Live consumption tick (client-only to avoid SSR hydration mismatch)
  const [tick, setTick] = useState(0);
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
    const t = setInterval(() => setTick((x) => x + 1), 2000);
    return () => clearInterval(t);
  }, []);
  const jitter = (base: number) =>
    mounted ? +(base * (0.95 + ((tick * 37) % 11) / 100)).toFixed(0) : base;

  const totalW = jitter(houseWatts(house));
  const hourly = useMemo(() => generateHourly(house.id), [house.id]);
  const solarNowKw = mounted ? hourly[new Date().getHours()].solar : hourly[12].solar;

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b bg-background/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-6 py-3">
          <div className="flex items-center gap-3">
            <Button asChild variant="ghost" size="sm" className="gap-1">
              <Link to="/"><ArrowLeft className="h-4 w-4" /> Início</Link>
            </Button>
            <div className="hidden h-5 w-px bg-border md:block" />
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Sun className="h-4 w-4" />
              </div>
              <span className="font-semibold tracking-tight">SolarMind</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Home className="hidden h-4 w-4 text-muted-foreground md:block" />
            <Select value={houseId} onValueChange={(v) => { setHouseId(v); setSelectedRoomId(houses.find(h=>h.id===v)!.rooms[0].id); }}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Selecione a casa" />
              </SelectTrigger>
              <SelectContent>
                {houses.map((h) => (
                  <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {/* Title */}
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">{house.name}</h1>
            <p className="text-sm text-muted-foreground">{house.address} • Sistema solar de {house.solarKwp} kWp</p>
          </div>
          <LiveBadge />
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          <SummaryCard icon={<Zap className="h-4 w-4" />} label="Consumo agora" value={`${(totalW / 1000).toFixed(2)} kW`} tone="primary" />
          <SummaryCard icon={<Sun className="h-4 w-4" />} label="Geração solar agora" value={`${solarNowKw.toFixed(2)} kW`} tone="solar" />
          <SummaryCard icon={<TrendingDown className="h-4 w-4" />} label="Economia no mês" value="R$ 387,20" tone="success" />
          <SummaryCard icon={<Bell className="h-4 w-4" />} label="Alertas ativos" value={`${countAlerts(house)}`} tone="warning" />
        </div>

        <Tabs defaultValue="casa" className="mt-6">
          <TabsList>
            <TabsTrigger value="casa">Planta da casa</TabsTrigger>
            <TabsTrigger value="insights">Insights</TabsTrigger>
          </TabsList>

          {/* CASA TAB */}
          <TabsContent value="casa" className="mt-4">
            <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
              {/* Floor plan */}
              <Card className="p-4">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="font-medium">Planta — clique em um cômodo</h2>
                  <span className="text-xs text-muted-foreground">{house.rooms.length} cômodos</span>
                </div>
                <FloorPlan house={house} selectedId={selectedRoomId} onSelect={setSelectedRoomId} jitter={jitter} />
                <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                  <LegendDot className="bg-[var(--success)]" /> baixo
                  <LegendDot className="bg-[var(--warning)]" /> médio
                  <LegendDot className="bg-destructive" /> alto
                </div>
              </Card>

              {/* Room detail */}
              <RoomDetail room={selectedRoom} jitter={jitter} onToggle={toggleAppliance} />
            </div>
          </TabsContent>

          {/* INSIGHTS TAB */}
          <TabsContent value="insights" className="mt-4">
            <InsightsPanel house={house} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border bg-card px-3 py-1 text-xs">
      <span className="relative flex h-2 w-2">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[var(--success)] opacity-75" />
        <span className="relative inline-flex h-2 w-2 rounded-full bg-[var(--success)]" />
      </span>
      Ao vivo
    </div>
  );
}

function SummaryCard({ icon, label, value, tone }: { icon: React.ReactNode; label: string; value: string; tone: "primary"|"solar"|"success"|"warning" }) {
  const t = {
    primary: "bg-primary/10 text-primary",
    solar: "bg-[var(--solar)]/20 text-[var(--solar-foreground)]",
    success: "bg-[var(--success)]/15 text-[var(--success)]",
    warning: "bg-[var(--warning)]/20 text-[oklch(0.45_0.15_60)]",
  }[tone];
  return (
    <Card className="p-4">
      <div className={`mb-2 inline-flex h-7 w-7 items-center justify-center rounded-md ${t}`}>{icon}</div>
      <div className="text-xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </Card>
  );
}

function LegendDot({ className }: { className: string }) {
  return <span className={`inline-block h-2 w-2 rounded-full ${className}`} />;
}

function intensityClasses(watts: number, isSelected: boolean) {
  const base = "absolute rounded-lg border-2 transition-all cursor-pointer flex flex-col items-start justify-between p-2 text-left";
  const ring = isSelected ? "ring-2 ring-primary ring-offset-2 ring-offset-background z-10 scale-[1.02]" : "hover:scale-[1.01]";
  let color = "bg-[var(--success)]/15 border-[var(--success)]/40";
  if (watts > 400) color = "bg-[var(--warning)]/20 border-[var(--warning)]/50";
  if (watts > 1000) color = "bg-destructive/15 border-destructive/50";
  return `${base} ${color} ${ring}`;
}

function FloorPlan({ house, selectedId, onSelect, jitter }: { house: House; selectedId: string | null; onSelect: (id: string) => void; jitter: (n: number) => number }) {
  return (
    <div className="relative aspect-[4/3] w-full rounded-xl border-2 border-dashed bg-muted/40">
      {house.rooms.map((r) => {
        const w = jitter(roomWatts(r));
        return (
          <button
            key={r.id}
            onClick={() => onSelect(r.id)}
            className={intensityClasses(w, selectedId === r.id)}
            style={{ left: `${r.x}%`, top: `${r.y}%`, width: `${r.w}%`, height: `${r.h}%` }}
          >
            <span className="text-xs font-medium text-foreground">{r.name}</span>
            <span className="text-[11px] font-semibold tabular-nums text-foreground/80">
              {w} W
            </span>
          </button>
        );
      })}
    </div>
  );
}

function RoomDetail({ room, jitter, onToggle }: { room: Room | null; jitter: (n: number) => number; onToggle: (roomId: string, applianceName: string) => void }) {
  if (!room) return <Card className="p-6 text-sm text-muted-foreground">Selecione um cômodo na planta.</Card>;
  const total = jitter(roomWatts(room));
  const alert = roomWatts(room) > 1000;
  const activeCount = room.appliances.filter((a) => a.on).length;
  return (
    <Card className="p-5">
      <div className="mb-1 flex items-center justify-between">
        <h2 className="text-lg font-semibold">{room.name}</h2>
        <Badge variant={alert ? "destructive" : "secondary"}>{alert ? "Consumo alto" : "Normal"}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">Consumo em tempo real</p>
      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-4xl font-semibold tabular-nums">{total}</span>
        <span className="text-muted-foreground">W</span>
        <span className="ml-auto text-xs text-muted-foreground">≈ {(total / 1000).toFixed(2)} kW · {activeCount}/{room.appliances.length} ligados</span>
      </div>

      <div className="mt-5">
        <h3 className="mb-2 flex items-center gap-2 text-sm font-medium">
          <Power className="h-4 w-4 text-muted-foreground" /> Aparelhos
        </h3>
        <ul className="divide-y rounded-lg border">
          {room.appliances.map((a) => (
            <li key={a.name} className="flex items-center justify-between gap-3 px-3 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-3">
                <span className={`h-2 w-2 shrink-0 rounded-full transition-colors ${a.on ? "bg-[var(--success)]" : "bg-muted-foreground/40"}`} />
                <div className="min-w-0">
                  <div className="truncate font-medium">{a.name}</div>
                  <div className="text-xs text-muted-foreground tabular-nums">
                    {a.on ? `${a.watts} W agora` : `${a.watts} W quando ligado`}
                  </div>
                </div>
              </div>
              <Switch
                checked={a.on}
                onCheckedChange={() => onToggle(room.id, a.name)}
                aria-label={`Ligar/desligar ${a.name}`}
              />
            </li>
          ))}
        </ul>
      </div>

      {alert && (
        <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/40 bg-destructive/10 p-3 text-sm">
          <Bell className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          <span><span className="font-medium">Alerta ao vivo:</span> a {room.name.toLowerCase()} está consumindo acima do esperado agora.</span>
        </div>
      )}
    </Card>
  );
}

function countAlerts(house: House) {
  return house.rooms.filter((r) => roomWatts(r) > 1000).length;
}

/* ---------------- Insights ---------------- */

function InsightsPanel({ house }: { house: House }) {
  const [range, setRange] = useState<"7" | "30" | "90">("30");
  const [period, setPeriod] = useState<"dia" | "semana" | "mes">("dia");
  const days = parseInt(range, 10);
  const history = useMemo(() => generateHistory(house.id, days), [house.id, days]);

  // Aggregate by selected period
  const grouped = useMemo(() => groupBy(history, period), [history, period]);

  const totalConsumo = +history.reduce((s, d) => s + d.consumo, 0).toFixed(1);
  const totalSolar = +history.reduce((s, d) => s + d.solar, 0).toFixed(1);
  const economiaKwh = +Math.min(totalSolar, totalConsumo).toFixed(1);
  const economiaReais = +(economiaKwh * 0.95).toFixed(2);

  // Compare last half vs first half
  const half = Math.floor(history.length / 2);
  const first = history.slice(0, half).reduce((s, d) => s + d.consumo, 0);
  const last = history.slice(half).reduce((s, d) => s + d.consumo, 0);
  const delta = first === 0 ? 0 : ((last - first) / first) * 100;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card className="flex flex-wrap items-center gap-3 p-4">
        <Calendar className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium">Período</span>
        <Select value={range} onValueChange={(v) => setRange(v as "7" | "30" | "90")}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Últimos 7 dias</SelectItem>
            <SelectItem value="30">Últimos 30 dias</SelectItem>
            <SelectItem value="90">Últimos 90 dias</SelectItem>
          </SelectContent>
        </Select>
        <span className="ml-2 text-sm font-medium">Agrupar por</span>
        <Select value={period} onValueChange={(v) => setPeriod(v as "dia" | "semana" | "mes")}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="dia">Dia</SelectItem>
            <SelectItem value="semana">Semana</SelectItem>
            <SelectItem value="mes">Mês</SelectItem>
          </SelectContent>
        </Select>
      </Card>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <SummaryCard icon={<Zap className="h-4 w-4" />} label="Consumo total" value={`${totalConsumo} kWh`} tone="primary" />
        <SummaryCard icon={<Sun className="h-4 w-4" />} label="Geração solar" value={`${totalSolar} kWh`} tone="solar" />
        <SummaryCard icon={<TrendingDown className="h-4 w-4" />} label="Economia estimada" value={`R$ ${economiaReais.toFixed(2)}`} tone="success" />
        <SummaryCard
          icon={delta >= 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
          label="Variação no período"
          value={`${delta >= 0 ? "+" : ""}${delta.toFixed(1)}%`}
          tone={delta >= 0 ? "warning" : "success"}
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-4">
          <h3 className="mb-3 text-sm font-medium">Consumo vs. Geração solar</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <AreaChart data={grouped}>
                <defs>
                  <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.55 0.17 150)" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="oklch(0.55 0.17 150)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="oklch(0.82 0.17 85)" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="oklch(0.82 0.17 85)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 140)" />
                <XAxis dataKey="label" stroke="oklch(0.50 0.03 160)" fontSize={11} />
                <YAxis stroke="oklch(0.50 0.03 160)" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.90 0.02 140)" }} />
                <Legend />
                <Area type="monotone" dataKey="consumo" stroke="oklch(0.55 0.17 150)" fill="url(#g1)" name="Consumo (kWh)" />
                <Area type="monotone" dataKey="solar" stroke="oklch(0.70 0.17 85)" fill="url(#g2)" name="Solar (kWh)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card className="p-4">
          <h3 className="mb-3 text-sm font-medium">Diferença (consumo − solar)</h3>
          <div className="h-72">
            <ResponsiveContainer>
              <BarChart data={grouped}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.90 0.02 140)" />
                <XAxis dataKey="label" stroke="oklch(0.50 0.03 160)" fontSize={11} />
                <YAxis stroke="oklch(0.50 0.03 160)" fontSize={11} />
                <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid oklch(0.90 0.02 140)" }} />
                <Bar dataKey="diff" name="Da rede (kWh)" radius={[6, 6, 0, 0]}>
                  {grouped.map((d, i) => (
                    <Cell key={i} fill={d.diff > 0 ? "oklch(0.65 0.20 30)" : "oklch(0.65 0.18 150)"} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* AI insights */}
      <Card className="p-5">
        <div className="mb-3 flex items-center gap-2">
          <Brain className="h-5 w-5 text-primary" />
          <h3 className="font-medium">Análise da IA</h3>
        </div>
        <ul className="space-y-3 text-sm">
          <li className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-[var(--warning)]" />
            <span>
              {delta >= 0
                ? `Seu consumo aumentou ${delta.toFixed(1)}% na segunda metade do período (${range} dias). Verifique aparelhos como ar-condicionado e chuveiro.`
                : `Ótimo trabalho — seu consumo reduziu ${Math.abs(delta).toFixed(1)}% na segunda metade do período.`}
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <Sun className="mt-0.5 h-4 w-4 shrink-0 text-[var(--solar-foreground)]" />
            <span>
              Você gerou <b>{totalSolar} kWh</b> de energia solar nesse período. Isso cobriu cerca de <b>{Math.min(100, Math.round((totalSolar / totalConsumo) * 100))}%</b> do seu consumo.
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-[var(--success)]" />
            <span>
              Economia estimada de <b>R$ {economiaReais.toFixed(2)}</b> ({economiaKwh} kWh evitados da rede). Mantendo este ritmo, projetamos R$ {(economiaReais * (30 / days)).toFixed(2)} no mês.
            </span>
          </li>
          <li className="flex items-start gap-3 rounded-lg bg-muted/40 p-3">
            <Bell className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
            <span>
              O maior pico de consumo costuma ocorrer entre <b>18h e 22h</b>. Programar a máquina de lavar para o período da tarde aproveita melhor a energia solar.
            </span>
          </li>
        </ul>
      </Card>
    </div>
  );
}

function groupBy(history: { date: string; consumo: number; solar: number }[], period: "dia" | "semana" | "mes") {
  if (period === "dia") {
    return history.map((d) => ({
      label: d.date.slice(5),
      consumo: d.consumo,
      solar: d.solar,
      diff: +(d.consumo - d.solar).toFixed(2),
    }));
  }
  const buckets = new Map<string, { consumo: number; solar: number }>();
  for (const d of history) {
    const date = new Date(d.date);
    let key: string;
    if (period === "semana") {
      const onejan = new Date(date.getFullYear(), 0, 1);
      const week = Math.ceil(((+date - +onejan) / 86400000 + onejan.getDay() + 1) / 7);
      key = `S${week}`;
    } else {
      key = date.toLocaleString("pt-BR", { month: "short" });
    }
    const cur = buckets.get(key) ?? { consumo: 0, solar: 0 };
    cur.consumo += d.consumo;
    cur.solar += d.solar;
    buckets.set(key, cur);
  }
  return Array.from(buckets, ([label, v]) => ({
    label,
    consumo: +v.consumo.toFixed(1),
    solar: +v.solar.toFixed(1),
    diff: +(v.consumo - v.solar).toFixed(1),
  }));
}
