-- LS Odontología - Supabase Foundation Script
-- Copy and paste this into the Supabase SQL Editor

-- 1. Create Profiles Table
create table if not exists public.profiles (
    id uuid references auth.users on delete cascade primary key,
    username text unique,
    role text check (role in ('secretary', 'consultorio', 'admin')),
    display_name text,
    avatar_url text,
    pin text,
    notification_tone text default 'media',
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for profiles
alter table public.profiles enable row level security;

-- Profiles Policies
create policy "Public profiles are viewable by everyone" on profiles
    for select using (true);

create policy "Users can update own profile" on profiles
    for update using (auth.uid() = id);

-- 2. Create Messages Table
create table if not exists public.messages (
    id uuid default gen_random_uuid() primary key,
    sender_id uuid references public.profiles(id),
    recipient_id uuid references public.profiles(id), -- NULL for broadcast
    content text not null,
    is_broadcast boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS for messages
alter table public.messages enable row level security;

-- Messages Policies
create policy "Users can view relevant messages" on messages
    for select using (
        is_broadcast = true or 
        sender_id = auth.uid() or 
        recipient_id = auth.uid()
    );

create policy "Users can send messages" on messages
    for insert with check (auth.uid() = sender_id);

-- 3. Create Storage Bucket for Avatars (Optional but recommended)
-- Note: You might need to create the 'avatars' bucket manually in the Supabase Dashboard
-- and set its permissions to 'public'.

-- 4. Initial Seed Data (Optional)
-- You can create your users via Auth and then update their profiles.
