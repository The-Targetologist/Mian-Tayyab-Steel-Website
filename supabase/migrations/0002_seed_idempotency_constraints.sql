-- Fixes a real gap in the original 0001 migration + seed.sql: only
-- `products.slug` had a uniqueness guard, so re-running seed.sql (which
-- happened during Phase 4 verification) silently duplicated every row in
-- product_specifications, product_applications and faqs. These constraints
-- make re-running supabase/seed.sql safe going forward.

alter table product_specifications
  add constraint product_specifications_product_id_label_key unique (product_id, label);

alter table product_applications
  add constraint product_applications_product_id_title_key unique (product_id, title);

alter table faqs
  add constraint faqs_question_key unique (question);
