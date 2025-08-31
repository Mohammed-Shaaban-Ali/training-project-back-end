import { Catch, ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, Injectable, Logger } from '@nestjs/common';


@Catch() // catch *everything*
@Injectable()
export class FailureResponseFilter implements ExceptionFilter {

  private readonly logger = new Logger(FailureResponseFilter.name);

  catch(exception: Error | HttpException, host: ArgumentsHost) {

    this.logger.error(exception?.message || 'Something went wrong', exception.stack);
    
    const executionContext = host.switchToHttp();
    const response = executionContext.getResponse();
    const request = executionContext.getRequest();

    const isHttpErr = exception instanceof HttpException;


    const status = isHttpErr ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const message = isHttpErr ? (exception as HttpException).getResponse() : 'Internal server error';

    response.status(status).json({
      success: false,
      message: typeof message === 'string' ? message : (message as any)?.message || message,
      statusCode: status,
    })

  }
}