## fullsearch

```sql
create or replace function fullsearch(input text) returns table(name text, city text, type text) as $$
  select name, city, type from schools
  where to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)) @@ to_tsquery(unaccent(input));
$$ language sql;
```

## eventapplicationcount
```sql
select count(*) from applications where event=eventname and submitted_at>gte and submitted_at<lt;
```

## Query & Render Application Count

```sql
create or replace function renderschoollist(input text) returns table(name text, city text, count bigint) as $$
  select school, city, count from 
  ( select school, city, count(*)
    from ( select distinct email, school, city from applications
    where to_tsvector(unaccent(event) || ' ' || unaccent(city) || ' ' || unaccent(school) || ' ' || unaccent(usertype)) @@ to_tsquery(unaccent(input)) ) as temp
    group by school, city ) as temp 
    order by count desc
$$ language sql
```

## Venn diagram Intersection

```sql
create or replace function eventinfo() returns table(name text, count bigint) as $$
  select distinct event, count(*) from ( select distinct email, event from applications ) as temp group by event
$$ language sql;

create or replace function intersection(input text, input2 text) returns bigint as $$
  select count(*) from (
    select distinct email from applications where to_tsvector(unaccent(event)) @@ to_tsquery(unaccent('Learn & How & to & Learn'))
    intersect
    select distinct email from applications where to_tsvector(unaccent(event)) @@ to_tsquery(unaccent('Gradoo & Derece & Atolyesi')) ) as temp
$$ language sql;
```

## FTS - new
```sql
create index if not exists search_index on schools using gin (name gin_trgm_ops)

create or replace function indexschool(input text, city_input text) returns table(sid text, name text, city text, score bigint) as $$
  select sid, name, city, (similarity(unaccent(input), unaccent(name)) + similarity(unaccent(city_input), unaccent(city))) as score from schools p
  where unaccent(name) % unaccent(input) and unaccent(city) % unaccent(city_input)
  order by score desc
  limit 1
$$ language sql

create or replace function indexuniversity(input text) returns table(sid text, name text, city text) as $$
  select sid, name, city from schools
  where to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)) @@ to_tsquery(unaccent(input))
  order by ts_rank(to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)), plainto_tsquery(unaccent(input))) desc
  limit 1
$$ language sql
```

## FTS - old
```sql
  select name, city from schools
  where to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)) @@ to_tsquery(unaccent(input))
  order by ts_rank(to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)), plainto_tsquery(unaccent(input))) desc
  limit 1
```

## renderschoollist
```sql
create or replace function renderschoollist_by_time(input text, from_input timestamp, until_input timestamp) returns table(school text, city text, count bigint) as $$
  select school, city, count 
  from (
    select school, city, count(*)
    from (
      select distinct on (email) email, school, city, submitted_at
      from applications
      where to_tsvector(unaccent(event) || ' ' || 
                        unaccent(city) || ' ' || 
                        unaccent(school) || ' ' || 
                        unaccent(usertype) || ' ' || 
                        unaccent(class)) @@ to_tsquery(unaccent(input))
      and submitted_at >= from_input
      and submitted_at <= until_input
    ) as temp
    group by school, city
  ) as temp 
  order by count desc
$$ language sql 
```

## Class info by time (classinfo_by_time)
```sql
select distinct class, count(*), usertype 
from (
  select distinct on (email) email, class, usertype 
  from users
  where created_at >= from_input
  and created_at <= until_input
  and usertype != ' '
  and class != ' '
) as temp
group by  class, usertype
```