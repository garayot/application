--
-- PostgreSQL database dump
--

\restrict L26f5Upjk7I7XrUYImv1dJrsaglpMrwrXtRpsybFoykUNEpYBj9kJovnPlxS434

-- Dumped from database version 16.10
-- Dumped by pg_dump version 16.10

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: app_status; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.app_status AS ENUM (
    'submitted',
    'qualified',
    'disqualified',
    'under_assessment',
    'finalized'
);


ALTER TYPE public.app_status OWNER TO postgres;

--
-- Name: for_background_investigation; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.for_background_investigation AS ENUM (
    'yes',
    'no'
);


ALTER TYPE public.for_background_investigation OWNER TO postgres;

--
-- Name: remarks; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.remarks AS ENUM (
    'qualified',
    'disqualified'
);


ALTER TYPE public.remarks OWNER TO postgres;

--
-- Name: role; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE public.role AS ENUM (
    'user',
    'admin'
);


ALTER TYPE public.role OWNER TO postgres;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: applicants; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.applicants (
    app_id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    age integer NOT NULL,
    sex text NOT NULL,
    civil_status text NOT NULL,
    religion text NOT NULL,
    disability text,
    ethnic_group text,
    email text NOT NULL,
    contact text NOT NULL,
    education text NOT NULL,
    training integer DEFAULT 0,
    experience integer DEFAULT 0,
    eligibility text NOT NULL,
    pds_url text,
    letter_url text
);


ALTER TABLE public.applicants OWNER TO postgres;

--
-- Name: applicants_app_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.applicants_app_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.applicants_app_id_seq OWNER TO postgres;

--
-- Name: applicants_app_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.applicants_app_id_seq OWNED BY public.applicants.app_id;


--
-- Name: application_codes; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.application_codes (
    app_code_id integer NOT NULL,
    app_id integer NOT NULL,
    position_id integer NOT NULL,
    status public.app_status DEFAULT 'submitted'::public.app_status NOT NULL,
    applicant_code text NOT NULL,
    created_at timestamp without time zone DEFAULT now()
);


ALTER TABLE public.application_codes OWNER TO postgres;

--
-- Name: application_codes_app_code_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.application_codes_app_code_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.application_codes_app_code_id_seq OWNER TO postgres;

--
-- Name: application_codes_app_code_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.application_codes_app_code_id_seq OWNED BY public.application_codes.app_code_id;


--
-- Name: asds; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.asds (
    asds_id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    age integer NOT NULL,
    sex text NOT NULL
);


ALTER TABLE public.asds OWNER TO postgres;

--
-- Name: asds_asds_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.asds_asds_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.asds_asds_id_seq OWNER TO postgres;

--
-- Name: asds_asds_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.asds_asds_id_seq OWNED BY public.asds.asds_id;


--
-- Name: car; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.car (
    car_id integer NOT NULL,
    ies_id integer NOT NULL,
    remarks text,
    for_background_investigation public.for_background_investigation NOT NULL,
    date_of_final_deliberation timestamp without time zone,
    finalized_by integer,
    background_investigation text,
    for_appointment text,
    status_of_appointment text
);


ALTER TABLE public.car OWNER TO postgres;

--
-- Name: car_car_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.car_car_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.car_car_id_seq OWNER TO postgres;

--
-- Name: car_car_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.car_car_id_seq OWNED BY public.car.car_id;


--
-- Name: ier; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ier (
    ier_id integer NOT NULL,
    app_code_id integer NOT NULL,
    position_id integer NOT NULL,
    eligibility text NOT NULL,
    remarks public.remarks NOT NULL,
    feedback text,
    standard_education integer DEFAULT 0,
    standard_training integer DEFAULT 0,
    standard_experience integer DEFAULT 0,
    applicant_education integer DEFAULT 0,
    applicant_training integer DEFAULT 0,
    applicant_experience integer DEFAULT 0,
    increment_education integer DEFAULT 0,
    increment_training integer DEFAULT 0,
    increment_experience integer DEFAULT 0
);


ALTER TABLE public.ier OWNER TO postgres;

--
-- Name: ier_ier_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ier_ier_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ier_ier_id_seq OWNER TO postgres;

--
-- Name: ier_ier_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ier_ier_id_seq OWNED BY public.ier.ier_id;


--
-- Name: ies; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.ies (
    ies_id integer NOT NULL,
    ier_id integer NOT NULL,
    school_id integer NOT NULL,
    performance numeric NOT NULL,
    class_obs numeric NOT NULL,
    actual_score numeric NOT NULL,
    education numeric DEFAULT 0 NOT NULL,
    training numeric DEFAULT 0 NOT NULL,
    experience numeric DEFAULT 0 NOT NULL,
    portfolio_bei numeric DEFAULT 0 NOT NULL
);


ALTER TABLE public.ies OWNER TO postgres;

--
-- Name: ies_ies_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.ies_ies_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.ies_ies_id_seq OWNER TO postgres;

--
-- Name: ies_ies_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.ies_ies_id_seq OWNED BY public.ies.ies_id;


--
-- Name: positions; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.positions (
    position_id integer NOT NULL,
    "position" text NOT NULL,
    salary_grade integer NOT NULL,
    monthly_salary numeric NOT NULL
);


ALTER TABLE public.positions OWNER TO postgres;

--
-- Name: positions_position_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.positions_position_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.positions_position_id_seq OWNER TO postgres;

--
-- Name: positions_position_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.positions_position_id_seq OWNED BY public.positions.position_id;


--
-- Name: schools_division_office; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.schools_division_office (
    school_id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL
);


ALTER TABLE public.schools_division_office OWNER TO postgres;

--
-- Name: schools_division_office_school_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.schools_division_office_school_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.schools_division_office_school_id_seq OWNER TO postgres;

--
-- Name: schools_division_office_school_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.schools_division_office_school_id_seq OWNED BY public.schools_division_office.school_id;


--
-- Name: secretariat; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.secretariat (
    sec_id integer NOT NULL,
    user_id integer NOT NULL,
    name text NOT NULL,
    address text NOT NULL,
    age integer NOT NULL,
    sex text NOT NULL
);


ALTER TABLE public.secretariat OWNER TO postgres;

--
-- Name: secretariat_sec_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.secretariat_sec_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.secretariat_sec_id_seq OWNER TO postgres;

--
-- Name: secretariat_sec_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.secretariat_sec_id_seq OWNED BY public.secretariat.sec_id;


--
-- Name: session; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.session (
    sid character varying NOT NULL,
    sess json NOT NULL,
    expire timestamp(6) without time zone NOT NULL
);


ALTER TABLE public.session OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres
--

CREATE TABLE public.users (
    id integer NOT NULL,
    username text NOT NULL,
    password text NOT NULL,
    role public.role DEFAULT 'user'::public.role NOT NULL
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;


--
-- Name: applicants app_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants ALTER COLUMN app_id SET DEFAULT nextval('public.applicants_app_id_seq'::regclass);


--
-- Name: application_codes app_code_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_codes ALTER COLUMN app_code_id SET DEFAULT nextval('public.application_codes_app_code_id_seq'::regclass);


--
-- Name: asds asds_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asds ALTER COLUMN asds_id SET DEFAULT nextval('public.asds_asds_id_seq'::regclass);


--
-- Name: car car_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car ALTER COLUMN car_id SET DEFAULT nextval('public.car_car_id_seq'::regclass);


--
-- Name: ier ier_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ier ALTER COLUMN ier_id SET DEFAULT nextval('public.ier_ier_id_seq'::regclass);


--
-- Name: ies ies_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ies ALTER COLUMN ies_id SET DEFAULT nextval('public.ies_ies_id_seq'::regclass);


--
-- Name: positions position_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions ALTER COLUMN position_id SET DEFAULT nextval('public.positions_position_id_seq'::regclass);


--
-- Name: schools_division_office school_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools_division_office ALTER COLUMN school_id SET DEFAULT nextval('public.schools_division_office_school_id_seq'::regclass);


--
-- Name: secretariat sec_id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretariat ALTER COLUMN sec_id SET DEFAULT nextval('public.secretariat_sec_id_seq'::regclass);


--
-- Name: users id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);


--
-- Data for Name: applicants; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.applicants (app_id, user_id, name, address, age, sex, civil_status, religion, disability, ethnic_group, email, contact, education, training, experience, eligibility, pds_url, letter_url) FROM stdin;
1	35	Peter Carmen	San Jose	26	Male	Single	Catholic			pedrozo@gmail.com	09507569539	Bachelor of Science in Education	8	12	LET		
2	36	Glorian Teset	Bislig City	18	Female	single	Catholic			asd@asd.asd	09507569539	Doctor	13	27	LET		
\.


--
-- Data for Name: application_codes; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.application_codes (app_code_id, app_id, position_id, status, applicant_code, created_at) FROM stdin;
1	1	1	finalized	APP-403826-865	2026-01-21 08:33:23.826714
2	1	1	finalized	APP-810797-333	2026-01-21 15:20:10.798112
4	1	1	finalized	APP-677621-659	2026-01-22 01:01:17.622112
3	1	1	disqualified	APP-741677-703	2026-01-22 00:29:01.678442
5	2	1	finalized	APP-545847-67	2026-01-22 01:32:25.848041
\.


--
-- Data for Name: asds; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.asds (asds_id, user_id, name, address, age, sex) FROM stdin;
1	1	Glorian	Bislig City	18	female
\.


--
-- Data for Name: car; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.car (car_id, ies_id, remarks, for_background_investigation, date_of_final_deliberation, finalized_by, background_investigation, for_appointment, status_of_appointment) FROM stdin;
11	1	Highly Recommended	no	2026-01-21 15:09:57.443	\N	goods ra	oki kaayu	nice
12	2	Highly Recommended	yes	2026-01-21 15:22:14.489	\N			
13	3	Recommended	no	2026-01-22 01:05:05.33	\N			
14	4	Highly Recommended	no	2026-01-22 01:36:50.339	\N			
\.


--
-- Data for Name: ier; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ier (ier_id, app_code_id, position_id, eligibility, remarks, feedback, standard_education, standard_training, standard_experience, applicant_education, applicant_training, applicant_experience, increment_education, increment_training, increment_experience) FROM stdin;
1	1	1	LET	qualified	krazy	6	1	1	11	5	9	5	4	8
2	2	1	LET	qualified	okay	6	1	2	11	5	11	5	4	9
3	4	1	LET	qualified		6	1	1	11	5	9	5	4	8
4	5	1	LET	qualified	good	6	1	1	11	5	9	5	4	8
5	3	1	LET	disqualified		6	0	0	2	0	0	-4	0	0
\.


--
-- Data for Name: ies; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.ies (ies_id, ier_id, school_id, performance, class_obs, actual_score, education, training, experience, portfolio_bei) FROM stdin;
1	1	1	25	20	71.00	4	4	8	10
2	2	2	25	19	72.00	7	8	5	8
3	3	1	25	20	78.00	8	8	7	10
4	4	1	25	20	78.00	8	9	6	10
\.


--
-- Data for Name: positions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.positions (position_id, "position", salary_grade, monthly_salary) FROM stdin;
1	Teacher I	11	27000
2	Teacher II	12	29165
3	Master Teacher I	18	46725
\.


--
-- Data for Name: schools_division_office; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.schools_division_office (school_id, name, address) FROM stdin;
1	Central Elementary School	Poblacion, City
2	National High School	Brgy. San Jose, City
\.


--
-- Data for Name: secretariat; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.secretariat (sec_id, user_id, name, address, age, sex) FROM stdin;
\.


--
-- Data for Name: session; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.session (sid, sess, expire) FROM stdin;
pSMFcVNeYotXg0oxk4C8-3ZZJPKn1Ug5	{"cookie":{"originalMaxAge":null,"expires":null,"httpOnly":true,"path":"/"},"passport":{"user":34}}	2026-01-28 11:47:16
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY public.users (id, username, password, role) FROM stdin;
1	admin	password	admin
2	hr	password	admin
3	asds	password	admin
34	pedro	3ac7824a0f27cca646647cd7adbdd25200c7032e8dc200d2db22c622e69ba86b0dfcc4af5a3af6e0ab94776667ced461e73cee34825d4f63b966bbb0adb6274e.94edf5d3264dc0f9df6ba59ead921e47	admin
35	pedrozo	f402029015d3771bec141746d0cf35878704561cb7cf22d7c884a4f1ffe9f59a5f540a2400faea2e5ba6b231432467fbd7658f1af3a60a89120b0b5dd16c2f5d.29dfb11a7ee14ee68cace836d670677f	user
36	Glorian	0136da5c11613c73aa6c1d732fe9b4e8767093b596efac0c57950d3b64107daf44d5c1a4e4938ca0dbb113f2238f0b9776e820789383d9389cc1b1ddff2e6455.214c8587f014d4ca182d7add9765856b	user
\.


--
-- Name: applicants_app_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.applicants_app_id_seq', 2, true);


--
-- Name: application_codes_app_code_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.application_codes_app_code_id_seq', 5, true);


--
-- Name: asds_asds_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.asds_asds_id_seq', 1, false);


--
-- Name: car_car_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.car_car_id_seq', 14, true);


--
-- Name: ier_ier_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ier_ier_id_seq', 5, true);


--
-- Name: ies_ies_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.ies_ies_id_seq', 4, true);


--
-- Name: positions_position_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.positions_position_id_seq', 33, true);


--
-- Name: schools_division_office_school_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.schools_division_office_school_id_seq', 33, true);


--
-- Name: secretariat_sec_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.secretariat_sec_id_seq', 1, false);


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('public.users_id_seq', 36, true);


--
-- Name: applicants applicants_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT applicants_pkey PRIMARY KEY (app_id);


--
-- Name: applicants applicants_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT applicants_user_id_unique UNIQUE (user_id);


--
-- Name: application_codes application_codes_applicant_code_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_codes
    ADD CONSTRAINT application_codes_applicant_code_unique UNIQUE (applicant_code);


--
-- Name: application_codes application_codes_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_codes
    ADD CONSTRAINT application_codes_pkey PRIMARY KEY (app_code_id);


--
-- Name: asds asds_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asds
    ADD CONSTRAINT asds_pkey PRIMARY KEY (asds_id);


--
-- Name: asds asds_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asds
    ADD CONSTRAINT asds_user_id_unique UNIQUE (user_id);


--
-- Name: car car_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT car_pkey PRIMARY KEY (car_id);


--
-- Name: ier ier_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ier
    ADD CONSTRAINT ier_pkey PRIMARY KEY (ier_id);


--
-- Name: ies ies_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ies
    ADD CONSTRAINT ies_pkey PRIMARY KEY (ies_id);


--
-- Name: positions positions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.positions
    ADD CONSTRAINT positions_pkey PRIMARY KEY (position_id);


--
-- Name: schools_division_office schools_division_office_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.schools_division_office
    ADD CONSTRAINT schools_division_office_pkey PRIMARY KEY (school_id);


--
-- Name: secretariat secretariat_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretariat
    ADD CONSTRAINT secretariat_pkey PRIMARY KEY (sec_id);


--
-- Name: secretariat secretariat_user_id_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretariat
    ADD CONSTRAINT secretariat_user_id_unique UNIQUE (user_id);


--
-- Name: session session_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.session
    ADD CONSTRAINT session_pkey PRIMARY KEY (sid);


--
-- Name: users users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: users users_username_unique; Type: CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_unique UNIQUE (username);


--
-- Name: IDX_session_expire; Type: INDEX; Schema: public; Owner: postgres
--

CREATE INDEX "IDX_session_expire" ON public.session USING btree (expire);


--
-- Name: applicants applicants_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.applicants
    ADD CONSTRAINT applicants_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: application_codes application_codes_app_id_applicants_app_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_codes
    ADD CONSTRAINT application_codes_app_id_applicants_app_id_fk FOREIGN KEY (app_id) REFERENCES public.applicants(app_id);


--
-- Name: application_codes application_codes_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.application_codes
    ADD CONSTRAINT application_codes_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: asds asds_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.asds
    ADD CONSTRAINT asds_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- Name: car car_finalized_by_asds_asds_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT car_finalized_by_asds_asds_id_fk FOREIGN KEY (finalized_by) REFERENCES public.asds(asds_id);


--
-- Name: car car_ies_id_ies_ies_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.car
    ADD CONSTRAINT car_ies_id_ies_ies_id_fk FOREIGN KEY (ies_id) REFERENCES public.ies(ies_id);


--
-- Name: ier ier_app_code_id_application_codes_app_code_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ier
    ADD CONSTRAINT ier_app_code_id_application_codes_app_code_id_fk FOREIGN KEY (app_code_id) REFERENCES public.application_codes(app_code_id);


--
-- Name: ier ier_position_id_positions_position_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ier
    ADD CONSTRAINT ier_position_id_positions_position_id_fk FOREIGN KEY (position_id) REFERENCES public.positions(position_id);


--
-- Name: ies ies_ier_id_ier_ier_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ies
    ADD CONSTRAINT ies_ier_id_ier_ier_id_fk FOREIGN KEY (ier_id) REFERENCES public.ier(ier_id);


--
-- Name: ies ies_school_id_schools_division_office_school_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.ies
    ADD CONSTRAINT ies_school_id_schools_division_office_school_id_fk FOREIGN KEY (school_id) REFERENCES public.schools_division_office(school_id);


--
-- Name: secretariat secretariat_user_id_users_id_fk; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY public.secretariat
    ADD CONSTRAINT secretariat_user_id_users_id_fk FOREIGN KEY (user_id) REFERENCES public.users(id);


--
-- PostgreSQL database dump complete
--

\unrestrict L26f5Upjk7I7XrUYImv1dJrsaglpMrwrXtRpsybFoykUNEpYBj9kJovnPlxS434

