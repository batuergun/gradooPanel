## fullsearch

select name, city, type from schools
where to_tsvector(unaccent(name) || ' ' || unaccent(city) || ' ' || unaccent(type)) @@ to_tsquery(input);

## eventapplicationcount
select count(*) from applications where event=eventname and submitted_at>gte and submitted_at<lt;