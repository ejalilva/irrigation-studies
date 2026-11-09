# Notes for Claude

- Read `docs/MAINTAINING.md` before changing the site, and keep it up to date with what you change.

## Privacy

Everything around this repository is public: files, code comments, commit messages, branch names, pull request and issue titles, descriptions and comments, review comments, and the logs of Actions runs. Never write personal information in any of them:

- personal email addresses or phone numbers (visitors reach Ehsan through the site's Contact form);
- a home address, or the town or neighbourhood he lives in;
- names or other details of relatives, or that a change concerns them;
- birth dates, ID, passport, visa or immigration details, health or finances;
- travel plans or dates he will be away.

How to keep to it:

- Describe privacy-related changes neutrally ("Gallery: remove two photos"), without saying who is in them or why. The same goes for code comments and docs.
- When you find personal information, tell Ehsan in the conversation, not in a commit, pull request, issue or comment.
- Commit as `Claude <noreply@anthropic.com>`; never use a personal email address as a commit author.
- Strip location data (EXIF, GPS) from every picture before adding it. Don't add personal photos beyond field work, talks and research visits unless Ehsan asks; the photos already in the gallery are there by his choice.
- The Privacy check workflow (`.github/workflows/privacy-check.yml`) fails when a personal email address appears in a file, in a new commit's author or message, or in a pull request's title or description. It reports where, never the address itself.
