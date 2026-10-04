export interface Checkpoint { id: string; title: string; url: string; minutes: number; deliverable: string }
export interface Course { id: string; title: string; provider: string; url: string; level: string; prerequisite: string; cost: string; format: string; outcome: string; reviewed: string; checkpoints: Checkpoint[] }
const links = {
  antigravity: 'https://codelabs.developers.google.com/getting-started-google-antigravity',
  build: 'https://codelabs.developers.google.com/building-with-google-antigravity',
  plans: 'https://antigravity.google/docs/plans',
  web: 'https://github.com/microsoft/Web-Dev-For-Beginners',
  practice: 'https://exercism.org/tracks/javascript',
  design: 'https://web.dev/learn/design/',
  stack: 'https://www.theodinproject.com/paths/full-stack-javascript',
  automation: 'https://n8n.io/education/',
  agents: 'https://github.com/microsoft/ai-agents-for-beginners',
  genai: 'https://github.com/microsoft/generative-ai-for-beginners',
  youtube: 'https://support.google.com/youtube/answer/12340300?hl=en-GB',
};
const step = (id: string, title: string, url: string, minutes: number, deliverable: string): Checkpoint => ({ id, title, url, minutes, deliverable });
const course = (c: Omit<Course, 'reviewed'>): Course => ({ ...c, reviewed: '2026-10-04' });
export const courses: Course[] = [
  course({ id: 'antigravity', title: 'Antigravity & AI-assisted building', provider: 'Google Codelabs + Antigravity docs', url: links.antigravity, level: 'Beginner', prerequisite: 'Desktop computer, Antigravity access and a small project idea.', cost: 'Free guides. Antigravity access uses your plan. Google AI Ultra has usage limits; optional credit overages and cloud labs may cost extra.', format: 'Guided labs + documentation', outcome: 'Scope, build and review a small app; understand your Ultra usage before scaling up.', checkpoints: [
    step('scope', 'Write a build brief', links.antigravity, 25, 'Describe one user, one problem and three acceptance checks. Ask for a plan, inspect its assumptions, and save the reviewed brief before generating code.'),
    step('build', 'Build one useful slice', links.build, 45, 'Implement one screen and one real interaction in a practice project. Record what you tested, one generated-code issue you found, and how you corrected it.'),
    step('review', 'Review before scaling', links.build, 30, 'Read the changed files. Test an empty input, a failed action and a reload. Explain the data flow in your own words; save the results.'),
    step('ultra', 'Make Ultra usage deliberate', links.plans, 20, 'Inspect Settings usage and your overage preference. Record available models and observed quota before and after a bounded task. Choose suitable models and smaller reviewable batches. Do not save tokens, billing details or secrets here.'),
  ] }),
  course({ id: 'software', title: 'Software & web foundations', provider: 'Microsoft + Exercism', url: links.web, level: 'Beginner', prerequisite: 'A browser and code editor; no previous programming required.', cost: 'Free material and JavaScript practice. Optional hosted development services may have limits or costs.', format: 'Open curriculum + coding practice', outcome: 'Understand HTML, CSS and JavaScript well enough to inspect AI-generated work.', checkpoints: [
    step('page', 'Build a page you understand', links.web, 30, 'Create a plain HTML page with a heading, navigation and form labels. Explain the role of each element without using AI to answer for you.'),
    step('logic', 'Practice JavaScript logic', links.practice, 30, 'Complete an appropriate beginner exercise. Save one input, expected output and a boundary case. Explain why the solution works.'),
    step('debug', 'Find and fix a bug', links.web, 30, 'Break one event handler in your practice page, reproduce the failure, then fix it and test both the working and empty-input paths.'),
    step('project', 'Finish a small local tool', links.web, 45, 'Build a tiny task list with add, edit and remove. Keep a short README and test checklist. Continue the full curriculum on the provider site.'),
  ] }),
  course({ id: 'design', title: 'UI & responsive web design', provider: 'Google web.dev', url: links.design, level: 'Beginner', prerequisite: 'Basic HTML and CSS; complete Software foundations first if needed.', cost: 'Free reading and local practice. Any design software you choose has its own terms.', format: 'Responsive design course', outcome: 'Design readable, accessible layouts that work on phones and desktops.', checkpoints: [
    step('hierarchy', 'Design a clear first screen', links.design, 30, 'Sketch a page with one primary action. Choose a type scale, spacing rules and color roles. Explain where a new user should look first.'),
    step('responsive', 'Build at two widths', links.design, 45, 'Implement the same layout at 390px and 1440px. Capture both views and fix overflow, cramped controls and unreadable text.'),
    step('access', 'Try it without a mouse', links.design, 25, 'Navigate by keyboard, check visible focus and form labels, then check text contrast. Write down the issues and fixes.'),
    step('states', 'Design the awkward states', links.design, 30, 'Add empty, loading, failure and success states to one screen. Ask another person to identify the next action without coaching.'),
  ] }),
  course({ id: 'frontend', title: 'Frontend development', provider: 'The Odin Project', url: links.stack, level: 'Intermediate', prerequisite: 'HTML, CSS, JavaScript and basic Git; use the provider Foundations course first if needed.', cost: 'Free curriculum. Local exercises need a desktop development environment.', format: 'Project-based full-stack pathway', outcome: 'Build interactive interfaces and inspect their behavior under failure.', checkpoints: [
    step('state', 'Model interface state', links.stack, 30, 'For a small app, list its states and user actions before writing components. Sketch how data moves between them.'),
    step('components', 'Build reusable components', links.stack, 45, 'Follow the JavaScript/React course sections that fit your level. Build a form, a list and a reusable row with clear responsibilities.'),
    step('async', 'Handle slow and failed requests', links.stack, 30, 'Show loading, success and retry states using a practice endpoint or fixture. Check that rapid repeated clicks do not duplicate an action.'),
    step('verify', 'Review a usable feature', links.stack, 30, 'Test the feature on narrow and wide screens and with a keyboard. Write what persists after reload and what still needs work.'),
  ] }),
  course({ id: 'backend', title: 'Backend & reliable APIs', provider: 'The Odin Project', url: links.stack, level: 'Intermediate', prerequisite: 'JavaScript, basic terminal use, Git and HTTP concepts; follow the prerequisite provider courses.', cost: 'Free curriculum. Use local practice; hosting and databases may have separate costs.', format: 'Node.js course within a full-stack pathway', outcome: 'Build and test an API with validation, durable data and explicit access rules.', checkpoints: [
    step('contract', 'Define an API contract', links.stack, 25, 'Describe a create/read/update flow: request fields, responses and errors. Include malformed input and an unauthorized request.'),
    step('storage', 'Persist a small record', links.stack, 45, 'Follow the Node.js course at your level. Store a synthetic record, restart the server, and verify that the record remains.'),
    step('access', 'Check ownership boundaries', links.stack, 30, 'Create two synthetic users in your practice project. Verify that one cannot read or change the other user’s records.'),
    step('failure', 'Test failure and recovery', links.stack, 30, 'Test an invalid request and duplicate retry. Document what the API guarantees before connecting it to a frontend.'),
  ] }),
  course({ id: 'automation', title: 'Automation for useful work', provider: 'n8n Academy', url: links.automation, level: 'Beginner', prerequisite: 'Browser and an n8n practice environment; use synthetic data.', cost: 'Courses are free. n8n hosting, connected services and AI calls can cost extra. No services are installed or purchased by this app.', format: 'Structured courses + workflow practice', outcome: 'Build a reviewed automation and explain its business value and failure behavior.', checkpoints: [
    step('map', 'Map one repeatable process', links.automation, 25, 'Choose a business task. List the trigger, required data, output, human approval step and what happens when information is missing.'),
    step('workflow', 'Build a synthetic workflow', links.automation, 45, 'Complete the appropriate introductory lesson. Transform sample input into a draft output; keep outbound email and live customer actions disabled.'),
    step('errors', 'Handle duplicates and errors', links.automation, 30, 'Run duplicate, missing-field and failed-service examples. Record the retry rule and what requires human attention.'),
    step('demo', 'Prepare a client demonstration', links.automation, 30, 'Record a demonstration with synthetic data. Explain the time saved, ongoing costs and limitations without promising unmeasured results.'),
  ] }),
  course({ id: 'agents', title: 'Generative AI & agent systems', provider: 'Microsoft open courses', url: links.agents, level: 'Intermediate', prerequisite: 'Basic programming and API concepts; begin with the generative AI course if new to models.', cost: 'Free learning materials. Some labs require provider accounts, API credits or cloud services. Read setup costs before running them.', format: 'Open curriculum + optional labs', outcome: 'Design a bounded agent with tools, evaluation and human review.', checkpoints: [
    step('basics', 'Understand the model boundary', links.genai, 30, 'Explain prompts, outputs and three failure modes for your chosen use case. Compare an AI solution with a simpler deterministic option.'),
    step('tools', 'Design one bounded tool', links.agents, 30, 'Specify its input, output, permissions and failure response. Use a harmless local example before real customer data or actions.'),
    step('evaluate', 'Build a small evaluation set', links.agents, 40, 'Write five typical and five difficult synthetic cases. Define acceptable outcomes and record failures; never substitute a fluent response for a passing test.'),
    step('handoff', 'Add an approval boundary', links.agents, 30, 'Show when the agent must stop for review, how it reports uncertainty and how you can undo a change. Use a local simulation before connecting services.'),
  ] }),
  course({ id: 'youtube', title: 'YouTube visual design workshop', provider: 'YouTube Help + original practice briefs', url: links.youtube, level: 'Beginner', prerequisite: 'An original video idea and a drawing or design tool.', cost: 'Free official guidance. Optional design software has separate terms; publishing is not required.', format: 'Guided workshop, not a full provider course', outcome: 'Create honest title/thumbnail concepts and a repeatable design review.', checkpoints: [
    step('promise', 'Define the video promise', links.youtube, 20, 'Write the intended viewer and the useful result your video will deliver. Draft three accurate titles that match the planned content.'),
    step('variants', 'Make three visual concepts', links.youtube, 40, 'Create three original thumbnail sketches with different compositions. Keep the subject clear and assess them at phone size.'),
    step('review', 'Review clarity and accuracy', links.youtube, 25, 'Ask someone what they expect from each title/thumbnail. Record their answers and revise any misleading or confusing design.'),
    step('template', 'Create a reusable design kit', links.youtube, 30, 'Save your typography, colors and export checklist. If you later publish, assess real performance in context rather than assuming a guaranteed click-through rate.'),
  ] }),
];
