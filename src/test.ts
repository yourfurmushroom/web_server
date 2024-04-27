import * as fs from 'fs';
import WebSocket from 'ws';
import OpenAI from "openai";

export function ReadData(path: string): string {
  const data = fs.readFileSync(path, 'utf-8');
  return data;
}

// export async function OpenaiResponse(openai:OpenAI,messageList:any[]) {
  
//   const stream = await openai.chat.completions.create({
//     model: "gpt-4",
//     messages: messageList,
//     stream: true,
// });
// let string=""
// for await (const chunk of stream) {
//   // process.stdout.write(chunk.choices[0]?.delta?.content || "");
//   string+=chunk.choices[0]?.delta?.content||""
// }
// return string;
// }

export async function createAssistant(openai:OpenAI)
{
  let retrievalFile="file-X5pelSA08d9OnRO11sw8jIh5"
  
  let assistant=await openai.beta.assistants.create({
    name: "嘉義大學助理",
    instructions:"你是嘉義大學的客服助理，你會透過給予的資料檔案，並使用繁體中文回答特定問題，如果問題是資料檔案中不存在相關或相似的問題就直接回答不知道。",
    model:"gpt-4-turbo",
    tools: [{ type: "retrieval" }],
    file_ids:[retrievalFile]
  }).then(e=>{return e})
  
  await openai.beta.assistants.retrieve(assistant.id);
  return assistant.id
}

export async function createThread(openai:OpenAI)
{
  let thread=await openai.beta.threads.create().then(e=>{return e})
  return thread
}

export async function OpenaiResponse(openai:OpenAI,thread:any,assistantId:string,message:string) {
  console.log(message+" "+assistantId)
  let threadMessage=await openai.beta.threads.messages.create(
    thread.id,
    {role:"user",content:message}
  ) 
  let responseRun=await openai.beta.threads.runs.createAndPoll(thread.id,{assistant_id:assistantId})

  let retrievalRun=await openai.beta.threads.runs.retrieve(thread.id,responseRun.id)

  let response=await openai.beta.threads.messages.list(thread.id,{run_id:retrievalRun.id});

  const messages = response.data.pop()!;
if (messages.content[0].type === "text") {
  const { text } = messages.content[0];
  const { annotations } = text;
  const citations: string[] = [];

  let index = 0;
  for (let annotation of annotations) {
    text.value = text.value.replace(annotation.text, "[" + index + "]");
    const { file_citation } :any= annotation;
    if (file_citation) {
      const citedFile = await openai.files.retrieve(file_citation.file_id);
      citations.push("[" + index + "]" + citedFile.filename);
    }
    index++;
  }

  console.log(text.value);
  console.log(citations.join("\n"));
  return text.value
}
}

export function ConnectionToServer(port: number): WebSocket.Server {
  const wss = new WebSocket.Server({ port: 8888 });
  console.log("server start on 8888");
  return wss;
}

export class Message {
  type: string;
  item: string;
  constructor(_type: string, _item: string) {
    this.type = _type;
    this.item = _item;
  }

}

export class DataBase {
  db: any;

  constructor() {
    const mysql = require("mysql");
    const db_option = {
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'user',
      port: 3306
    }

    this.db = mysql.createConnection(db_option)

  }

  public CheckConnection(): any {
    this.db.connect((err: Error) => {
      if (err) {
        throw err;
      }
      return "db connected";
    })
  }

  public InsertData(question:string,response:string,uuid:string):void
  {
    this.db.query(`INSERT INTO questiontable VALUES("${uuid}",${question},"${response}",CURRENT_TIMESTAMP)`, (err: Error, result: object) => {
      if (err) {
        throw err;
      }
    })
  }


}
