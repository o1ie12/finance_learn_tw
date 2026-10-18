-- Class 人生賽局 rounds (02-LIFE-GAME §8). A teacher's room is now either the
-- existing pre/post quiz ('quiz', the default, so every existing room and
-- every existing insert stays a quiz) or a life-game round ('life'). A life
-- room carries the shared seed every team plays, and each participant joins
-- a team.
--
-- class_rooms.line_slug stays NOT NULL with its foreign key (migration-06 /
-- migration-16) untouched. A life room is not a line, so the app writes the
-- capstone line, 'caiwujuece' (財務決策線, the line whose finale reads the
-- life-game state), as its line_slug. Readers must branch on kind, never on
-- line_slug, to tell a life room from a quiz.
--
-- Additive. Each new column is nullable or has a constant default, which
-- Postgres 11+ records in the catalog without rewriting the table. Safe to
-- apply before deploying the code that uses it. Idempotent.

begin;

alter table public.class_rooms
  add column if not exists kind text not null default 'quiz'
    constraint class_rooms_kind_check check (kind in ('quiz', 'life'));
alter table public.class_rooms
  add column if not exists seed bigint null;
alter table public.class_participants
  add column if not exists team text null;

commit;
