loghub-web
==========
[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](http://standardjs.com/)

安装说明
=======

**Node.js:**

    npm install loghub-web

**bower:**

    bower install loghub-web

**Browser:**

    <script src="/pathTo/loghub-web.js"></script>

**with require**

    var log = require('loghub-web');

**with define**

    define(['loghub-web'], function (log) {
        //...
    });

使用说明
=======

### `loghub(options)`

配置loghub，options是一个`object`，默认配置及说明如下：

```js
options = {
  host: '',                 // 日志服务器访问地址
  token: '',                // token 验证
  logHook: null,            // fn(log, tag) 自定义日志内容加工方法
  request: null,            // fn(url, log) 自定义日志内容提交方法
  slient: {                 // 禁止打印记录
    log: false,             // false为允许log方法在控制台打印记录
    error: false
  },
  report: {                 // 同步到日志服务器
    log: true,              // false为不同步
    error: true,
    globalError: true       // 是否启用 window.onerror 捕捉错误日志
  }
}
```

你随时可以调用loghub(options)修改配置，options将merge到原有配置，
如在生产版中禁止log打印，仅允许error：

```js
  loghub({
    host: 'logs.teambition.net/log.gif',
    slient: {
      log: true,
      error: false
    }
  })
```

### `loghub.error(error)`

默认行为同 `console.error(error)`，处理错误日志。

### `loghub.log(logObj)`

默认行为同 `console.log(logObj)`，处理普通日志。

### `loghub.timing`

页面加载性能数据，包含 `fetchStart`, `domainLookupStart`, `domainLookupEnd`,`connectStart`, `connectEnd`,
 `requestStart`, `responseStart`, `responseEnd`, `startTime`(本模块初始化时间),
可以用来衡量页面加载性能，如果浏览器不支持某个字段，其值会被设置为 `0`。

### `loghub.getEntries()`

资源加载性能数据，该方法返回一个数组，其中每个元素都包含 `name`, `entryType`,
`initiatorType`, `startTime` 和 `duration` 字段，
可以用来衡量资源加载性能，如果浏览器不支持，则会返回一个空数组，如果特定字段不被支持，
其值会被设置为 `0`。
