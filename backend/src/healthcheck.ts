const http = require("http")


const options = {
  hostname: "localhost",
  port: process.env.PORT || 4000,
  path: "/api/v1/health",
  method: "GET",
  timeout: 2000,
}

const req = http.request(options, (res: any) => {
  if (res.statusCode === 200) {
    process.exit(0)
  } else {
    process.exit(1)
  }
})

req.on("error", () => {
  process.exit(1)
})

req.on("timeout", () => {
  req.destroy()
  process.exit(1)
})

req.end()
