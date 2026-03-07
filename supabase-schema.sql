-- ============================================================
-- Restaurate — Supabase Schema
-- Run this in: Supabase Dashboard → SQL Editor → New Query
-- ============================================================

-- Categories
create table categories (
  id          serial primary key,
  name        text not null,
  sort_order  int default 0,
  is_active   boolean default true,
  created_at  timestamptz default now()
);

-- Menu Items
create table menu_items (
  id           serial primary key,
  category_id  int references categories(id) on delete set null,
  name         text not null,
  description  text,
  price        numeric(8,2) not null,
  image_url    text,
  is_available boolean default true,
  sort_order   int default 0,
  created_at   timestamptz default now()
);

-- Orders
create table orders (
  id             serial primary key,
  order_number   text unique not null,
  type           text not null check (type in ('dine_in','pickup')),
  table_number   text,
  customer_name  text not null,
  customer_phone text,
  kitchen_notes  text,
  status         text default 'new'
                 check (status in ('new','preparing','ready','completed','cancelled')),
  total          numeric(8,2) not null,
  created_at     timestamptz default now()
);

-- Order Items
create table order_items (
  id         serial primary key,
  order_id   int references orders(id) on delete cascade,
  item_name  text not null,
  price      numeric(8,2) not null,
  quantity   int not null default 1,
  notes      text,
  subtotal   numeric(8,2) not null
);

-- Indexes
create index idx_orders_status     on orders(status);
create index idx_orders_created_at on orders(created_at desc);
create index idx_order_items_order on order_items(order_id);
create index idx_menu_category     on menu_items(category_id);
create index idx_menu_available    on menu_items(is_available);

-- ============================================================
-- Row Level Security (RLS)
-- ============================================================

alter table categories  enable row level security;
alter table menu_items  enable row level security;
alter table orders      enable row level security;
alter table order_items enable row level security;

-- Public can read active categories
create policy "public read categories"
  on categories for select to anon
  using (is_active = true);

-- Public can read available menu items
create policy "public read menu items"
  on menu_items for select to anon
  using (is_available = true);

-- Public can place orders (insert only)
create policy "public place orders"
  on orders for insert to anon
  with check (true);

-- Public can insert order items
create policy "public insert order items"
  on order_items for insert to anon
  with check (true);

-- Authenticated users (admin) can do everything
create policy "admin full access categories"
  on categories for all to authenticated using (true) with check (true);

create policy "admin full access menu items"
  on menu_items for all to authenticated using (true) with check (true);

create policy "admin full access orders"
  on orders for all to authenticated using (true) with check (true);

create policy "admin full access order items"
  on order_items for all to authenticated using (true) with check (true);

-- ============================================================
-- Enable Realtime for live order updates
-- ============================================================
alter publication supabase_realtime add table orders;

-- ============================================================
-- Sample Data (delete after testing)
-- ============================================================

insert into categories (name, sort_order) values
  ('Hauptgerichte', 1),
  ('Pizza',         2),
  ('Getränke',      3),
  ('Desserts',      4);

insert into menu_items (category_id, name, description, price, sort_order) values
  (1, 'Wiener Schnitzel',    'Klassisches Kalbsschnitzel mit Kartoffelsalat', 14.90, 1),
  (1, 'Jägerschnitzel',      'Schweineschnitzel mit Pilzrahmsauce',           13.90, 2),
  (1, 'Rindergulasch',       'Zartes Rindfleisch in Paprikasauce',            13.50, 3),
  (2, 'Pizza Margherita',    'Tomate, Mozzarella, Basilikum',                 9.90,  1),
  (2, 'Pizza Salami',        'Tomate, Mozzarella, Salami',                   10.90,  2),
  (3, 'Weißbier',            'Helles Weizenbier vom Fass, 0.5L',              4.20,  1),
  (3, 'Cola',                'Coca-Cola 0.33L',                               3.20,  2),
  (3, 'Wasser',              'Stilles Wasser 0.5L',                           2.50,  3),
  (4, 'Apfelstrudel',        'Mit Vanilleeis und Schlagsahne',                5.90,  1),
  (4, 'Schokoladenkuchen',   'Warmer Kuchen mit flüssigem Kern',              6.50,  2);
