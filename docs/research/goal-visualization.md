# Goal photos and adaptive setup — research reviewed 2026-10-05

Primary sources support product patterns and technical choices. None establish a scientifically accurate photograph of a user's future physique or a public bestseller ranking.

| Source | Adopted behavior | Boundary |
|---|---|---|
| [Brilliant FAQ](https://brilliant.org/faq/) | Guided starting point, short actionable learning sessions, a clear next activity | No access to private engagement metrics; do not claim copied conversion or retention performance |
| [Duolingo habit discussion](https://blog.duolingo.com/putting-in-work-the-habit-of-language-learning/) and [streak design](https://blog.duolingo.com/improving-the-streak/) | Clear follow-through feedback and return paths | No penalties or health-outcome rewards; engagement improvements are not measured in this pilot |
| [Hevy progress photos](https://www.hevyapp.com/features/progress-photos/) | Dated personal progress photos and comparison | Actual photos remain separate from generated goal illustrations |
| [Fitbod progress-photo guidance](https://fitbod.me/blog/how-to-take-progress-photos/) | Encourage consistent framing for later comparison | Appearance is not a precise body-fat measurement |
| [CDC BMI FAQ](https://www.cdc.gov/bmi/faq/index.html) | Use confirmed measurements only; screening context has limits | BMI is not a visual body-composition model or diagnosis |
| [NIDDK Body Weight Planner](https://www.niddk.nih.gov/health-information/weight-management/body-weight-planner) | Treat weight-related estimates as conditional on inputs and behavior | No weight-to-exact-physique mapping or guaranteed arrival date |
| [Sharp constructor](https://sharp.pixelplumbing.com/api-constructor/) and [output options](https://sharp.pixelplumbing.com/api-output/) | Bounded JPEG/PNG/WebP decoding, orientation and metadata-free display copies | Originals remain private and unchanged; exported originals can retain camera metadata |
| [Comfy FLUX.2 Klein guide](https://blog.comfy.org/p/flux2-klein-4b-fast-local-image-editing) and [official edit template](https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_flux2_klein_image_edit_4b_base.json) | Candidate local image-edit workflow using a real reference image | Candidate only. No installed provider or real edited output verified; generation is disabled |

Sharp 0.35.5 is already present in the project's dependency tree and is now pinned as a direct dependency. Its package reports Apache-2.0. The Windows package and runtime dependencies are explicitly allowlisted in the desktop builder, with their supplied license files. The image decoder is not an AI model.

Photo generation requires separately approved model/runtime installation, verification of the exact model license, local-only request tracing, cancellation/deletion controls, permanent generated-image labeling, and manual likeness/anatomy review. None of these should be reported as finished based on the current unavailable-provider stub.

Current scope: adaptive first-week planning; actual private photo intake/comparison; separate encrypted photo archives. Restrictive meal timing is recorded, but example bowls are not a complete individualized OMAD day. Deadline capacity estimation and generated-physique rendering remain incomplete.
