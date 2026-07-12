# Native handoff analytics contract

When `HANDOFF_SIGNING_SECRET` is configured, `/go` adds a signed, seven-day journey token to AppsFlyer `deep_link_sub10`. The native app must retain that value through authentication and deferred install.

After the corresponding action, POST JSON to `https://www.naudokis.lt/api/handoff-event`:

```json
{ "token": "<deep_link_sub10>", "event": "native_open", "platform": "ios" }
```

Allowed events are `native_open`, `booking_intent`, and `owner_listing_intent`; platforms are `ios` and `android`. Send each event once per token/action. Invalid, altered, or expired tokens are rejected. The token contains only a random journey ID, target type, and expiry—not a listing ID, referral code, or campaign URL.
