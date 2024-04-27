import WebSocket from 'ws';
import { ReadData,ConnectionToServer,OpenaiResponse } from "./test";
import {Message,DataBase} from "./test"
import OpenAI from "openai";


async function WssListener(wss:WebSocket.Server,db:any,openai:OpenAI)
{
  wss.on('connection', (ws: WebSocket,req) => {
    console.log('New client connected');
    console.log(getCookie(req).name)
    
    let uuid = crypto.randomUUID();
    console.log(uuid)
    ws.send(JSON.stringify(new Message("connection", uuid.toString())));
    const messageList:object[]=[]

    ws.on('message', (message: string) => {
      messageList.push({role:"user",content:message.toString()})
      OpenaiResponse(openai,message,messageList).then((response:string)=>{
        console.log(response)
        messageList.push({role:"system",content:response.toString()})
        db.InsertData(message,response,uuid);
        ws.send(response);
      });
    });

    ws.on('close', () => {
      ws.send(JSON.stringify(new Message("disconnect", "")))
    });
  });
}

function getCookie(request:any)
{
  var cookies:any = {};
  if(request.headers.cookie) request.headers.cookie.split(';').forEach(function(cookie:any)
    {
      console.log(cookie)
      var parts = cookie.match(/(.*?)=(.*)$/);
      var name = parts[1].trim();
      var value = (parts[2] || '').trim();
      cookies[ name ] = value;
    });
  return cookies
}

async function main() 
{
  let port=8888;
  let path="apikey.txt"
  const wss=ConnectionToServer(port)
  let data = ReadData(path);
  
  let db = new DataBase();
  
  let openaiConfig=
  {
    apiKey:data,
    organization:`org-1ADiTtpFEPLvchHK9eLiKi6k`,
    project:`Default Project`
  }
  const openai=new OpenAI(openaiConfig);
  WssListener(wss,db,openai);
  


}

main();