import { replaceInFile } from 'replace-in-file';
import packageJson from './package.json' with { type: 'json' };
import moment from 'moment-timezone';
 
const buildVersion = packageJson.version;
const buildDate = moment().format('DD-MM-YYYY HH:mm');
 
const options = {
    files: 'src/app-info.ts',
    from: [/version: '(.*)'/, /tag: '(.*)'/, /buildNumber: (.*)/, /buildDate: '(.*)'/],
    to: ["version: 'v" + buildVersion + "'", "buildDate: '" + buildDate + "'"],
    allowEmptyPaths: false,
};
 
try {
    let changedFiles = await replaceInFile(options);
    if (changedFiles.length === 0) {
        throw new Error("Please make sure that file '" + options.files + "' has \"version: ''\"");
    }
    console.log('UI Build version is set to: v' + buildVersion);
} catch (error) {
    console.error('Error occurred updating app-info:', error);
}