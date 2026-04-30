import { Public } from '@common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';

const packageJson = require(process.cwd() + '/package.json');

@Controller()
export class AppController {

 @Public()
 @Get()
 getRoot() {
  return {
   name: packageJson.name,
   description: packageJson.description,
   version: packageJson.version,
   status: 'online',
  };
 }
}