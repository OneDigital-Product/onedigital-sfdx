const core = require('@actions/core')
const exec = require('child_process').exec
const fs = require('fs')

try {
  installSFDX()
} catch (error) {
  core.setFailed(error.message)
}

function installSFDX() {
  const download = 'wget https://developer.salesforce.com/media/salesforce-cli/sf/channels/stable/sf-linux-x64.tar.xz -q -P /tmp'
  const createDir = 'mkdir /tmp/sfdx'
  const unzip = 'tar xJf /tmp/sf-linux-x64.tar.xz -C /tmp/sf --strip-components 1'
  const install = 'echo "/tmp/sf/bin" >> $GITHUB_PATH'
  const version = '/tmp/sf/bin/sf --version && /tmp/sf/bin/sf plugins --core'

  exec(`${download} && ${createDir} && ${unzip} && ${install} && ${version}`, function(error, stdout, stderr) {
    if (error) throw(stderr)
    core.info(stdout)
    if (core.getInput('sfdx-auth-url')) createAuthFile()
  })
}

function createAuthFile() {
  fs.writeFileSync('/tmp/sfdx_auth.txt', core.getInput('sfdx-auth-url'))
  authSFDX()
}

function authSFDX() {
  const orgAlias = core.getInput('org-alias') || 'OD_PROD'
  const params = orgAlias === 'OD_PROD' ? `--setdefaultdevhubusername -a ${orgAlias}` : `-a ${orgAlias}`
  exec(`/tmp/sf/bin/sfdx auth:sfdxurl:store -f /tmp/sfdx_auth.txt ${params}`, function(error, stdout, stderr) {
    if (error) throw(stderr)
    core.info(stdout)
  })
}