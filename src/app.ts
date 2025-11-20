import express, { urlencoded } from "express"
import * as fs from 'fs';
import { flowerData } from "./constants/constantData";
import cors from "cors";
// import cookieParser from "cookie-parser";
const app=express()

app.use(urlencoded());
app.use(express.static("public"));
app.use(express.json({ limit: "16kb" }));
// app.use(cookieParser());

app.use(
  cors({
    origin: "*",
  })
);



app.get("/data",(req,res)=>{
    
    return res.send({flowerData}).status(200)
})

app.listen(8080,()=>{
    console.log("Server is listening at", 8080)
})