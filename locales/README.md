# Website languages

English remains the default at `/` and `feed-formulation-software.html`. Arabic, French, Urdu, Spanish and Portuguese use separate static HTML pages. The language menu works without JavaScript, and links between the home page and guide preserve the selected language. Arabic and Urdu use RTL layouts. The Portuguese copy uses Brazilian Portuguese wording.

## Updating content

Edit the English HTML templates and keep their numbered `data-i18n` attributes. Update the matching message index in each of the six locale JSON files, then run:

```sh
node locales/build.mjs
```

Commit the generated HTML pages and sitemap with the source changes. The generator requires only Node.js and has no third-party dependencies. Each locale has 147 messages plus menu, form and explanatory labels under `meta`.

Generated blocks are bounded by localization comments and are refreshed on each build. Do not hand-edit generated translated HTML; edit the dictionaries instead. The English HTML remains the source for structure, links, scripts and styling.

## Scope

The site's navigation, main page, pricing, activation instructions, subscription messages, guide, image descriptions and page metadata are translated. External blog articles, software screenshots, embedded videos, payment pages and third-party confirmation emails remain controlled by their providers. Urdu uses English as the subscription provider's locale fallback, while the on-page form labels and common error messages are translated.
