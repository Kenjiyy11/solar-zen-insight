export type Appliance = { name: string; watts: number; on: boolean };
export type Room = {
  id: string;
  name: string;
  // position on floor plan (percent)
  x: number; y: number; w: number; h: number;
  appliances: Appliance[];
};
export type House = {
  id: string;
  name: string;
  address: string;
  solarKwp: number;
  rooms: Room[];
};

export const houses: House[] = [
  {
    id: "casa-1",
    name: "Casa Principal",
    address: "Rua das Palmeiras, 123 — São Paulo",
    solarKwp: 5.4,
    rooms: [
      { id: "sala", name: "Sala", x: 2, y: 2, w: 46, h: 40, appliances: [
        { name: "Ar-condicionado", watts: 1400, on: true },
        { name: "TV 55\"", watts: 120, on: true },
        { name: "Iluminação LED", watts: 45, on: true },
      ]},
      { id: "cozinha", name: "Cozinha", x: 50, y: 2, w: 48, h: 40, appliances: [
        { name: "Geladeira", watts: 180, on: true },
        { name: "Micro-ondas", watts: 0, on: false },
        { name: "Iluminação", watts: 30, on: true },
      ]},
      { id: "quarto1", name: "Quarto 1", x: 2, y: 44, w: 30, h: 54, appliances: [
        { name: "Ar-condicionado", watts: 0, on: false },
        { name: "Carregador", watts: 18, on: true },
        { name: "Iluminação", watts: 20, on: true },
      ]},
      { id: "quarto2", name: "Quarto 2", x: 34, y: 44, w: 30, h: 30, appliances: [
        { name: "Ventilador", watts: 60, on: true },
        { name: "Iluminação", watts: 15, on: true },
      ]},
      { id: "banheiro", name: "Banheiro", x: 34, y: 76, w: 30, h: 22, appliances: [
        { name: "Chuveiro elétrico", watts: 0, on: false },
        { name: "Iluminação", watts: 12, on: true },
      ]},
      { id: "lavanderia", name: "Lavanderia", x: 66, y: 44, w: 32, h: 54, appliances: [
        { name: "Máquina de lavar", watts: 500, on: true },
        { name: "Iluminação", watts: 15, on: true },
      ]},
    ],
  },
  {
    id: "casa-2",
    name: "Casa de Campo",
    address: "Estrada do Sol, km 7 — Campos do Jordão",
    solarKwp: 8.2,
    rooms: [
      { id: "sala", name: "Sala", x: 2, y: 2, w: 60, h: 50, appliances: [
        { name: "Lareira elétrica", watts: 1800, on: true },
        { name: "TV", watts: 90, on: true },
      ]},
      { id: "cozinha", name: "Cozinha", x: 64, y: 2, w: 34, h: 50, appliances: [
        { name: "Geladeira", watts: 200, on: true },
        { name: "Forno", watts: 0, on: false },
      ]},
      { id: "quarto", name: "Suíte", x: 2, y: 54, w: 60, h: 44, appliances: [
        { name: "Aquecedor", watts: 1200, on: true },
        { name: "Iluminação", watts: 30, on: true },
      ]},
      { id: "varanda", name: "Varanda", x: 64, y: 54, w: 34, h: 44, appliances: [
        { name: "Iluminação externa", watts: 80, on: true },
      ]},
    ],
  },
];

export function roomWatts(room: Room) {
  return room.appliances.reduce((s, a) => s + (a.on ? a.watts : 0), 0);
}
export function houseWatts(house: House) {
  return house.rooms.reduce((s, r) => s + roomWatts(r), 0);
}

// Deterministic-ish pseudo-random for historical data
function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateHistory(houseId: string, days: number) {
  const rnd = seeded(houseId.length * 17 + days);
  const out: { date: string; consumo: number; solar: number }[] = [];
  const today = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const base = 18 + rnd() * 14;
    const solar = 10 + rnd() * 18;
    out.push({
      date: d.toISOString().slice(0, 10),
      consumo: +base.toFixed(2),
      solar: +solar.toFixed(2),
    });
  }
  return out;
}

export function generateHourly(houseId: string) {
  const rnd = seeded(houseId.length * 31);
  return Array.from({ length: 24 }, (_, h) => {
    const solar = h >= 6 && h <= 18 ? Math.max(0, Math.sin(((h - 6) / 12) * Math.PI) * (2 + rnd())) : 0;
    const consumo = 0.5 + rnd() * 0.8 + (h >= 18 && h <= 22 ? 1.5 : 0);
    return { hora: `${String(h).padStart(2, "0")}h`, solar: +solar.toFixed(2), consumo: +consumo.toFixed(2) };
  });
}
