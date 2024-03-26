import qr from "qr-image";
import fs from "fs";
import express from "express";
import { dirname } from "path";
import { fileURLToPath } from "url";
import bodyParser from "body-parser";

const __dirname = dirname(fileURLToPath(import.meta.url));

const app=express();
const port =3000;
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/index.html");
});

app.post("/check", (req, res) => {
 console.log(req.body)
 const url =req.body.url;
 console.log(url)
 var qr_svg = qr.image(url);
 qr_svg.pipe(fs.createWriteStream("public/images/qr_img.png"));
  console.log("The file has been saved!");
  res.sendFile(__dirname + "/public/page2.html");


});

  app.listen(port,() =>{
    console.log(`Listening to port${port} `)
  });
