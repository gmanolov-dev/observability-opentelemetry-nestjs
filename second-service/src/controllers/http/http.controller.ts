import { Controller, Get, Logger, OnModuleInit } from '@nestjs/common';

@Controller('/')
export class HttpController implements OnModuleInit{
    constructor(private readonly logger: Logger) {}
    
    
    onModuleInit() {
        setTimeout(() => {this.logger.debug("After 2 seconds")}, 2000);
    }

    @Get("/")
    get() {
        this.logger.debug("Hello from HTTP conroller");
        return "Hello from HTTP conroller";
    }
}
