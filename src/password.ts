import express from "express";
import config from "./config";
const sha = require("js-sha512").sha512;

const COOKIE = "90325iaow3j5oiwj5awebasebasebeawqebaqwebqwe";

export function checkPassword(req: express.Request, res: express.Response) {
  if (!config.PASSWORD || sha(req.query.pass) == config.PASSWORD) {
    res.cookie("pass", COOKIE, {
      maxAge: 365000000
    });
    res.sendStatus(200);
  }
  else res.sendStatus(401);
}

export function passwordHandler(req: express.Request, res: express.Response, next: express.NextFunction) {
  if (!config.PASSWORD || req.cookies.pass == COOKIE)
    next();
  else {
    res.status(401).send(`
  <html>

  <head>
    <meta name="viewport" content="width=device-width, initial-scale=1">
  </head>

  <body>
    <input type="text" id="pass" />
    <br>
    <button id="btn-send">Send</button>
    <p id="error"></p>

    <script>
      document
        .getElementById("btn-send")
        .addEventListener("click", async () => {
          const pass = document.getElementById("pass").value;

          try {
            const res = await fetch("/pass?pass=" + pass);

            if (res.status === 401) {
              document.getElementById("error").innerText = "No.";
            }
            else  window.location.reload();
          }
          catch(err) {
            
          }
        });
    </script>
  </body>
  
  </html>
  `)
  }
}