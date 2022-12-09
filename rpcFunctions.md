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