SET client_encoding = 'UTF8';
SET standard_conforming_strings = 'on';
SELECT pg_catalog.set_config('search_path', '', false);

CREATE SCHEMA IF NOT EXISTS public;
COMMENT ON SCHEMA public IS 'standard public schema';

CREATE TYPE public.question_type AS ENUM ('SingleChoice', 'MultipleChoice');

CREATE SEQUENCE public.refresh_tokens_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

CREATE TABLE public."user" (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               email character varying(255),
                               name character varying(100) NOT NULL,
                               created_at timestamp without time zone DEFAULT now(),
                               profile_picture text,
                               oauth_provider character varying(50),
                               oauth_id character varying(255),
                               password_hash text
);

CREATE TABLE public.refresh_tokens (
                                       id bigint NOT NULL,
                                       token character varying(255) NOT NULL,
                                       user_id uuid NOT NULL,
                                       issued_at timestamp with time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
                                       expires_at timestamp with time zone NOT NULL,
                                       revoked boolean DEFAULT false NOT NULL
);

CREATE TABLE public.survey (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               title character varying(255) NOT NULL,
                               description text,
                               created_by uuid NOT NULL,
                               start_date timestamp with time zone NOT NULL,
                               end_date timestamp with time zone NOT NULL
);

CREATE TABLE public.question (
                                 id uuid DEFAULT gen_random_uuid() NOT NULL,
                                 survey_id uuid NOT NULL,
                                 question_text text NOT NULL,
                                 type character varying(255) NOT NULL,
                                 correct_text_answer character varying(255)
);

CREATE TABLE public.option (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               question_id uuid NOT NULL,
                               option_text text NOT NULL,
                               is_correct boolean DEFAULT false NOT NULL
);

CREATE TABLE public.matching_pair (
                                      id uuid DEFAULT gen_random_uuid() NOT NULL,
                                      question_id uuid NOT NULL,
                                      left_side text NOT NULL,
                                      right_side text NOT NULL
);

CREATE TABLE public.survey_attempt (
                                       id uuid DEFAULT gen_random_uuid() NOT NULL,
                                       survey_id uuid NOT NULL,
                                       user_id uuid,
                                       started_at timestamp with time zone,
                                       completed_at timestamp with time zone,
                                       score double precision
);

CREATE TABLE public.answer (
                               id uuid DEFAULT gen_random_uuid() NOT NULL,
                               attempt_id uuid NOT NULL,
                               question_id uuid NOT NULL,
                               is_correct boolean
);

CREATE TABLE public.answer_option (
                                      id uuid DEFAULT gen_random_uuid() NOT NULL,
                                      answer_id uuid NOT NULL,
                                      option_id uuid NOT NULL
);

CREATE TABLE public.answer_matching (
                                        id uuid DEFAULT gen_random_uuid() NOT NULL,
                                        answer_id uuid NOT NULL,
                                        pair_id uuid NOT NULL,
                                        selected_right_side text
);

CREATE TABLE public.answer_text (
                                    id uuid DEFAULT gen_random_uuid() NOT NULL,
                                    answer_id uuid NOT NULL,
                                    text_value text
);

ALTER SEQUENCE public.refresh_tokens_id_seq OWNED BY public.refresh_tokens.id;
ALTER TABLE ONLY public.refresh_tokens ALTER COLUMN id SET DEFAULT nextval('public.refresh_tokens_id_seq'::regclass);

ALTER TABLE ONLY public."user" ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);
ALTER TABLE ONLY public."user" ADD CONSTRAINT "User_email_key" UNIQUE (email);

ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_token_key UNIQUE (token);

ALTER TABLE ONLY public.survey ADD CONSTRAINT survey_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.survey ADD CONSTRAINT survey_created_by_fkey FOREIGN KEY (created_by) REFERENCES public."user"(id);

ALTER TABLE ONLY public.question ADD CONSTRAINT question_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.question ADD CONSTRAINT question_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.survey(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.option ADD CONSTRAINT option_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.option ADD CONSTRAINT option_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.matching_pair ADD CONSTRAINT matching_pair_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.matching_pair ADD CONSTRAINT matching_pair_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.survey_attempt ADD CONSTRAINT survey_attempt_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.survey_attempt ADD CONSTRAINT survey_attempt_survey_id_fkey FOREIGN KEY (survey_id) REFERENCES public.survey(id);
ALTER TABLE ONLY public.survey_attempt ADD CONSTRAINT survey_attempt_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id);

ALTER TABLE ONLY public.answer ADD CONSTRAINT answer_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.answer ADD CONSTRAINT answer_attempt_id_fkey FOREIGN KEY (attempt_id) REFERENCES public.survey_attempt(id);
ALTER TABLE ONLY public.answer ADD CONSTRAINT answer_question_id_fkey FOREIGN KEY (question_id) REFERENCES public.question(id);

ALTER TABLE ONLY public.answer_option ADD CONSTRAINT answer_option_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.answer_option ADD CONSTRAINT answer_option_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answer(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.answer_option ADD CONSTRAINT answer_option_option_id_fkey FOREIGN KEY (option_id) REFERENCES public.option(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer_matching ADD CONSTRAINT answer_matching_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.answer_matching ADD CONSTRAINT answer_matching_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answer(id) ON DELETE CASCADE;
ALTER TABLE ONLY public.answer_matching ADD CONSTRAINT answer_matching_pair_id_fkey FOREIGN KEY (pair_id) REFERENCES public.matching_pair(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.answer_text ADD CONSTRAINT answer_text_pkey PRIMARY KEY (id);
ALTER TABLE ONLY public.answer_text ADD CONSTRAINT answer_text_answer_id_fkey FOREIGN KEY (answer_id) REFERENCES public.answer(id) ON DELETE CASCADE;

ALTER TABLE ONLY public.refresh_tokens ADD CONSTRAINT refresh_tokens_user_id_fkey FOREIGN KEY (user_id) REFERENCES public."user"(id) ON DELETE CASCADE;

SELECT pg_catalog.setval('public.refresh_tokens_id_seq', 251, true);