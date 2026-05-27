
-- Houses table
CREATE TABLE public.houses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  floor_plan_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.houses TO authenticated;
GRANT ALL ON public.houses TO service_role;
ALTER TABLE public.houses ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own houses select" ON public.houses FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own houses insert" ON public.houses FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "own houses update" ON public.houses FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "own houses delete" ON public.houses FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Rooms table
CREATE TABLE public.rooms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  house_id UUID NOT NULL REFERENCES public.houses(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rooms by house owner select" ON public.rooms FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.houses h WHERE h.id = house_id AND h.user_id = auth.uid()));
CREATE POLICY "rooms by house owner insert" ON public.rooms FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.houses h WHERE h.id = house_id AND h.user_id = auth.uid()));
CREATE POLICY "rooms by house owner update" ON public.rooms FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.houses h WHERE h.id = house_id AND h.user_id = auth.uid()));
CREATE POLICY "rooms by house owner delete" ON public.rooms FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.houses h WHERE h.id = house_id AND h.user_id = auth.uid()));

-- Outlets table
CREATE TABLE public.outlets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID NOT NULL REFERENCES public.rooms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.outlets TO authenticated;
GRANT ALL ON public.outlets TO service_role;
ALTER TABLE public.outlets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "outlets by house owner select" ON public.outlets FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r JOIN public.houses h ON h.id = r.house_id WHERE r.id = room_id AND h.user_id = auth.uid()));
CREATE POLICY "outlets by house owner insert" ON public.outlets FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM public.rooms r JOIN public.houses h ON h.id = r.house_id WHERE r.id = room_id AND h.user_id = auth.uid()));
CREATE POLICY "outlets by house owner update" ON public.outlets FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r JOIN public.houses h ON h.id = r.house_id WHERE r.id = room_id AND h.user_id = auth.uid()));
CREATE POLICY "outlets by house owner delete" ON public.outlets FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM public.rooms r JOIN public.houses h ON h.id = r.house_id WHERE r.id = room_id AND h.user_id = auth.uid()));

-- Storage bucket for floor plans
INSERT INTO storage.buckets (id, name, public) VALUES ('floor-plans', 'floor-plans', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "floor-plans read" ON storage.objects FOR SELECT TO public
  USING (bucket_id = 'floor-plans');
CREATE POLICY "floor-plans owner insert" ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "floor-plans owner update" ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "floor-plans owner delete" ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'floor-plans' AND auth.uid()::text = (storage.foldername(name))[1]);
