import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { DashboardService } from '../dashboard.service.js';
import { Transaction } from '../../transaction/schemas/transaction.schema.js';
import { TransactionStage } from '../../common/constants/stage-transitions.js';

describe('DashboardService', () => {
  let service: DashboardService;
  let mockTransactionModel: any;

  beforeEach(async () => {
    mockTransactionModel = {
      aggregate: jest.fn(),
      find: jest.fn().mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([]),
              }),
              exec: jest.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DashboardService,
        {
          provide: getModelToken(Transaction.name),
          useValue: mockTransactionModel,
        },
      ],
    }).compile();

    service = module.get<DashboardService>(DashboardService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getDashboard', () => {
    it('should return empty metrics when no data is found', async () => {
      // Mock aggregation to return empty arrays
      mockTransactionModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
          totalCount: [],
          byStage: [],
          revenue: [],
          topAgents: []
        }])
      });

      const result = await service.getDashboard();

      expect(result.totalTransactions).toBe(0);
      expect(result.totalRevenue).toBe(0);
      expect(result.agencyRevenue).toBe(0);
      expect(result.topAgents).toEqual([]);
      
      // Ensure all stages are present with 0
      Object.values(TransactionStage).forEach(stage => {
        expect(result.byStage[stage]).toBe(0);
      });
    });

    it('should correctly map aggregation results to dashboard metrics', async () => {
      const mockAggResult = [{
        totalCount: [{ count: 10 }],
        byStage: [
          { _id: TransactionStage.AGREEMENT, count: 6 },
          { _id: TransactionStage.COMPLETED, count: 4 }
        ],
        revenue: [{ totalRevenue: 100000, agencyRevenue: 50000 }],
        topAgents: [
          { agentName: 'Ali Yılmaz', totalEarnings: 30000, transactionCount: 2 }
        ]
      }];

      mockTransactionModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue(mockAggResult)
      });

      const result = await service.getDashboard();

      expect(result.totalTransactions).toBe(10);
      expect(result.totalRevenue).toBe(100000);
      expect(result.agencyRevenue).toBe(50000);
      expect(result.byStage[TransactionStage.AGREEMENT]).toBe(6);
      expect(result.byStage[TransactionStage.COMPLETED]).toBe(4);
      expect(result.byStage[TransactionStage.EARNEST_MONEY]).toBe(0); // Default value
      expect(result.topAgents).toHaveLength(1);
      expect(result.topAgents[0].agentName).toBe('Ali Yılmaz');
    });

    it('should populate recent and all transactions', async () => {
      mockTransactionModel.aggregate.mockReturnValue({
        exec: jest.fn().mockResolvedValue([{
          totalCount: [], byStage: [], revenue: [], topAgents: []
        }])
      });

      const mockTx = { _id: '123', propertyAddress: 'Test' };
      
      // Mock the find chain
      mockTransactionModel.find.mockReturnValue({
        populate: jest.fn().mockReturnValue({
          populate: jest.fn().mockReturnValue({
            sort: jest.fn().mockReturnValue({
              limit: jest.fn().mockReturnValue({
                exec: jest.fn().mockResolvedValue([mockTx]), // for recentTransactions
              }),
              exec: jest.fn().mockResolvedValue([mockTx]), // for allTransactions
            }),
          }),
        }),
      });

      const result = await service.getDashboard();
      
      expect(result.recentTransactions).toHaveLength(1);
      expect(result.allTransactions).toHaveLength(1);
      expect(result.recentTransactions[0].propertyAddress).toBe('Test');
    });
  });
});
