# Qeemavoice: Hostinger cutover checklist

The existing `qeemavoice.com` site on DigitalOcean remains production until DNS is deliberately changed. `srv2067708.hstgr.cloud` is a staging copy, not a live database replica.

## Current staging setup

- App, MySQL, and Redis run in a separate Compose project on Hostinger.
- The staging URL is protected by Traefik Basic Auth. Its bcrypt credential is stored only in the server-side Compose `.env` file, not in Git or `.env.staging`.
- `public/uploads` is a bind mount copied from DigitalOcean. The two large `public/*.tar.gz` archives are historical backups, not runtime assets, and should not be served or copied into the new web root.
- Mail is logged, broadcasting is disabled, and `PAYMENTS_ENABLED` is `false` because `APP_ENV=staging`. Do not enable payments on staging.
- After each rsync of `public/uploads`, run `docker compose -f docker-compose.staging.yml exec -T -u 0 app qeemavoice-prepare-uploads 1000` to restore read/write ACLs for Apache and the `qemaops` sync user.

## Before preparing production

1. Back up the original database and uploads outside both VPSs; verify that the database backup restores and that files can be read.
2. Create a distinct production Compose project with its own database, Redis, volumes, and environment file. Never point production at the staging database.
3. Transfer the original production `APP_KEY` and integration settings securely. Do not commit `.env` files or payment/mail secrets. Set `APP_ENV=production`, `APP_DEBUG=false`, and explicitly set `PAYMENTS_ENABLED=false` in the new production environment until a payment-provider test is complete; then enable it during cutover. Existing DigitalOcean production deployments without this setting keep their prior payment behavior.
4. Configure and test the production database queue worker, scheduler, outbound mail, and Pusher/WebSocket flow. The old server currently uses database queues, SMTP, and Pusher; staging intentionally does not.
5. Prepare backups, restore procedure, monitoring, and rollback ownership before DNS cutover.

## Cutover window

1. Freeze writes on the DigitalOcean site briefly. Take a fresh, consistent database dump and one final incremental copy of `public/uploads` without deleting files on either side.
2. Restore the dump into the **production** Hostinger database, reapply upload ACLs, and check record counts, uploads, logins, orders, and integrations.
3. Test the production route on Hostinger before changing the domain. Coordinate the Cloudflare DNS change with the owner of the current zone; do not change Namecheap nameservers blindly.
4. Switch only the required web records to Hostinger. Preserve mail and other DNS records. Keep DigitalOcean available for rollback and watch errors, queue depth, uploads, and payments.
5. A simple DNS rollback does not move orders or uploads created after cutover back to DigitalOcean. Reconcile new data before reversing traffic.
