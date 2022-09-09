CREATE TABLE IF NOT EXISTS public.urls
(
    id serial NOT NULL,
    url character(100) NOT NULL,
    short_url character(100) NOT NULL,
    PRIMARY KEY (id)
);

ALTER TABLE public.urls
    OWNER to postgres;