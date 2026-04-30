-- LS Odontología - Core Database Schema & Seeds
-- Updated to support Admin management and Role-based Messaging

-- 1. Create Profiles Table
create table if not exists public.profiles (
    id uuid default gen_random_uuid() primary key,
    username text unique not null,
    role text check (role in ('secretary', 'consultorio', 'admin')),
    display_name text,
    avatar_url text,
    pin text not null,
    notification_tone text default 'media',
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles
    for select using (true);

create policy "Users can update own profile" on profiles
    for update using (
        username = current_setting('request.jwt.claims', true)::json->>'username'
        -- Note: For PIN-based auth, we will often use service_role or handle auth via Edge Functions
        -- For this local-first app, we will use a simpler policy for the Admin
    );

create policy "Admins can manage all profiles" on profiles
    for all using (
        exists (
            select 1 from profiles 
            where username = current_setting('request.jwt.claims', true)::json->>'username' 
            and role = 'admin'
        )
    );

-- 2. Create Messages Table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id text not null, -- using username for simplicity in PIN-based auth
    recipient_id text, -- NULL for broadcast
    sender_name text,
    content text not null,
    is_broadcast boolean default false,
    read_at timestamp with time zone,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for messages
alter table public.messages enable row level security;

-- Messages Policies
create policy "Visible messages" on messages
    for select using (true); -- In a clinic, all clinic members can usually see the flow

create policy "Allow insertion" on messages
    for insert with check (true);

-- 3. Initial Seed Data
-- Default PINs: 1234 for everyone for initial testing
insert into public.profiles (username, role, display_name, pin)
values 
    ('secretary', 'secretary', 'Secretaría LYNX', '1234'),
    ('consultorio_1', 'consultorio', 'Consultorio 1', '1234'),
    ('consultorio_2', 'consultorio', 'Consultorio 2', '1234'),
    ('consultorio_3', 'consultorio', 'Consultorio 3', '1234'),
    ('admin', 'admin', 'Administrador Sistema', '1234')
on conflict (username) do nothing;
