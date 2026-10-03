# Convex `fetch()` errors test

This workspace is for experimenting with the differences between the non-HTTP error responses that `fetch()` throws and how they differ between the Convex and Node.js runtimes.

In particular in the Convex runtime `fetch()` is powered by a custom JavaScript runtime similar to Cloudflare Workers with a browser-like implementation of globals and has very limited detail reporting of fetch errors.

While in the Node.js runtime `fetch()` is powered by `undici` and emits errors that wrap errors from underlying system calls with error causes that can be differentiated.

This project is setup so you can run it in a devcontainer so I recommend you do so. If you do not, remember to `pnpm install` before continuing, that is done implicitly in the devcontainer.

To get setup run `pnpm dev` interactively and get a deployment running.

From there you can either open the dashboard with `pnpm dashboard` and run the `fetch:compare` function or use the `./fetch-compare [url]` shell script from within the workspace to call the compare.

If you use `./fetch-compare` it will either accept a single argument with the URL or prompt you for a URL if one is not given.

## Examples

### A 200 OK response

This looks similar whether it's run from the Convex runtime or the Node.js runtime.

```js
//> ./fetch-compare http://example.com
{
  convex: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewportcontent="width=device-width,initial-scale=1"><title>Example Domain</title><style>html{color-scheme:light dark;background:light-dark(#eee,#222)}body{font:16px/1.6 system-ui,sans-serif;max-width:26em;margin:auto;padding:25vh 2em 2em;text-align:center}</style></head><body><p>This domain is for use in documentation examples without needing permission. This is not a service; avoid relying on it for testing and m'
  },
  node: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewportcontent="width=device-width,initial-scale=1"><title>Example Domain</title><style>html{color-scheme:light dark;background:light-dark(#eee,#222)}body{font:16px/1.6 system-ui,sans-serif;max-width:26em;margin:auto;padding:25vh 2em 2em;text-align:center}</style></head><body><p>This domain is for use in documentation examples without needing permission. This is not a service; avoid relying on it for testing and m'
  }
}
```

### A 404 Not Found response

This also behaves similar. Generally most HTTP errors are equivalent.

```js
//> ./fetch-compare http://example.com/404
{
  convex: {
    fromIp: '203.0.113.1',
    ok: false,
    status: 404,
    statusText: 'Not Found',
    textIntro: '<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewportcontent="width=device-width,initial-scale=1"><title>Example Domain</title><style>html{color-scheme:light dark;background:light-dark(#eee,#222)}body{font:16px/1.6 system-ui,sans-serif;max-width:26em;margin:auto;padding:25vh 2em 2em;text-align:center}</style></head><body><p>This domain is for use in documentation examples without needing permission. This is not a service; avoid relying on it for testing and m'
  },
  node: {
    fromIp: '203.0.113.1',
    ok: false,
    status: 404,
    statusText: 'Not Found',
    textIntro: '<!doctype html><html lang=en><head><meta charset=utf-8><link rel=icon href=data:,><meta name=viewportcontent="width=device-width,initial-scale=1"><title>Example Domain</title><style>html{color-scheme:light dark;background:light-dark(#eee,#222)}body{font:16px/1.6 system-ui,sans-serif;max-width:26em;margin:auto;padding:25vh 2em 2em;text-align:center}</style></head><body><p>This domain is for use in documentation examples without needing permission. This is not a service; avoid relying on it for testing and m'
  }
}
```

### A comparison of headers

The server responses are generally the same, but that doesn't mean the requests are the same. httpbin's /get endpoint echos the request back so we can take a look at the differences between the two.

- Node.js adds `Sec-Fetch-Mode: cors`
- User-Agent differs, with the Convex runtime reporting its own name and the Convex Node.js runtime just reporting "node"
- Interestingly the origin IP differs between the Convex and Node runtimes. I consistently get the same IP for each but it's always different between the two. So I guess the runtimes run on different machines.
- Interestingly the Node.js runtime supports Brotli compression but a fetch from Convex within the same deployment does not.

```js
//> ./fetch-compare https://httpbin.org/get
{
  convex: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '{\n' +
      '  "args": {}, \n' +
      '  "headers": {\n' +
      '    "Accept": "*/*", \n' +
      '    "Accept-Encoding": "gzip", \n' +
      '    "Host": "httpbin.org", \n' +
      '    "User-Agent": "Convex/1.0", \n' +
      '    "X-Amzn-Trace-Id": "Root=1-abcdefgh-abcdefghijklmnopgrstuvwx"\n' +
      '  }, \n' +
      '  "origin": "<ip address a>", \n' +
      '  "url": "https://httpbin.org/get"\n' +
      '}\n'
  },
  node: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '{\n' +
      '  "args": {}, \n' +
      '  "headers": {\n' +
      '    "Accept": "*/*", \n' +
      '    "Accept-Encoding": "br, gzip, deflate", \n' +
      '    "Accept-Language": "*", \n' +
      '    "Host": "httpbin.org", \n' +
      '    "Sec-Fetch-Mode": "cors", \n' +
      '    "User-Agent": "node", \n' +
      '    "X-Amzn-Trace-Id": "Root=1-abcdefgh-abcdefghijklmnopgrstuvwx"\n' +
      '  }, \n' +
      '  "origin": "<ip address b>", \n' +
      '  "url": "https://httpbin.org/get"\n' +
      '}\n'
  }
}
```

If we look closer with httpbun instead, we can also see that different versions of Caddy are used.

```js
//> ./fetch-compare https://httpbun.com/headers
{
  convex: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '{\n' +
      '  "headers": {\n' +
      '    "Accept": "*/*",\n' +
      '    "Accept-Encoding": "gzip",\n' +
      '    "Host": "httpbun.com",\n' +
      '    "User-Agent": "Convex/1.0",\n' +
      '    "Via": "2.0 Caddy"\n' +
      '  }\n' +
      '}\n'
  },
  node: {
    fromIp: '203.0.113.1',
    ok: true,
    status: 200,
    statusText: 'OK',
    textIntro: '{\n' +
      '  "headers": {\n' +
      '    "Accept": "*/*",\n' +
      '    "Accept-Encoding": "br, gzip, deflate",\n' +
      '    "Accept-Language": "*",\n' +
      '    "Host": "httpbun.com",\n' +
      '    "Sec-Fetch-Mode": "cors",\n' +
      '    "User-Agent": "node",\n' +
      '    "Via": "1.1 Caddy"\n' +
      '  }\n' +
      '}\n'
  }
}
```

### 401 Unauthorized

This one is just minorly wierd, one of the runtimes seems to normalize the statusText sent by the server while the other does not.

```js
//> ./fetch-compare https://httpbin.org/bearer
{
  convex: {
    fromIp: '203.0.113.1',
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    textIntro: ''
  },
  node: {
    fromIp: '203.0.113.1',
    ok: false,
    status: 401,
    statusText: 'UNAUTHORIZED',
    textIntro: ''
  }
}
```

### TCP echo

This is where we really see the differences. https://tcpbin.org/ has a TCP info service at https://34.230.40.69:30001. This is not HTTP nor is it SSL/TLS so `fetch()` cannot handle it. What we get is a runtime specific error back.

Node.js returns a wrapper around an underlying connect syscall error.

While the Convex runtime returns a TypeError with no details outside the error message for HTTPS; but interestingly returns a 502 Bad Gateway for HTTP suggesting a middleman which can speak HTTP even when the other end does not.

```js
//> ./fetch-compare http://34.230.40.69:30001
{
  convex: {
    fromIp: '203.0.113.1',
    ok: false,
    status: 502,
    statusText: 'Bad Gateway',
    textIntro: 'Failed to connect to remote host: <nil>\n'
  },
  node: {
    error: {
      cause: {
        address: '34.230.40.69',
        code: 'ECONNREFUSED',
        errno: -111,
        message: 'connect ECONNREFUSED 34.230.40.69:30001',
        name: 'Error',
        port: 30001,
        syscall: 'connect'
      },
      message: 'fetch failed',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  }
}
```

```js
//> ./fetch-compare https://34.230.40.69:30001
{
  convex: {
    error: {
      message: 'error sending request for url (https://34.230.40.69:30001/): client error (Connect): tunnel error: unsuccessful',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  },
  node: {
    error: {
      cause: {
        address: '34.230.40.69',
        code: 'ECONNREFUSED',
        errno: -111,
        message: 'connect ECONNREFUSED 34.230.40.69:30001',
        name: 'Error',
        port: 30001,
        syscall: 'connect'
      },
      message: 'fetch failed',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  }
}
```

### Immediately closed connection

```js
//> ./fetch-compare https://testserver.host/error/close
{
  convex: {
    error: {
      message: 'error sending request for url (https://testserver.host/error/close): client error (SendRequest): connection closed before message completed',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  },
  node: {
    error: {
      cause: {
        code: 'UND_ERR_SOCKET',
        message: 'other side closed',
        name: 'SocketError',
        socket: {
          bytesRead: 0,
          bytesWritten: 185,
          localAddress: '169.254.100.6',
          localPort: 55686,
          remoteAddress: '168.220.82.135',
          remoteFamily: 'IPv4',
          remotePort: 443
        }
      },
      message: 'fetch failed',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  }
}
```

### HTTPS Certificate expired

```js
//> ./fetch-compare https://expired.testserver.host/
{
  convex: {
    error: {
      message: 'error sending request for url (https://expired.testserver.host/): client error (Connect): invalid peer certificate: certificate expired: verification time 1791034488 (UNIX), but certificate is not valid after 1771333192 (19701296 seconds ago)',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  },
  node: {
    error: {
      cause: {
        code: 'CERT_HAS_EXPIRED',
        message: 'certificate has expired',
        name: 'Error'
      },
      message: 'fetch failed',
      name: 'TypeError'
    },
    fromIp: '203.0.113.1',
    ok: false
  }
}
```
