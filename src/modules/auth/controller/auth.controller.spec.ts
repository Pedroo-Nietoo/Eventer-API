import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { LoginUseCase } from '@auth/use-cases/login.usecase';
import { ValidateUserUseCase } from '@auth/use-cases/validate-user.usecase';
import { LogoutUseCase } from '@auth/use-cases/logout.usecase';

describe('AuthController', () => {
  let controller: AuthController;

  let mockLoginUseCase: Partial<LoginUseCase>;
  let mockLogoutUseCase: Partial<LogoutUseCase>;
  let mockValidateUserUseCase: Partial<ValidateUserUseCase>;

  beforeEach(async () => {
    mockLoginUseCase = {
      execute: jest.fn(),
    };

    mockLogoutUseCase = {
      execute: jest.fn(),
    };

    mockValidateUserUseCase = {
      execute: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: LoginUseCase,
          useValue: mockLoginUseCase,
        },
        {
          provide: LogoutUseCase,
          useValue: mockLogoutUseCase,
        },
        {
          provide: ValidateUserUseCase,
          useValue: mockValidateUserUseCase,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});