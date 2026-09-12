# The funnel playbook lives on Drive, not here

The daily job reads **`PLAYBOOK.md` in the Google Drive folder "Zesst Now —
Funnel"** (`1p75XbXuZyngKT9cs8ThXVL7WOBc1QANA`). That copy is the only one that
matters.

A second copy in this repository looked tidy and was a trap: the two drift, and
the day a cadence or a message shape changes in one of them, the job keeps
following the other. So this file is a pointer instead.

## What it contains

What the daily session needs when it starts with no memory of the work: the
message shapes per signal and per trade, the four-touch cadence and when to
stop, the six objections with what actually answers them, the price ladder, and
the list of things never to do.

## The finding that changed it most

On 12 September 2026 `findmail.py` was run over all 23 prospects that had no
email — twice, 362 pages opened — and found **none**. A business with no
website almost never publishes an email either: Facebook sits behind a login
wall, IndiaMART storefronts carry no address, and Google Maps has no such field
at all.

So the playbook now says: do not hunt emails for `no_site` rows. Their second
channel is the day-5 call, and the email column fills from replies — ask for
the address when somebody answers. Run `findmail.py` on `no_form` and
`dead_site` rows, which have their own sites and therefore something to find.

## Changing it

Edit the Drive copy. Nothing here needs updating — and if you find yourself
wanting to paste the rules back into this file, that is the drift this note
exists to prevent.
