#!/usr/bin/env node
const program = require('commander')
const thispkg = require(`${__dirname}/package.json`)
const pkg = require(`${process.cwd()}/package.json`)
const fs = require('fs')
var travis
var readme
var readmefd
var readmepath = `${process.cwd()}/README.md`

/* eslint-disable no-console */
try {
  travis = fs.readFileSync(`${process.cwd()}/.travis.yml`, 'utf-8')
} catch (e) {
  console.log('no travis configuration found')
}
try {
  var stats = fs.statSync(readmepath)
  // open the file (getting a file descriptor to it)
  readmefd = fs.openSync(readmepath, 'r')
  var buffer = Buffer.alloc(stats.size)

  // read its contents into buffer
  fs.readSync(readmefd, buffer, 0, buffer.length, null)
  readme = buffer.toString('utf8', 0, buffer.length)
  fs.closeSync(readmefd)
} catch (e) {
  console.error(e)
  process.exit(1)
}

program
  .name(thispkg.name)
  .version(thispkg.version)
  .description(thispkg.description)
  .action(async function (cmd) {
    var badges = `[![npm](https://img.shields.io/npm/v/${pkg.name}.svg)](https://www.npmjs.com/package/${pkg.name})`
    if (travis) {
      badges = `${badges} [![Build Status](https://travis-ci.org/guldcoin/tech-js-node_modules-${pkg.name}.svg?branch=guld)](https://travis-ci.org/guldcoin/tech-js-node_modules-${pkg.name})`
    }
    badges = `${badges} [![source](https://img.shields.io/badge/source-bitbucket-blue.svg)](https://bitbucket.org/guld/tech-js-node_modules-${pkg.name}) [![issues](https://img.shields.io/badge/issues-bitbucket-yellow.svg)](https://bitbucket.org/guld/tech-js-node_modules-${pkg.name}/issues)`
    var install = `### Install

`
    if (pkg.main || pkg.bin) {
      install = `${install}##### Node

\`\`\`sh
npm i ${pkg.preferGlobal ? '-g ' : ' '}${pkg.name}
\`\`\`
`
    }
    if (pkg.browser) {
      install = `${install}##### Browser

\`\`\`sh
curl ${pkg.repository.replace(':', '/').replace(`git@`, 'https://')}/raw/guld/${pkg.browser} -o ${pkg.browser}
\`\`\`
`
    }
    var usage = `### Usage

`
    var halp = await new Promise(resolve => this.outputHelp(resolve))
    if (pkg.bin) {
      usage = `${usage}##### CLI

\`\`\`sh
${Object.keys(pkg.bin)[0]} --help

${halp}\`\`\`
`
    } else if (typeof (readme) === 'undefined') {
      usage = `${usage}##### node

\`\`\`javascript
require('${pkg.name}')
\`\`\`
`
    } else {
      var re = new RegExp('### Usage[#\\s\\w=+*,(){}<>$`"\'./:@-]*(### )*')
      usage = re.exec(readme)[0]
    }
    if (pkg.browser) {
      install = `${install}##### Browser

\`\`\`sh
curl ${pkg.repository.replace(':', '/').replace(`git@`, 'https://')}/raw/guld/${pkg.browser} -o ${pkg.browser}
\`\`\`
`
    }

    readme = `# ${pkg.name}

${badges}

${pkg.description}

${install}
${usage}
### License

${pkg.license} Copyright ${pkg.author}

`.replace('\n\n\n', '\n\n')
    fs.writeFileSync(readmepath, readme)
    console.log('updated readme')
  })
program.parse(process.argv)

/* eslint-enable no-console */
