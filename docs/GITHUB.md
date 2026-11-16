# GitHub upload

Target repository: `maxgresch/native-creative-studio`.

The connected GitHub tools can upload source to an existing repository. They cannot create the repository. Create an empty repository first, then provide its URL in the project conversation. Leave automatic README, license and .gitignore creation off; this source package already contains README and .gitignore files.

The initial upload should include the application source, tests, package manifest and lockfile, documentation, required assets and `.env.example`. Use the neutral hosting manifest from the downloadable source package when creating an independent repository. Do not copy this Site's identity into a second Site.

Do not upload the ZIP itself as the source tree. Exclude dependency folders, generated builds, local environment files, credentials and browser project files. The prepared ZIP already excludes these. If the interface links to `public/project-source.zip`, include that downloadable snapshot when uploading the working checkout. It is an additional asset, not a replacement for the source files. The downloadable ZIP excludes a recursive copy of itself.

Initial release status: prototype. The teaser creator, example and exports work. Automatic concept and draft generation still require a configured model account. Keep that status in the README until the connection has been implemented and tested.

Uploading source to GitHub does not deploy this server-backed application. The private Site remains the running preview; its audience is controlled separately.
