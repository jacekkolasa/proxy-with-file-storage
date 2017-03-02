const _ = require('lodash/fp');
const fs = require('fs');
const koa = require('koa');
const request = require('koa-request');
const router = require('koa-router')();
const bodyParser = require('koa-bodyparser');
const cors = require('koa-cors');
const send = require('koa-send');
const app = koa();

app.use(cors());

const encodeFilename = (opts) => {
  const {
    url,
    method,
    body,
  } = opts;
  return `${url}---${method}---${JSON.stringify(body)}`
    .replace(/\//g, '-')
    .replace(/\\/g, '-');
};

const getFile = (filename, encoding = 'utf8') => {
  if (encoding === 'binary') {
    console.log('get binary', filename); // eslint-disable-line
  }
  try {
    return fs.readFileSync(`./data/${filename}`, encoding);
  } catch (e) {
    return null;
  }
};

const saveFile = (filename, data, encoding = 'utf8') => {
  if (encoding === 'binary') {
    console.log('save binary', filename); // eslint-disable-line
  }
  fs.writeFileSync(`./data/${filename}`, data, encoding);
};

router.all('*', function *() {
  const {
    url,
    method,
    header,
    body,
  } = this.request;

  console.log('----------------------------------------'); // eslint-disable-line
  const isMedia = url.indexOf('image') !== -1;
  const options = {
    url: `https:/${url}`,
    method,
    headers: {
      'Content-Type': 'application/json',
      authorization: header.authorization || null,
    },
    body: _.isEmpty(body) ? undefined : JSON.stringify(body),
    // null will the body as a Buffer, and undefined is the default
    encoding: isMedia ? null : undefined,
  };
  const filename = encodeFilename(options);
  console.log('getting file:', filename); // eslint-disable-line
  const file = getFile(filename, isMedia ? 'binary' : undefined);

  if (file) {
    console.log('file exists'); // eslint-disable-line
    if (isMedia) {
      yield send(this, filename, { root: './data' });
      return;
    }

    try {
      this.body = JSON.parse(file);
    } catch (err) {
      this.throw('466', 'error parsing the file');
    }
    return;
  }

  if (!file) {
    // make the request
    console.log('making new request'); // eslint-disable-line
    const response = yield request(options);
    if (response.statusCode > 201) {
      console.log('ERROR', response.statusCode); // eslint-disable-line
      console.log('response.url', response.url); // eslint-disable-line
      console.log('filename', filename); // eslint-disable-line
    }
    // saveFile(filename, response.body);
    saveFile(filename, response.body, isMedia ? 'binary' : undefined);
    console.log('success, saved'); // eslint-disable-line

    try {
      if (isMedia) {
        this.body = response.body;
      } else {
        this.body = JSON.parse(response.body);
      }
    } catch (err) {
      this.throw('400', 'error parsing the file');
      console.log('response.body', response.body); // eslint-disable-line
    }
  }
});

app
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods());


app.listen(3010);
