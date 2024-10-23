import * as fs from 'fs'
import * as path from 'path'
import * as http from 'http'

export const createServerHTTP = () => {

  const port = parseInt(process.env.HTTP_PORT!, 10) || 8181

  const server = http.createServer((req, res) => {
      const __dirname = path.resolve(path.dirname(''))
      const file_path = __dirname + (req.url === '/' ? '/front/index.html' : '/front' + req.url)
      fs.readFile(file_path, (err, data) => {
        if (err) {
          res.writeHead(404)
          res.end(JSON.stringify(err))
          return
        }
        res.writeHead(200)
        res.end(data)
      })
  })

  server.listen(
      port,
      () => { console.log(`${'HTTP SERVER:'} started on port ${port}.`) }
  )

  return server
}
