import { Public } from '@common/decorators/public.decorator';
import { Controller, Get } from '@nestjs/common';
import { readFileSync } from 'fs';
import { join } from 'path';
import { SwaggerAppController as Doc } from './app.swagger';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  name: string;
  description: string;
  version: string;
};

@Doc.Main()
@Controller()
export class AppController {
  @Public()
  @Get()
  @Doc.GetRoot()
  getRoot() {
    return {
      name: packageJson.name,
      description: packageJson.description,
      version: packageJson.version,
      status: 'online',
    };
  }
}
