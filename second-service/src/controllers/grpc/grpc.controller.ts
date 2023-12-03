import { Controller, Logger} from '@nestjs/common';

import { Metadata } from '@grpc/grpc-js';
import { Observable, of } from 'rxjs';
import { GrpcMethod } from '@nestjs/microservices';
import { hello } from '../../proto/hello';

@Controller()
export class GrpcController implements hello.HelloService {

  constructor(private readonly logger: Logger) {}
  
  @GrpcMethod('HelloService', 'SayHello')
  sayHello(data: hello.HelloRequest, metadata?: Metadata, ...rest: any[]): Observable<hello.HelloResponse> {
    this.logger.debug("Hello from GRPC controller");
    return of({msg: "Hello from GRPC controller"});
  }
  
}
