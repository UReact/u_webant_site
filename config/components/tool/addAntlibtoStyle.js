/**
 * 将js 中引入的 antd 组件加入到 css 和 less 中
 * antd/lib/button
 * 在 css.js 中加入 require('antd/lib/button/style/css')
 * 在 less 中加入 @import '~antd/lib/button/style/index.less';
 */
const fs = require('fs');
const pathTool = require('path');
const { createStyleFolder, appentContent } = require('./createStyleFolder');

// const components = require('../components.config.js');

createStyleFolder('../lib');
// 所有使用过的 ant 组件
// 之所以是个对象是为了去重
const antdLibMap = {};

const addAntlibtoStyle = function(parentsFolder) {
  const loop = parents => {
    const paths = fs.readdirSync(pathTool.join(__dirname, parents));
    paths.forEach(path => {
      if (path === '_utils') {
        return;
      }
      const fileStatus = fs.lstatSync(pathTool.join(__dirname, parents, path));
      if (fileStatus.isFile() && path.indexOf('.js') > -1) {
        const relaPath = pathTool.join(__dirname, parents, path);
        const jsString = fs.readFileSync(relaPath).toString();

        const localExecArray = jsString.match(/(\.\.\/)(\w*((-)*\w+)*)/gi);
        const execArray = jsString.match(/(antd\/lib\/)(\w*((-)*\w+)*)/gi);
        if (!execArray && !localExecArray) {
          return;
        }
        const cssPathString = [];
        const lessPathString = [];

        if (execArray) {
          execArray.forEach(antdLib => {
            antdLibMap[antdLib] = true;
            cssPathString.push(`require('${antdLib}/style/css');`);
            lessPathString.push(`require('${antdLib}/style/index');`);
          });
        }
        if (localExecArray) {
          localExecArray.forEach(localLib => {
            if (localLib !== '../_utils') {
              cssPathString.push(`require('../${localLib}/style/css');`);
              lessPathString.push(`require('../${localLib}/style/index');`);
            }
          });
        }

        const stylePath = pathTool.join(__dirname, parents, 'style');
        if (stylePath.includes('style/style')) {
          return false;
        }
        if (!fs.existsSync(stylePath)) {
          fs.mkdirSync(stylePath);
        }
        // appent to css.js
        const cssJsPath = pathTool.join(__dirname, parents, 'style/css.js');
        appentContent(cssJsPath, cssPathString.join('\n'));

        // appent to index.js
        const lessJsPath = pathTool.join(__dirname, parents, 'style/index.js');
        appentContent(lessJsPath, lessPathString.join('\n'));
      }
      if (fileStatus.isDirectory()) {
        loop(pathTool.join(parents, path));
      }
    });
  };
  loop(parentsFolder);
};

addAntlibtoStyle('../lib');
