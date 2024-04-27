"use strict";
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
const test_1 = require("./test");
const test_2 = require("./test");
const openai_1 = __importDefault(require("openai"));
function WssListener(wss, db, openai, assistantId) {
    return __awaiter(this, void 0, void 0, function* () {
        wss.on('connection', (ws, req) => {
            console.log('New client connected');
            let thread;
            (0, test_1.createThread)(openai).then(e => { thread = e; console.log(JSON.stringify(e)); });
            let uuid = crypto.randomUUID();
            console.log(uuid);
            ws.send(JSON.stringify(new test_2.Message("connection", uuid.toString())));
            ws.on('message', (message) => {
                (0, test_1.OpenaiResponse)(openai, thread, assistantId, message.toString()).then(e => { ws.send(JSON.stringify(e)); });
            });
            ws.on('close', () => {
                ws.send(JSON.stringify(new test_2.Message("disconnect", "")));
            });
        });
    });
}
function getCookie(request) {
    var cookies = {};
    if (request.headers.cookie)
        request.headers.cookie.split(';').forEach(function (cookie) {
            console.log(cookie);
            var parts = cookie.match(/(.*?)=(.*)$/);
            var name = parts[1].trim();
            var value = (parts[2] || '').trim();
            cookies[name] = value;
        });
    return cookies;
}
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        let port = 8888;
        let path = "apikey.txt";
        const wss = (0, test_1.ConnectionToServer)(port);
        let data = (0, test_1.ReadData)(path);
        let db = new test_2.DataBase();
        let openaiConfig = {
            apiKey: data,
            organization: `org-1ADiTtpFEPLvchHK9eLiKi6k`,
            project: `Default Project`
        };
        const openai = new openai_1.default(openaiConfig);
        let assistantId = yield (0, test_1.createAssistant)(openai);
        console.log(assistantId);
        WssListener(wss, db, openai, assistantId);
    });
}
main();
