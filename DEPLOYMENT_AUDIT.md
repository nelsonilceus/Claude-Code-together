# NOVA Dental deployment audit

Source: NOVA Dental.zip supplied October 16, 2026. This is an exported snapshot, not verified as the current production source.

## Findings

1. **Blocker: connected main branch contains only README.md.** The repository cannot reproduce the existing site. This draft imports the supplied static export; compare it with production before merging.
2. **High: forms do not deliver submissions.** Both NOVA_CONFIG endpoints are empty and useNetlifyForms is false. Submissions are stored in browser localStorage and logged to the console, then a success message is displayed with a preview notice. No Google Sheets integration or backend exists in this export. Connect and test both forms before launch; avoid storing/logging lead data in production preview mode. Netlify form attributes alone do not provide form handling on Vercel.
3. **Medium: placeholder contact address.** index.html, privacy.html and terms.html contain hello@YOUR-DOMAIN.com. Replace with the verified business inbox before launch.
4. **Medium: production settings could not be inspected.** Vercel project inspection returned 403; no authenticated CLI was available. Domain mapping, deployment protection, production branch, build/output settings, environment configuration and logs remain unverified.
5. **Medium: malformed document structure.** index.html places title/font/style resources after the opening body tag and omits an HTML language. Browsers may repair it, but normalize the document before launch.
6. **Low: external font dependency.** Google Fonts needs external requests; system fallbacks are present, but exact typography depends on availability.

## Pricing changes

Changed $299.88/year and $24.99/month to $399/year, billed annually. Daily comparison is approximately $1.09 ($399 / 365 = $1.09315). Updated hero, value section, receipt, FAQ, early-access copy and partner economics. Proposed practice allocation: $279.30 (70%); NOVA: $119.70 (30%). Existing service descriptions are preserved.

## Validation

Static asset/link checks, inline JavaScript syntax checks, and assertions for removal of old prices and correctness of allocation. No production deployment or real form delivery test was performed.

## Vercel deployment

This is a static HTML/CSS/image site: Framework Preset Other, no build command, repository root as output. No Node runtime or serverless function is required by the exported code. Before merging, verify settings and compare this export with live production, including any newer popups or lead integrations. Test a preview at desktop/mobile sizes, then verify both forms reach the intended Google Sheet.

Removed references to assets/favicon.svg from legal pages because that asset is missing from the supplied export.
