import express from "express";
import config, { IConfig } from "./config/index";
import Actor from "./types/actor";
import Image from "./types/image";
import Scene from "./types/scene";
import Label from "./types/label";

export default (req: express.Request, res: express.Response) => {

  const _config = JSON.parse(JSON.stringify(config)) as IConfig;
  _config.PASSWORD = "***********";

  res.send(`
    <html>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1">
      </head>
      <body>
        <h1>Debug</h1>
        <div>
          <h4>Config</h4>
          ${JSON.stringify(_config)}
          </div>
        <hr/>
        <div>
          <h4>Actors</h4>
          ${Actor.getAll().map(i => `<p>${JSON.stringify(i)}</p>`)}
        </div>
        <hr/>
        <div>
          <h4>Scenes</h4>
          ${Scene.getAll().map(i => `
          <p>${JSON.stringify(i)}
          <a href="/scene/${i.id}" target="_blank">View</a>
          </p>`)}
        </div>
        <hr/>
          <h4>Images</h4>
          ${Image.getAll().map(i => `
          <p>${JSON.stringify(i)}
          <a href="/image/${i.id}" target="_blank">View</a>
          </p>`)}
        </div>
        <div>
        <hr/>
        <div>
          <h4>Labels</h4>
          ${Label.getAll().map(i => `<p>${JSON.stringify(i)}</p>`)}
        </div>
      </body>
    </html>
  `);
}