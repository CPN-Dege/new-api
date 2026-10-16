# Halsamer API — accepted build checkpoint

Status: **PASS / CLOSED** by Founder. This is a publication of the accepted build, not a new deployment.

## Identity

- Runtime: `v1.0.0-rc.40-halsamer-hidedocs1`
- Built source: `72164e07a243465677983149f11544b679b5b39c`
- Source branch: `stewarden/frontier-storefront-20261015`
- Binary SHA-256: `688cf3167c796025dd4ba208fc794618587a591ce3d67fbfac095a945f633c8f`
- Released: 16 October 2026, 21:00:37 WIB; Founder closure: 21:27:59 WIB.
- Public service: https://api.halsamer.io/ ; Model Square: https://api.halsamer.io/pricing
- This documentation branch adds records only. Its later Git commit is **not** the binary's source commit.

## Accepted build, cumulatively

- Original built-in Halsamer layout retained; `HomePageContent` remains empty.
- Hero: **One API for** with exact phrases **Frontier Model → Image Generation → Everythings**; tagline **Frontier Models. All live**.
- Fast per-character backspace, pause, then typing. Light-saber blue to deep-blue gradient with breathing LED glow; visibility/reduced-motion handling retained.
- Hero **Docs** CTA hidden at mobile and desktop sizes. The documentation route itself is not deleted.
- Nine published models: four chat and five image models, Google/OpenAI icons, native Model Square search/filter and endpoint search.
- Image price: **USD 0.20 × image_count**. Public API usage guide and examples remain available.
- Chat/Responses/Images/Claude/Gemini example tabs remain scrollable on mobile.
- Existing auth/SMTP baseline, case-insensitive email login, image conversion/Responses alias fixes are inherited in the source history, not new changes in this release.
- Stale-chunk recovery is included. Student/free-credit candidate work remains **paused and separate**, not part of this accepted build.

## Evidence and boundaries

Final release `release-02` completed with worker exit 0, `LIVE_UI_RELEASE_VERIFIED`, no rollback. Exact running executable and origin/public version were checked. Public desktop 1920×947 and mobile 390×844 showed Docs `display:none`, zero rectangles; screenshots showed no obvious hero overlap. Catalog/pricing were unchanged across cutover.

The earlier blue-LED frontend suite records **2,128 tests in 177 files, PASS_AGGREGATED**, with zero failures/skips. An interrupted outer run was preserved and only unfinished files were subsequently run. That is prior blue-LED evidence, **not** a new test run for the Docs change. Final Docs tests remain `NOT_RERUN_FOUNDER_REQUEST`. This publication runs no application build/test suite and claims no new CI result. Review is main-agent only, not independent review.

The failed initial Docs attempt was rejected before staging/restart for a group-writable build input (0775). Its original evidence is retained locally. The successful attempt shipped a byte-identical 0755 copy with the strict guard unchanged. Consumed/withdrawn launchers must not be replayed.

## Source and mapping

[`source-manifest.json`](source-manifest.json) hashes all 2,577 tracked regular files at the exact **built source commit**, excluding these later publication records by design. Verify it against a checkout of that commit, not an arbitrary newer branch tip.

Native Ripwire cold-indexed 2,479 eligible files, 24,109 symbols and 31,709 heuristic edges. The overview displays only 200 ranked symbols. There are 1,317 ambiguous and 6,047 unresolved references; seven oversized files were skipped. Cold-map/cache-restore output matched and the hero/headline returned bodies matched source. This is navigation evidence, **not** complete semantic coverage, SCIP precision, or proof tests execute. Dependencies, generated dist, Git metadata and agent-prompt directories are outside the map. Full index/cache/command outputs remain in the local publication checkpoint.

[`release.json`](release.json) records identities, full model IDs, scope, evidence hashes and limitations.

## Build lineage and private state

Use the upstream README's source/Compose workflow. The frontend is embedded in the Go binary: frontend build must precede Go build. The accepted binary used `CGO_ENABLED=0`, `-trimpath`, and linker version `-X github.com/QuantumNous/new-api/common.Version=v1.0.0-rc.40-halsamer-hidedocs1`. Its embed also retained previous immutable static chunks for existing tabs. A fresh build without those retained assets need not reproduce the historical binary hash; no byte-reproducibility claim is made here.

Runtime secrets, sessions, databases, account/channel data, raw logs, private Compose/environment values, binaries and dependencies are deliberately excluded from Git. Public catalog state is recorded, not private routing credentials. This is a **source + sanitized release checkpoint**, not a database backup or a complete private-service recovery package. Runtime preservation claims are UI-only, not a whole-account financial audit.

No tag, GitHub release, PR merge or automatic production deployment is requested by this checkpoint. Production remains on the accepted build until a new Founder instruction.
