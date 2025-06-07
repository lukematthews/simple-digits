import { Test, TestingModule } from '@nestjs/testing';
import { MonthService } from './month.service';

describe('MonthService', () => {
  let service: MonthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MonthService],
    }).compile();

    service = module.get<MonthService>(MonthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
