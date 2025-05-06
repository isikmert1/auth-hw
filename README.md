Auth‑HW is a small React + TypeScript project that demonstrates a straightforward email‑and‑password flow: sign‑up, sign‑in, route protection, and session persistence in local storage. The UI uses Tailwind utility classes and shadcn‑ui primitives, and the code is organised so that you can swap the mock back‑end for any real API by touching a single file.

Quick start\
- Clone the repository with git.\
- Install dependencies with your preferred package manager (npm, pnpm, or Bun).\
- If you need remote credentials, copy .env.example to .env and fill in the blanks.\
- Run the dev script to launch Vite and open <http://localhost:5173>.\
- Build for production with the build script, then preview locally with the preview script.\
- Run the test script to exercise the included Vitest samples.

Folder highlights\
-- src/components holds reusable UI parts.\
-- src/hooks/useAuth.ts is the central authentication logic.\
-- src/pages contains Login, Register, and the protected Dashboard.\
-- src/lib/fakeServer.ts is the mock API; point those calls at a real back‑end when you're ready.\
-- tests/ shows how to cover hooks and pages with Vitest and jsdom.

Contributing\
Bug reports, feature requests, and pull‑requests are welcome. Please run linting and tests before opening a PR.

Licence\
MIT. Use it freely, just keep the licence and don't blame me if something breaks.
