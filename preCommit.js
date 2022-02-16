// eslint-disable no-console
const childProcess = require('child_process');
const fs = require('fs');
const path = require('path');

const COMMIT_MSG = process.argv[2];
console.log(COMMIT_MSG)

main();

function main() {
  console.log('---run preCommit.js---');
  gitReset();
  console.log('---end preCommit.js---');
  process.exit(0);
}

function gitReset() {
  // gitのコマンドを実行してコミットされようとしているファイルパスを抽出
  const filePaths = childProcess
    .execSync('git diff --staged --diff-filter=ACMR --name-only -z').toString()
    // git diff --staged --diff-filter=ACMR --name-only -z で次の様な文字列が標準出力されます
    //.php-cs-fixer.php^@app/Http/Controllers/MemberAPI/ClientErrorLoggerController.php^@gitHooks/preCommit.js^@resources/js/@types/not-js-files.d.ts^@
    // ^@は \u0000 のヌル文字です
    // この実行結果を整形して有効なファイルパスの配列にします
    .replace(/\u0000$/, '')
    .split("\u0000")
    .filter(v => !!v)
  ;
  // 対象のファイル一覧を表示。このファイルパスを元に色々できます。
  console.log(filePaths)

  const ignoreFiles = fs.readFileSync(path.join(__dirname, 'dontCommitFileList.txt'))
    .toString()
    .replace('\r', '')
    .split('\n')
    .join('|')
  const reg = new RegExp(`.*(${ignoreFiles})`);
  filePaths.forEach(p => {
    if(reg.test(p)){
      const msg = childProcess.execSync(`git reset ${p}`).toString();
      console.log(msg);
      console.log(`${p}  のコミットを防ぎました。`)
    }
  })
}
