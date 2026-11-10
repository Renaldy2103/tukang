-- Skema Tabel Workers untuk Supabase
CREATE TABLE IF NOT EXISTS public.workers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('AC', 'Ledeng', 'Listrik', 'Bangunan')),
    rating NUMERIC(2, 1) NOT NULL DEFAULT 5.0,
    phone TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Index koordinat untuk efisiensi query
CREATE INDEX IF NOT EXISTS idx_workers_lat_lng ON public.workers (latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_workers_category ON public.workers (category);

-- Row Level Security (RLS) - Izinkan Read Publik untuk Anon Key
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public workers are viewable by everyone" 
ON public.workers FOR SELECT 
TO anon, authenticated 
USING (true);

-- Function RPC Haversine Distance
-- Menghitung jarak garis lurus bumi (radius ~6371 km), filter kategori & radius
CREATE OR REPLACE FUNCTION public.get_nearby_workers(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    filter_category TEXT DEFAULT NULL,
    radius_km DOUBLE PRECISION DEFAULT 10.0
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    category TEXT,
    rating NUMERIC,
    phone TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_km DOUBLE PRECISION
)
LANGUAGE sql
STABLE
AS $$
    SELECT
        w.id,
        w.name,
        w.category,
        w.rating,
        w.phone,
        w.latitude,
        w.longitude,
        ROUND(
            (
                6371 * acos(
                    least(1.0, greatest(-1.0,
                        cos(radians(user_lat)) * cos(radians(w.latitude)) *
                        cos(radians(w.longitude) - radians(user_lng)) +
                        sin(radians(user_lat)) * sin(radians(w.latitude))
                    ))
                )
            )::numeric, 1
        )::double precision AS distance_km
    FROM public.workers w
    WHERE
        (filter_category IS NULL OR filter_category = '' OR filter_category = 'Semua' OR w.category = filter_category)
        AND (
            6371 * acos(
                least(1.0, greatest(-1.0,
                    cos(radians(user_lat)) * cos(radians(w.latitude)) *
                    cos(radians(w.longitude) - radians(user_lng)) +
                    sin(radians(user_lat)) * sin(radians(w.latitude))
                ))
            )
        ) <= radius_km
    ORDER BY distance_km ASC;
$$;

-- Data Dummy Contoh (Area Jabodetabek / Sekitar Monas & Sudirman)
INSERT INTO public.workers (name, category, rating, phone, latitude, longitude) VALUES
('Budi Santoso (Spesialis Cuci & Pasang AC)', 'AC', 4.9, '6281234567801', -6.2000, 106.8160),
('Asep Saepudin (Pipa Bocor & Ledeng)', 'Ledeng', 4.7, '6281234567802', -6.2100, 106.8250),
('Joko Tarub (Instalasi Listrik Rumah)', 'Listrik', 4.8, '6281234567803', -6.2250, 106.8300),
('Slamet Perkasa (Tukang Bangunan & Renovasi)', 'Bangunan', 4.6, '6281234567804', -6.2400, 106.8500),
('Dedi Kusnandar (Service AC & Kulkas)', 'AC', 4.8, '6281234567805', -6.2050, 106.8400),
('Hendra Listrik (Korsleting & Panel Listrik)', 'Listrik', 5.0, '6281234567806', -6.1950, 106.8200),
('Maman Saluran (Kuras Toren & Ledeng)', 'Ledeng', 4.5, '6281234567807', -6.2150, 106.8100),
('Agus Semen (Pengecatan & Pasang Keramik)', 'Bangunan', 4.7, '6281234567808', -6.2300, 106.8450)
ON CONFLICT DO NOTHING;
