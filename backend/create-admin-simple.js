const https = require("https");

const data = JSON.stringify({
  email: "admin@eventpass.com",
  password: "AdminPassword123!",
  firstName: "Admin",
  lastName: "User",
});

const options = {
  hostname: "eventpass-backends.vercel.app",
  port: 443,
  path: "/api/v1/create-admin/create-admin",
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "Content-Length": data.length,
  },
};

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);

  res.on("data", (d) => {
    console.log("Response:", d.toString());
  });
});

req.on("error", (e) => {
  console.error("Error:", e);
});

req.write(data);
req.end();

