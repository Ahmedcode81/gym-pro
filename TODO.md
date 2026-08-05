# GymPro - Static Frontend Demo Build - Task List

## Goal
Build a fully static, frontend-only GymPro demo (localStorage mock API, fake auth, seeded data, full CRUD) deployable to GitHub Pages. Keep React/backend locally, exclude from GitHub.

## Setup
- [x] 1. Create backup branch `backup-original-project`
- [ ] 2. Update .gitignore to exclude backend/, venv/, __pycache__/, *.py, DB, secrets

## Core Infrastructure
- [ ] 3. index.html (SPA shell: login + app layout)
- [ ] 4. css/styles.css (replicate Tailwind design system)
- [ ] 5. js/utils.js (delay, toast, formatters, helpers)
- [ ] 6. js/storage/database.js (localStorage CRUD engine)
- [ ] 7. js/storage/seed.js (seed realistic gym data)
- [ ] 8. js/api/mockApi.js (simulated fetch 300-800ms)
- [ ] 9. js/auth/auth.js (fake login, 6 roles)
- [ ] 10. js/app.js (router, sidebar, page loader, auth guard)

## Services
- [ ] 11. js/services/*.js (members, trainers, plans, attendance, payments, classes, inventory, equipment, branches, users, dashboard)

## Pages
- [ ] 12. Login
- [ ] 13. Dashboard
- [ ] 14. Members
- [ ] 15. Membership Plans
- [ ] 16. Check In
- [ ] 17. Trainers
- [ ] 18. Workout Programs
- [ ] 19. Nutrition Plans
- [ ] 20. Body Measurements
- [ ] 21. Group Classes
- [ ] 22. Payments
- [ ] 23. POS
- [ ] 24. Inventory
- [ ] 25. Reports
- [ ] 26. Settings
- [ ] 27. Users
- [ ] 28. Branches
- [ ] 29. Equipment

## Finalization
- [ ] 30. README.md (GitHub Pages deploy instructions)
- [ ] 31. Remove React/backend from git, commit static demo
- [ ] 32. Test, verify no broken links/empty pages/JS errors
- [ ] 33. Force-push to GitHub Pages
