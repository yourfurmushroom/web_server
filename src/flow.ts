import WebSocket from 'ws';
import { ReadData,ConnectionToServer,OpenaiResponse,createAssistant,createThread } from "./test";
import {Message,DataBase} from "./test"
import OpenAI from "openai";


async function WssListener(wss:WebSocket.Server,db:any,openai:OpenAI,assistantId:any)
{
  wss.on('connection', (ws: WebSocket,req) => {
    console.log('New client connected');
    let thread:any;
    createThread(openai).then(e=>{thread=e;console.log(JSON.stringify(e))})
    let uuid = crypto.randomUUID();
    console.log(uuid)
    ws.send(JSON.stringify(new Message("connection", uuid.toString())));

    ws.on('message', (message: string) => {
      OpenaiResponse(openai,thread,assistantId,message.toString()).then(e=>{ws.send(JSON.stringify(e))})
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
  let assistantId=await createAssistant(openai)
  console.log(assistantId)
  WssListener(wss,db,openai,assistantId);

  
  

  
  


}

main();