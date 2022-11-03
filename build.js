const shell = require('shelljs')

shell.exec('npm run push')

shell.exec('git add .')

shell.exec('git commit -m "update blog"')

shell.exec(`git push origin master`)