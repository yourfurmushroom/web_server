import * as fs from 'fs';
import WebSocket from 'ws';
import OpenAI from "openai";

export function ReadData(path: string): string {
  const data = fs.readFileSync(path, 'utf-8');
  return data;
}

export async function OpenaiResponse(openai:OpenAI,message:string,messageList:any[]) {
  console.log(messageList[0].content)
  const stream = await openai.chat.completions.create({
    model: "gpt-4",
    messages: messageList,
    stream: true,
});
let string=""
for await (const chunk of stream) {
  // process.stdout.write(chunk.choices[0]?.delta?.content || "");
  string+=chunk.choices[0]?.delta?.content||""
}
return string;

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
