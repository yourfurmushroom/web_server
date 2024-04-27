"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = exports.Message = exports.ConnectionToServer = exports.OpenaiResponse = exports.createThread = exports.createAssistant = exports.ReadData = void 0;
const fs = __importStar(require("fs"));
const ws_1 = __importDefault(require("ws"));
function ReadData(path) {
    const data = fs.readFileSync(path, 'utf-8');
    return data;
}
exports.ReadData = ReadData;
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
function createAssistant(openai) {
    return __awaiter(this, void 0, void 0, function* () {
        let retrievalFile = "file-X5pelSA08d9OnRO11sw8jIh5";
        let assistant = yield openai.beta.assistants.create({
            name: "嘉義大學助理",
            instructions: "你是嘉義大學的客服助理，你會透過給予的資料檔案，並使用繁體中文回答特定問題，如果問題是資料檔案中不存在相關或相似的問題就直接回答不知道。",
            model: "gpt-4-turbo",
            tools: [{ type: "retrieval" }],
            file_ids: [retrievalFile]
        }).then(e => { return e; });
        yield openai.beta.assistants.retrieve(assistant.id);
        return assistant.id;
    });
}
exports.createAssistant = createAssistant;
function createThread(openai) {
    return __awaiter(this, void 0, void 0, function* () {
        let thread = yield openai.beta.threads.create().then(e => { return e; });
        return thread;
    });
}
exports.createThread = createThread;
function OpenaiResponse(openai, thread, assistantId, message) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(message + " " + assistantId);
        let threadMessage = yield openai.beta.threads.messages.create(thread.id, { role: "user", content: message });
        let responseRun = yield openai.beta.threads.runs.createAndPoll(thread.id, { assistant_id: assistantId });
        let retrievalRun = yield openai.beta.threads.runs.retrieve(thread.id, responseRun.id);
        let response = yield openai.beta.threads.messages.list(thread.id, { run_id: retrievalRun.id });
        const messages = response.data.pop();
        if (messages.content[0].type === "text") {
            const { text } = messages.content[0];
            const { annotations } = text;
            const citations = [];
            let index = 0;
            for (let annotation of annotations) {
                text.value = text.value.replace(annotation.text, "[" + index + "]");
                const { file_citation } = annotation;
                if (file_citation) {
                    const citedFile = yield openai.files.retrieve(file_citation.file_id);
                    citations.push("[" + index + "]" + citedFile.filename);
                }
                index++;
            }
            console.log(text.value);
            console.log(citations.join("\n"));
            return text.value;
        }
    });
}
exports.OpenaiResponse = OpenaiResponse;
function ConnectionToServer(port) {
    const wss = new ws_1.default.Server({ port: 8888 });
    console.log("server start on 8888");
    return wss;
}
exports.ConnectionToServer = ConnectionToServer;
class Message {
    constructor(_type, _item) {
        this.type = _type;
        this.item = _item;
    }
}
exports.Message = Message;
class DataBase {
    constructor() {
        const mysql = require("mysql");
        const db_option = {
            host: 'localhost',
            user: 'root',
            password: 'root',
            database: 'user',
            port: 3306
        };
        this.db = mysql.createConnection(db_option);
    }
    CheckConnection() {
        this.db.connect((err) => {
            if (err) {
                throw err;
            }
            return "db connected";
        });
    }
    InsertData(question, response, uuid) {
        this.db.query(`INSERT INTO questiontable VALUES("${uuid}",${question},"${response}",CURRENT_TIMESTAMP)`, (err, result) => {
            if (err) {
                throw err;
            }
        });
    }
}
exports.DataBase = DataBase;
