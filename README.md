# Datum Ipsum
## Realistic placeholder data for design & development

Placeholder data is a lot like placeholder text. It’s a design tool meant to ensure the final product — in our case, a real-time data visualization — matches our mockups. It’s useful in all the same ways placeholder text is useful:

1. Placeholder data allows a designer to test her assumptions about the product.
2. Placeholder data makes decision-making much easier by providing realistic constraints.
3. Placeholder data sets realistic expectations for clients and stakeholders.

Read the full explanation of placeholder data [here](https://medium.com/mission-log/datum-ipsum-designing-real-time-visualizations-with-realistic-placeholder-data-27b873307ff9#.tj78ojl10).

### Getting Started

```bash
$ git clone git@github.com:planetary/datumipsum
$ cd datumipsum
$ npm install
```

Then, run `gulp build` to build the project.

### Developing
Run `gulp` to continuously watch and re-build the project. Airframe will automatically run a server
from the `build` folder at `localhost:3000`.

### Gulp Tasks
| Task              |  Description                                                                           |
| ----------------- |  ------------------------------------------------------------------------------------- |
| build             |  builds all the registered static resources from assets into build                     |
| build:fonts       |  moves fonts to the build folder                                                       |
| build:images      |  compresses images and moves them to the build folder                                  |
| build:scripts     |  bundles all client-side javascript files into the build folder via browserify         |
| build:styles      |  compiles all scss files into the build folder                                         |
| build:templates   |  compiles the jade templates to the build folder                                       |
| clean             |  deletes all build artifacts                                                           |
| default           |  builds the site, serves it locally and redeploys when files are changed               |
| help              |  Display this help text.                                                               |
| lint              |  runs all registered linters and out prints any detected issues                        |
| lint:scripts      |  lints all non-vendor js(x) files against .eslintrc                                    |
| lint:styles       |  lints all non-vendor scss files against scss-lint.yml                                 |
| serve             |  serves static templates locally                                                       |
| serve:browsersync |  proxies the localhost server via BrowserSync to dynamically update assets             |
| watch             |  waits for changes in project files and attempts to rebuild them                       |
| watch:fonts       |  watches the source fonts for changes and moves them to the build folder when they do  |
| watch:images      |  watches the source images folders and recompresses them when changed                  |
| watch:scripts     |  waits for client-side javascript files to change, then rebuilds them                  |
| watch:styles      |  waits for scss files to change, then rebuilds them                                    |
| watch:templates   |  watches the templates folder for changes and recompiles them                          |

Run `gulp help` at any time to see this list of tasks.

### Installing Sublime Text Helpers

#### SCSS Linting

1. Open Sublime Text 3, type `Cmd+Shift+P` to open the prompt and type to select "Package Control:
   Install Package"
2. Type to select "SublimeLinter", wait until that finishes installing.
3. Open the "Install Package" prompt from step 1 again and type to select
   "SublimeLinter-contrib-scss-lint", wait until that finishes installing.
4. From the command line, run `sudo gem install scss-lint`
4. Restart Sublime Text 3 and you should now see linting issues in the gutter of the editor.
