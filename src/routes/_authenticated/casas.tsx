import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sun, Plus, Home, Upload, Trash2, Plug, DoorOpen, LogOut, ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export const Route = createFileRoute("/_authenticated/casas")({
  head: () => ({ meta: [{ title: "Minhas casas — SolarMind" }] }),
  component: HousesPage,
});

type House = { id: string; name: string; floor_plan_url: string | null };
type Room = { id: string; house_id: string; name: string };
type Outlet = { id: string; room_id: string; name: string };

function HousesPage() {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [houses, setHouses] = useState<House[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [outlets, setOutlets] = useState<Outlet[]>([]);
  const [planUrl, setPlanUrl] = useState<string | null>(null);
  const [newHouseName, setNewHouseName] = useState("");
  const [newRoomName, setNewRoomName] = useState("");

  const selected = houses.find((h) => h.id === selectedId) ?? null;

  async function loadHouses() {
    const { data, error } = await supabase.from("houses").select("*").order("created_at", { ascending: true });
    if (error) return toast.error(error.message);
    setHouses(data ?? []);
    if (!selectedId && data && data.length > 0) setSelectedId(data[0].id);
  }

  async function loadHouseDetail(houseId: string) {
    const [{ data: rs }, h] = await Promise.all([
      supabase.from("rooms").select("*").eq("house_id", houseId).order("created_at"),
      supabase.from("houses").select("*").eq("id", houseId).single(),
    ]);
    setRooms(rs ?? []);
    if (rs && rs.length) {
      const { data: os } = await supabase.from("outlets").select("*").in("room_id", rs.map((r) => r.id));
      setOutlets(os ?? []);
    } else {
      setOutlets([]);
    }
    if (h.data?.floor_plan_url) {
      const { data: signed } = await supabase.storage.from("floor-plans").createSignedUrl(h.data.floor_plan_url, 3600);
      setPlanUrl(signed?.signedUrl ?? null);
    } else {
      setPlanUrl(null);
    }
  }

  useEffect(() => {
    loadHouses();
  }, []);

  useEffect(() => {
    if (selectedId) loadHouseDetail(selectedId);
  }, [selectedId]);

  async function createHouse(e: FormEvent) {
    e.preventDefault();
    if (!newHouseName.trim() || !user) return;
    const { data, error } = await supabase.from("houses").insert({ name: newHouseName, user_id: user.id }).select().single();
    if (error) return toast.error(error.message);
    setNewHouseName("");
    await loadHouses();
    setSelectedId(data.id);
    toast.success("Casa criada");
  }

  async function deleteHouse(id: string) {
    if (!confirm("Excluir esta casa e todos os seus dados?")) return;
    const { error } = await supabase.from("houses").delete().eq("id", id);
    if (error) return toast.error(error.message);
    setSelectedId(null);
    await loadHouses();
    toast.success("Casa excluída");
  }

  async function uploadPlan(file: File) {
    if (!selected || !user) return;
    const ext = file.name.split(".").pop();
    const path = `${user.id}/${selected.id}.${ext}`;
    const { error } = await supabase.storage.from("floor-plans").upload(path, file, { upsert: true });
    if (error) return toast.error(error.message);
    const { error: e2 } = await supabase.from("houses").update({ floor_plan_url: path }).eq("id", selected.id);
    if (e2) return toast.error(e2.message);
    await loadHouses();
    await loadHouseDetail(selected.id);
    toast.success("Planta enviada");
  }

  async function addRoom(e: FormEvent) {
    e.preventDefault();
    if (!newRoomName.trim() || !selected) return;
    const { error } = await supabase.from("rooms").insert({ name: newRoomName, house_id: selected.id });
    if (error) return toast.error(error.message);
    setNewRoomName("");
    loadHouseDetail(selected.id);
  }

  async function deleteRoom(id: string) {
    const { error } = await supabase.from("rooms").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selected) loadHouseDetail(selected.id);
  }

  async function addOutlet(roomId: string, name: string) {
    if (!name.trim()) return;
    const { error } = await supabase.from("outlets").insert({ room_id: roomId, name });
    if (error) return toast.error(error.message);
    if (selected) loadHouseDetail(selected.id);
  }

  async function deleteOutlet(id: string) {
    const { error } = await supabase.from("outlets").delete().eq("id", id);
    if (error) return toast.error(error.message);
    if (selected) loadHouseDetail(selected.id);
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <Sun className="h-5 w-5" />
              </div>
              <span className="font-semibold tracking-tight">SolarMind</span>
            </Link>
            <span className="text-muted-foreground">/</span>
            <span className="font-medium">Minhas casas</span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm">
              <Link to="/dashboard"><ArrowLeft className="mr-1 h-4 w-4" />Painel</Link>
            </Button>
            <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate({ to: "/auth" }); }}>
              <LogOut className="mr-1 h-4 w-4" />Sair
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-6 py-8 md:grid-cols-[280px_1fr]">
        {/* House list */}
        <aside className="space-y-3">
          <form onSubmit={createHouse} className="space-y-2">
            <Label>Nova casa</Label>
            <div className="flex gap-2">
              <Input placeholder="Ex.: Casa principal" value={newHouseName} onChange={(e) => setNewHouseName(e.target.value)} />
              <Button type="submit" size="icon"><Plus className="h-4 w-4" /></Button>
            </div>
          </form>
          <div className="space-y-1">
            {houses.length === 0 && <p className="text-sm text-muted-foreground">Você ainda não tem casas.</p>}
            {houses.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelectedId(h.id)}
                className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition ${
                  selectedId === h.id ? "border-primary bg-accent" : "hover:bg-accent"
                }`}
              >
                <span className="flex items-center gap-2"><Home className="h-4 w-4" />{h.name}</span>
              </button>
            ))}
          </div>
        </aside>

        {/* Detail */}
        <section className="space-y-6">
          {!selected ? (
            <Card className="p-10 text-center text-muted-foreground">
              Selecione ou crie uma casa para começar.
            </Card>
          ) : (
            <>
              <Card className="p-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">{selected.name}</h2>
                  <Button variant="ghost" size="sm" onClick={() => deleteHouse(selected.id)}>
                    <Trash2 className="mr-1 h-4 w-4" />Excluir casa
                  </Button>
                </div>
                <div className="mt-4">
                  <Label className="mb-2 block">Planta baixa</Label>
                  {planUrl ? (
                    <div className="overflow-hidden rounded-lg border">
                      <img src={planUrl} alt="Planta baixa" className="max-h-96 w-full object-contain bg-muted" />
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Nenhuma planta enviada ainda.</p>
                  )}
                  <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-md border border-input bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
                    <Upload className="h-4 w-4" />
                    {planUrl ? "Trocar planta" : "Enviar planta"}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => e.target.files?.[0] && uploadPlan(e.target.files[0])}
                    />
                  </label>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-semibold flex items-center gap-2"><DoorOpen className="h-5 w-5" />Cômodos</h3>
                <form onSubmit={addRoom} className="mt-3 flex gap-2">
                  <Input placeholder="Nome do cômodo (ex.: Cozinha)" value={newRoomName} onChange={(e) => setNewRoomName(e.target.value)} />
                  <Button type="submit"><Plus className="mr-1 h-4 w-4" />Adicionar</Button>
                </form>
                <div className="mt-4 space-y-4">
                  {rooms.length === 0 && <p className="text-sm text-muted-foreground">Nenhum cômodo cadastrado.</p>}
                  {rooms.map((r) => (
                    <RoomItem
                      key={r.id}
                      room={r}
                      outlets={outlets.filter((o) => o.room_id === r.id)}
                      onDeleteRoom={() => deleteRoom(r.id)}
                      onAddOutlet={(name) => addOutlet(r.id, name)}
                      onDeleteOutlet={deleteOutlet}
                    />
                  ))}
                </div>
              </Card>
            </>
          )}
        </section>
      </main>
    </div>
  );
}

function RoomItem({
  room,
  outlets,
  onDeleteRoom,
  onAddOutlet,
  onDeleteOutlet,
}: {
  room: Room;
  outlets: Outlet[];
  onDeleteRoom: () => void;
  onAddOutlet: (name: string) => void;
  onDeleteOutlet: (id: string) => void;
}) {
  const [name, setName] = useState("");
  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="font-medium">{room.name}</h4>
          <Badge variant="secondary">{outlets.length} tomadas</Badge>
        </div>
        <Button size="sm" variant="ghost" onClick={onDeleteRoom}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onAddOutlet(name);
          setName("");
        }}
        className="mt-3 flex gap-2"
      >
        <Input placeholder="Nome da tomada (ex.: Geladeira)" value={name} onChange={(e) => setName(e.target.value)} />
        <Button type="submit" size="sm"><Plug className="mr-1 h-4 w-4" />Adicionar</Button>
      </form>
      {outlets.length > 0 && (
        <ul className="mt-3 space-y-1">
          {outlets.map((o) => (
            <li key={o.id} className="flex items-center justify-between rounded bg-muted/50 px-3 py-2 text-sm">
              <span className="flex items-center gap-2"><Plug className="h-3.5 w-3.5 text-primary" />{o.name}</span>
              <button onClick={() => onDeleteOutlet(o.id)} className="text-muted-foreground hover:text-destructive">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
