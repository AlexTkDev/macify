# Contribute to Macify

You can propose a Mac app you built or recommend one that is not yet listed. Each public pull request may add **one new app, one new deal, or one new app with its matching deal**, with no other file changes. These limits apply to external submissions; the project owner maintains the site and catalogue directly. For corrections to an existing listing or changes to the site, [open an issue](https://github.com/Beingpax/macify/issues/new/choose) first.

## What we accept

- Apps that have been publicly available for at least **30 days** and offer a meaningful Mac experience.
- Useful, original apps with reliable core features, thoughtful design, and active maintenance.
- Listings backed by current official information about downloads, pricing, privacy, support, and macOS compatibility.

We do not accept unfinished or generic apps, close copies without meaningful original work, misleading claims, hidden pricing, malware, impersonation, or rights violations. The site owner decides what is published and assigns Featured and Editor's Pick status. Public submissions may omit `isFeatured` and `isEditorsPick` or set them to `false`; `true` is rejected.

## Submit an app

1. Check [`catalog/apps`](catalog/apps) to make sure the app is not already listed.
2. Fork the repository. Copy the [app example](catalog/examples/application.example.json) to `catalog/apps/<app-slug>.json` and fill it in using official sources. Include a clear description and public HTTPS links to authentic artwork; do not add image files to the repository.
3. Run `npm run catalogue:validate` and fix any errors.
4. Open a pull request containing **only that new app file**, or include its matching new deal file as described below. Explain why the app belongs in Macify and link the official sources you used.

## Submit a deal

Developers and community members can suggest verified offers, including **Black Friday 2026 Mac app deals**. You do not need to own the app.

1. Check [`catalog/apps`](catalog/apps) and [`catalog/deals`](catalog/deals) for an existing listing and deal.
2. Copy the [deal example](catalog/examples/deal.example.json) to `catalog/deals/<app-slug>.json`. Use the application's slug for both `appSlug` and the filename.
3. Include the discount percentage, promo code (or `null` when none is required), official offer URL, and a confirmed start timestamp with a timezone, and an end timestamp or `endsAt: null` for an offer with no scheduled expiry. Link an official source in the pull request and explain any plan, renewal, customer, or regional restrictions. Submit only announced offers with confirmed terms.
4. If the app is not listed, also follow the app submission instructions and add `catalog/apps/<app-slug>.json` in the **same pull request**. Both filenames must use the same slug, and the application must meet the usual eligibility requirements.
5. Run `npm run catalogue:validate`. Submit only the new deal file for an existing app, or the two matching new application and deal files for an unlisted app.

Only one deal manifest is supported per app. For an existing deal that needs a new code, discount, or dates, open a [listing correction issue](https://github.com/Beingpax/macify/issues/new?template=listing-correction.yml) with the official source.

For a combined submission, the application is reviewed and published before its deal can be published.

## Review

Initial review may take **12–48 hours**. We may request changes or decline a proposal. Submission does not guarantee publication; the site owner makes the final decision.
