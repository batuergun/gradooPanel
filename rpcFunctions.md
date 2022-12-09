## fullsearch

create or replace function fullsearch(input text) returns table(name text, city text, type text) as $$
  select name, city, type from schools
  where to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)) @@ to_tsquery(unaccent(input));
$$ language sql;

## eventapplicationcount
select count(*) from applications where event=eventname and submitted_at>gte and submitted_at<lt;