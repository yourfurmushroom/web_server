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
var __asyncValues = (this && this.__asyncValues) || function (o) {
    if (!Symbol.asyncIterator) throw new TypeError("Symbol.asyncIterator is not defined.");
    var m = o[Symbol.asyncIterator], i;
    return m ? m.call(o) : (o = typeof __values === "function" ? __values(o) : o[Symbol.iterator](), i = {}, verb("next"), verb("throw"), verb("return"), i[Symbol.asyncIterator] = function () { return this; }, i);
    function verb(n) { i[n] = o[n] && function (v) { return new Promise(function (resolve, reject) { v = o[n](v), settle(resolve, reject, v.done, v.value); }); }; }
    function settle(resolve, reject, d, v) { Promise.resolve(v).then(function(v) { resolve({ value: v, done: d }); }, reject); }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DataBase = exports.Message = exports.ConnectionToServer = exports.OpenaiResponse = exports.ReadData = void 0;
const fs = __importStar(require("fs"));
const ws_1 = __importDefault(require("ws"));
function ReadData(path) {
    const data = fs.readFileSync(path, 'utf-8');
    return data;
}
exports.ReadData = ReadData;
function OpenaiResponse(openai, message, messageList) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, e_1, _b, _c;
        var _d, _e;
        console.log(messageList[0].content);
        const stream = yield openai.chat.completions.create({
            model: "gpt-4",
            messages: messageList,
            stream: true,
        });
        let string = "";
        try {
            for (var _f = true, stream_1 = __asyncValues(stream), stream_1_1; stream_1_1 = yield stream_1.next(), _a = stream_1_1.done, !_a; _f = true) {
                _c = stream_1_1.value;
                _f = false;
                const chunk = _c;
                // process.stdout.write(chunk.choices[0]?.delta?.content || "");
                string += ((_e = (_d = chunk.choices[0]) === null || _d === void 0 ? void 0 : _d.delta) === null || _e === void 0 ? void 0 : _e.content) || "";
            }
        }
        catch (e_1_1) { e_1 = { error: e_1_1 }; }
        finally {
            try {
                if (!_f && !_a && (_b = stream_1.return)) yield _b.call(stream_1);
            }
            finally { if (e_1) throw e_1.error; }
        }
        return string;
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
