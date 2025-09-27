import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateLogDto } from './dto/create-log.dto';
import { UpdateLogDto } from './dto/update-log.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Log } from './schemas/log.schema';
import { Model } from 'mongoose';
import { Tail } from "tail";
import { Server } from 'socket.io';

@Injectable()
export class LogsService implements OnModuleInit {
  private io: Server;

  constructor(@InjectModel(Log.name) private logModel: Model<Log>) {
    this.io = new Server(4000, { cors: { origin: '*' } });
  }

  async create(createLogDto: CreateLogDto): Promise<Log> {
    const createdLog = new this.logModel(createLogDto);
    return createdLog.save();
  }

  findAll() {
    return `This action returns all logs`;
  }

  findOne(id: number) {
    return `This action returns a #${id} log`;
  }

  update(id: number, updateLogDto: UpdateLogDto) {
    return `This action updates a #${id} log`;
  }

  remove(id: number) {
    return `This action removes a #${id} log`;
  }

  onModuleInit() {
    console.log('LogService đã được khởi tạo!');
    // const tail = new Tail("/var/log/suricata/eve.json");
    const tail = new Tail("F:\\do an\\eve.json", {
      useWatchFile: true, // tốt hơn cho Windows
      encoding: "utf-8",
    });
    this.io.on('connection', (s) => {
      console.log("user connected", s.id);
    })

    tail.on("line", (line: string) => {
      console.log("Có log mới:", line);
      try {
        const log = JSON.parse(line);
        // gửi log mới cho client qua socket.io
        this.io.emit("newLog", log);
      } catch (e) {
        console.error("JSON parse error:", e);
      }
    });

    tail.on("error", (err) => {
      console.error("Tail error:", err);
    });
  }

  //   async onModuleInit() {
  //   const file = '/var/log/suricata/eve.json'; // đường dẫn log Suricata
  //   const tail = new Tail(file);

  //   tail.on('line', async (line: string) => {
  //     try {
  //       const json = JSON.parse(line);

  //       const log = new this.logModel({
  //         event_type: json.event_type,
  //         src_ip: json.src_ip,
  //         dest_ip: json.dest_ip,
  //         protocol: json.proto,
  //         raw: json,
  //       });

  //       await log.save();
  //       console.log('Saved log:', json.event_type, json.src_ip, '->', json.dest_ip);
  //     } catch (err) {
  //       console.error('Parse error:', err);
  //     }
  //   });

  //   tail.on('error', (err) => {
  //     console.error('Tail error:', err);
  //   });

  //   console.log(`Started tailing ${file}`);
  // }
}
