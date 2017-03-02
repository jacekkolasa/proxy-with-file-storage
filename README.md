# proxy-with-file-storage
Very simple proxy for caching purposes

# usage
```
npm install
npm run start

```
Afterwards change the url's for you app from:
```
https://google.com
```
to:
```
http://localhost:3010/google.com
```
The `method` and the `body` will be forwarded, and the result stored in `/data` folder, so it is automatically reused the next time.
 
 The script distinct different calls using `url`, `method` and stringified `body`, so calls to the same api with different params will be treated as different.
 
 Supports json and images. All calls having word 'image' in url are treaded as such.
