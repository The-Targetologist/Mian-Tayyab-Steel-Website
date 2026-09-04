-- Development seed data — NOT confirmed Mian Tayyab Steel blog content.
-- Same caveats as supabase/seed.sql: fresh wording, status 'draft' so
-- nothing shows publicly. Requires supabase/migrations/0006_posts.sql
-- applied first.

insert into posts (title, slug, excerpt, body, status, author_name, published_at)
values
  (
    'Choosing Between Hot Rolled and Cold Rolled Steel',
    'hot-rolled-vs-cold-rolled-steel',
    'A quick guide to the practical differences between hot rolled and cold rolled coil, and when each makes sense.',
    'Hot rolled and cold rolled steel are processed differently and suit different jobs.

Hot rolled coil is rolled at high temperature, which gives it a workable finish suited to structural and general fabrication work where tight tolerances matter less than cost and availability.

Cold rolled coil is processed further at room temperature after hot rolling, producing a smoother surface finish and tighter thickness tolerances. It suits applications where appearance and precision matter more, such as appliance panels and precision fabrication.

If you are unsure which is right for your project, share your specification with our team and we will help you choose.',
    'draft',
    null,
    now()
  ),
  (
    'What to Check Before Ordering Structural Steel',
    'checklist-before-ordering-structural-steel',
    'A short checklist to work through before placing a structural steel order.',
    'Before placing a structural steel order, it helps to confirm a few details up front.

Load requirement — is the section structural or non-structural? This changes which product is appropriate.

Finish requirement — does the application need corrosion resistance, or is a mill finish acceptable?

Dimensions and tolerances — share exact sizes and any tolerance requirements so we can confirm availability.

Delivery timeline — let us know your project timeline so we can plan supply accordingly.

Get in touch with these details and our team will confirm what we can supply.',
    'draft',
    null,
    now()
  )
on conflict (slug) do nothing;
