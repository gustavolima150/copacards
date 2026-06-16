-- ============================================================
--   COPACARDS - Schema Supabase
--   Execute este arquivo no SQL Editor do Supabase
-- ============================================================

-- ─── EXTENSIONS ─────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── PROFILES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username        TEXT NOT NULL UNIQUE,
  bio             TEXT DEFAULT '',
  avatar_url      TEXT,
  favorite_selection TEXT DEFAULT 'Brasil',
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── STICKERS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.stickers (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  athlete_name    TEXT NOT NULL,
  selection       TEXT NOT NULL,
  position        TEXT NOT NULL,
  shirt_number    INT,
  image_url       TEXT,
  status          TEXT NOT NULL CHECK (status IN ('tenho','quero','repetida')) DEFAULT 'tenho',
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── POSTS ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.posts (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sticker_id      UUID REFERENCES public.stickers(id) ON DELETE SET NULL,
  caption         TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── LIKES ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.likes (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- ─── COMMENTS ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  post_id         UUID NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ─── FOLLOWS ─────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.follows (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  follower_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id    UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- ─── CONVERSATIONS ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.conversations (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  participant_a   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  participant_b   UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  updated_at      TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(participant_a, participant_b)
);

-- ─── MESSAGES ────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.messages (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  sender_id       UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content         TEXT NOT NULL,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
--   ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE public.profiles     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.stickers     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.likes        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages     ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "profiles_public_read"    ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_own_insert"     ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_own_update"     ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_own_delete"     ON public.profiles FOR DELETE USING (auth.uid() = id);

-- STICKERS
CREATE POLICY "stickers_public_read"   ON public.stickers FOR SELECT USING (true);
CREATE POLICY "stickers_own_insert"    ON public.stickers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "stickers_own_update"    ON public.stickers FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "stickers_own_delete"    ON public.stickers FOR DELETE USING (auth.uid() = user_id);

-- POSTS
CREATE POLICY "posts_public_read"      ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_own_insert"       ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_own_update"       ON public.posts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "posts_own_delete"       ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- LIKES
CREATE POLICY "likes_public_read"      ON public.likes FOR SELECT USING (true);
CREATE POLICY "likes_own_insert"       ON public.likes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "likes_own_delete"       ON public.likes FOR DELETE USING (auth.uid() = user_id);

-- COMMENTS
CREATE POLICY "comments_public_read"   ON public.comments FOR SELECT USING (true);
CREATE POLICY "comments_own_insert"    ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_own_delete"    ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- FOLLOWS
CREATE POLICY "follows_public_read"    ON public.follows FOR SELECT USING (true);
CREATE POLICY "follows_own_insert"     ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "follows_own_delete"     ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- CONVERSATIONS
CREATE POLICY "conversations_own_read" ON public.conversations FOR SELECT
  USING (auth.uid() = participant_a OR auth.uid() = participant_b);
CREATE POLICY "conversations_own_insert" ON public.conversations FOR INSERT
  WITH CHECK (auth.uid() = participant_a OR auth.uid() = participant_b);

-- MESSAGES
CREATE POLICY "messages_own_read"      ON public.messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
  ));
CREATE POLICY "messages_own_insert"    ON public.messages FOR INSERT
  WITH CHECK (auth.uid() = sender_id AND EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.id = conversation_id
      AND (c.participant_a = auth.uid() OR c.participant_b = auth.uid())
  ));

-- ============================================================
--   TRIGGER - auto create profile after signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, bio, favorite_selection)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    '',
    'Brasil'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
--   STORAGE BUCKETS
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
  VALUES ('avatars', 'avatars', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('stickers', 'stickers', true)
  ON CONFLICT (id) DO NOTHING;

-- Storage policies - avatars
CREATE POLICY "avatars_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');
CREATE POLICY "avatars_own_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_own_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "avatars_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Storage policies - stickers
CREATE POLICY "stickers_public_read" ON storage.objects FOR SELECT
  USING (bucket_id = 'stickers');
CREATE POLICY "stickers_own_upload" ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'stickers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "stickers_own_update" ON storage.objects FOR UPDATE
  USING (bucket_id = 'stickers' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "stickers_own_delete" ON storage.objects FOR DELETE
  USING (bucket_id = 'stickers' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ============================================================
--   INDEXES (performance)
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_stickers_user_id       ON public.stickers(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id          ON public.posts(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_created_at       ON public.posts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_likes_post_id          ON public.likes(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id       ON public.comments(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower       ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following      ON public.follows(following_id);
CREATE INDEX IF NOT EXISTS idx_messages_conv_id       ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversations_a        ON public.conversations(participant_a);
CREATE INDEX IF NOT EXISTS idx_conversations_b        ON public.conversations(participant_b);
