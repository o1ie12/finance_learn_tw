-- Down for migration-25. Deploy code that does not read kind / seed / team
-- first. Rows are kept: a life room left behind reads as a quiz room on
-- caiwujuece (its stored line_slug), and its teams' saves stay in
-- life_game_saves (removed by migration-21's down, if that is run too).
begin;
alter table public.class_participants drop column if exists team;
alter table public.class_rooms drop column if exists seed;
alter table public.class_rooms drop column if exists kind;
commit;
