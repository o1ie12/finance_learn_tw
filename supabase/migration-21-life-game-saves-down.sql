-- Down for migration-21. Deploy code that does not read life_game_saves
-- first: a query naming a missing table fails. Every save is lost.
begin;
drop table if exists public.life_game_saves;
commit;
