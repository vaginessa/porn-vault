import express from "express";
import { getConfig } from "./config";
const sha = require("js-sha512").sha512;

export function checkPassword(req: express.Request, res: express.Response) {
  if (!req.query.password) return res.sendStatus(400);

  if (
    !getConfig().PASSWORD ||
    sha(req.query.password) == getConfig().PASSWORD
  ) {
    return res.json("");
  }

  res.sendStatus(401);
}

export function passwordHandler(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  if (!getConfig().PASSWORD) return next();

  if (
    req.headers["x-pass"] &&
    sha(req.headers["x-pass"]) == getConfig().PASSWORD
  )
    return next();

  if (req.query.password && sha(req.query.password) == getConfig().PASSWORD)
    return next();

  res.status(401).send(`
    <html>
      <body>
        <input id="pass" type="password" />
        <button id="send">Send</button>
        <p id="error"></p>

        <script>
        document.getElementById("error").innerText = "";

        
        document.getElementById("send").addEventListener("click", () => {
          const pw = document.getElementById("pass").value;
          
          fetch("/password?password=" + pw)
          .then(res => {
            if (res.status != 200) {
              return document.getElementById("error").innerText = res.status;
            }

            res.json()
              .then(json => {
                console.log(json);
                localStorage.setItem("password", pw);
                window.location = window.location + "?password=" + pw;
              })
          })
        })
        </script>
      </body>
    </html>
  `);
}
