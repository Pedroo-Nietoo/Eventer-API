import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { readFileSync } from 'fs';
import { join } from 'path';

const packageJsonPath = join(process.cwd(), 'package.json');
const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf8')) as {
  name: string;
  description: string;
  version: string;
};

describe('AppController', () => {
  let controller: AppController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
    }).compile();

    controller = module.get<AppController>(AppController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getRoot', () => {
    it('deve retornar as informações corretas da API e o status online', () => {
      const result = controller.getRoot();

      expect(result).toEqual({
        name: packageJson.name,
        description: packageJson.description,
        version: packageJson.version,
        status: 'online',
      });
    });

    it('deve conter a estrutura exata de chaves', () => {
      const result = controller.getRoot();

      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('description');
      expect(result).toHaveProperty('version');
      expect(result).toHaveProperty('status', 'online');
    });
  });
});