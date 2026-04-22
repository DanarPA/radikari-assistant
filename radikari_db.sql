--
-- PostgreSQL database dump
--

\restrict QGip5HNPJrQej2ycedKWruy55eBY4IwLmghARkZdJOEZuQinzoRhcGbpTmY14Y8

-- Dumped from database version 18.3
-- Dumped by pg_dump version 18.3 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: action_approvals; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.action_approvals (
    id integer NOT NULL,
    requested_by character varying(100) DEFAULT 'AI_Agent'::character varying,
    division character varying(50) NOT NULL,
    action_type character varying(50) NOT NULL,
    payload jsonb NOT NULL,
    status character varying(20) DEFAULT 'pending'::character varying,
    ai_reasoning text,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    processed_at timestamp without time zone
);


ALTER TABLE public.action_approvals OWNER TO postgres;

--
-- Name: action_approvals_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.action_approvals_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.action_approvals_id_seq OWNER TO postgres;

--
-- Name: action_approvals_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.action_approvals_id_seq OWNED BY public.action_approvals.id;


--
-- Name: audit_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.audit_logs (
    id integer NOT NULL,
    user_identity character varying(100),
    action_description text NOT NULL,
    division character varying(50),
    severity character varying(20) DEFAULT 'INFO'::character varying,
    ip_address character varying(45),
    "timestamp" timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.audit_logs OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.audit_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.audit_logs_id_seq OWNER TO postgres;

--
-- Name: audit_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.audit_logs_id_seq OWNED BY public.audit_logs.id;


--
-- Name: knowledge_base; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.knowledge_base (
    id integer NOT NULL,
    division character varying(50) NOT NULL,
    file_name character varying(255) NOT NULL,
    content text NOT NULL,
    metadata jsonb,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.knowledge_base OWNER TO postgres;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.knowledge_base_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.knowledge_base_id_seq OWNER TO postgres;

--
-- Name: knowledge_base_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.knowledge_base_id_seq OWNED BY public.knowledge_base.id;


--
-- Name: system_health_logs; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.system_health_logs (
    id integer NOT NULL,
    service_name character varying(50),
    is_online boolean,
    latency_ms integer,
    last_check timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);


ALTER TABLE public.system_health_logs OWNER TO postgres;

--
-- Name: system_health_logs_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.system_health_logs_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.system_health_logs_id_seq OWNER TO postgres;

--
-- Name: system_health_logs_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.system_health_logs_id_seq OWNED BY public.system_health_logs.id;


--
-- Name: action_approvals id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_approvals ALTER COLUMN id SET DEFAULT nextval('public.action_approvals_id_seq'::regclass);


--
-- Name: audit_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs ALTER COLUMN id SET DEFAULT nextval('public.audit_logs_id_seq'::regclass);


--
-- Name: knowledge_base id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base ALTER COLUMN id SET DEFAULT nextval('public.knowledge_base_id_seq'::regclass);


--
-- Name: system_health_logs id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_health_logs ALTER COLUMN id SET DEFAULT nextval('public.system_health_logs_id_seq'::regclass);


--
-- Data for Name: action_approvals; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.action_approvals (id, requested_by, division, action_type, payload, status, ai_reasoning, created_at, processed_at) FROM stdin;
\.


--
-- Data for Name: audit_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.audit_logs (id, user_identity, action_description, division, severity, ip_address, "timestamp") FROM stdin;
\.


--
-- Data for Name: knowledge_base; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.knowledge_base (id, division, file_name, content, metadata, created_at, updated_at) FROM stdin;
\.


--
-- Data for Name: system_health_logs; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.system_health_logs (id, service_name, is_online, latency_ms, last_check) FROM stdin;
\.


--
-- Name: action_approvals_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.action_approvals_id_seq', 1, false);


--
-- Name: audit_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.audit_logs_id_seq', 1, false);


--
-- Name: knowledge_base_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.knowledge_base_id_seq', 1, false);


--
-- Name: system_health_logs_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.system_health_logs_id_seq', 1, false);


--
-- Name: action_approvals action_approvals_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.action_approvals
    ADD CONSTRAINT action_approvals_pkey PRIMARY KEY (id);


--
-- Name: audit_logs audit_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.audit_logs
    ADD CONSTRAINT audit_logs_pkey PRIMARY KEY (id);


--
-- Name: knowledge_base knowledge_base_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.knowledge_base
    ADD CONSTRAINT knowledge_base_pkey PRIMARY KEY (id);


--
-- Name: system_health_logs system_health_logs_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.system_health_logs
    ADD CONSTRAINT system_health_logs_pkey PRIMARY KEY (id);


--
-- Name: idx_kb_content; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kb_content ON public.knowledge_base USING gin (to_tsvector('indonesian'::regconfig, content));


--
-- Name: idx_kb_division; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX idx_kb_division ON public.knowledge_base USING btree (division);


--
-- PostgreSQL database dump complete
--

\unrestrict QGip5HNPJrQej2ycedKWruy55eBY4IwLmghARkZdJOEZuQinzoRhcGbpTmY14Y8

