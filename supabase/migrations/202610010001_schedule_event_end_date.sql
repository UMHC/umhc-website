alter table public.schedule
  add column if not exists event_end_date date;

alter table public.schedule
  drop constraint if exists schedule_event_end_date_check;

alter table public.schedule
  add constraint schedule_event_end_date_check
  check (event_end_date is null or event_end_date >= event_date);
