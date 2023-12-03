import { Controller, Get, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientGrpc } from '@nestjs/microservices';
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';
import { hello } from './proto/hello';
import axios from 'axios';

@Controller()
export class AppController implements OnModuleInit{

  udfServiceClient!: hello.HelloService;


  constructor(
    @Inject("GRPC_CLIENT") private readonly clientGrpc: ClientGrpc,
    private readonly logger: Logger,
  ) {}
  
  onModuleInit() {
    this.udfServiceClient = this.clientGrpc.getService<hello.HelloService>("HelloService");
  }

  @Get('grpc')
  async getHelloGrpc(): Promise<string> {
    const res = await firstValueFrom(this.udfServiceClient.sayHello({
      msg: "Say Hello",
    }, new Metadata()))

    this.logger.debug("Something 1"); 
    this.logger.debug("Something 2"); 
    this.logger.debug("Something 3"); 
    this.logger.debug("Something 4"); 
    return res.msg;
  }

  @Get('http')
  async getHelloHttp() {
    console.log(process.env.SECOND_SERVICE_HTTP_URL);
    const response = await axios.get(`http://${process.env.SECOND_SERVICE_HTTP_URL || 'localhost:3001'}`);
    this.logger.debug("response from SECOND HTTP SERVICE");
    return await response.data;
  }
}
