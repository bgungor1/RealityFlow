import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { TransactionService } from '../transaction.service.js';
import { CommissionService } from '../commission.service.js';
import { TransactionStage } from '../../common/constants/stage-transitions.js';

describe('TransactionService', () => {
    let service: TransactionService;
    let commissionService: CommissionService;
    let mockTransactionModel: any;
    let mockConnection: any;
    let mockUserService: any;

    const agentAId = new Types.ObjectId();
    const agentBId = new Types.ObjectId();
    const transactionId = new Types.ObjectId();

    const mockAgentA = {
        _id: agentAId,
        fullName: 'Ali Yılmaz',
        email: 'ali@realityflow.com',
        role: 'agent',
    };

    const mockAgentB = {
        _id: agentBId,
        fullName: 'Ayşe Demir',
        email: 'ayse@realityflow.com',
        role: 'agent',
    };

    const createMockTransaction = (overrides: any = {}) => {
        const doc = {
            _id: transactionId,
            propertyAddress: 'Test Street 123',
            propertyType: 'sale',
            totalServiceFee: 100000,
            stage: TransactionStage.AGREEMENT,
            listingAgentId: agentAId,
            sellingAgentId: agentBId,
            listingAgent: mockAgentA,
            sellingAgent: mockAgentB,
            commission: null,
            stageHistory: [],
            save: jest.fn().mockResolvedValue(undefined),
            ...overrides,
        };
        return doc;
    };

    beforeEach(() => {
        commissionService = new CommissionService();

        mockUserService = {
            findById: jest.fn().mockImplementation((id: string) => {
                if (id === agentAId.toString()) return Promise.resolve(mockAgentA);
                if (id === agentBId.toString()) return Promise.resolve(mockAgentB);
                return Promise.reject(new NotFoundException(`User with id "${id}" not found`));
            }),
        };

        mockTransactionModel = {
            create: jest.fn(),
            find: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        sort: jest.fn().mockReturnValue({
                            exec: jest.fn().mockResolvedValue([]),
                        }),
                    }),
                }),
            }),
            findById: jest.fn().mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn(),
                    }),
                }),
            }),
        };

        const mockSession = {
            startTransaction: jest.fn(),
            commitTransaction: jest.fn().mockResolvedValue(undefined),
            abortTransaction: jest.fn().mockResolvedValue(undefined),
            endSession: jest.fn(),
        };

        mockConnection = {
            startSession: jest.fn().mockResolvedValue(mockSession),
        };

        service = new TransactionService(
            mockTransactionModel,
            mockConnection,
            commissionService,
            mockUserService,
        );
    });

    // ─── Stage Transition: Valid ───

    describe('Stage transitions — valid', () => {
        it('should transition from agreement to earnest_money', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.AGREEMENT });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            const result = await service.transitionStage(
                transactionId.toString(),
                TransactionStage.EARNEST_MONEY,
            );

            expect(tx.stage).toBe(TransactionStage.EARNEST_MONEY);
            expect(tx.stageHistory).toHaveLength(1);
            expect(tx.stageHistory[0].from).toBe(TransactionStage.AGREEMENT);
            expect(tx.stageHistory[0].to).toBe(TransactionStage.EARNEST_MONEY);
            expect(tx.save).toHaveBeenCalled();
        });

        it('should transition from earnest_money to title_deed', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.EARNEST_MONEY });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            const result = await service.transitionStage(
                transactionId.toString(),
                TransactionStage.TITLE_DEED,
            );

            expect(tx.stage).toBe(TransactionStage.TITLE_DEED);
            expect(tx.stageHistory).toHaveLength(1);
            expect(tx.save).toHaveBeenCalled();
        });

        it('should transition from title_deed to completed with commission calculation', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.TITLE_DEED });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await service.transitionStage(
                transactionId.toString(),
                TransactionStage.COMPLETED,
            );

            expect(tx.stage).toBe(TransactionStage.COMPLETED);
            expect(tx.commission).not.toBeNull();
            expect(tx.commission.agencyAmount).toBe(50000);
            expect(tx.commission.agencyPercentage).toBe(50);
            expect(tx.save).toHaveBeenCalled();
        });
    });

    // ─── Stage Transition: Invalid ───

    describe('Stage transitions — invalid', () => {
        it('should reject skipping stages (agreement → title_deed)', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.AGREEMENT });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await expect(
                service.transitionStage(transactionId.toString(), TransactionStage.TITLE_DEED),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject skipping to completed (agreement → completed)', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.AGREEMENT });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await expect(
                service.transitionStage(transactionId.toString(), TransactionStage.COMPLETED),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject backward transition (completed → agreement)', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.COMPLETED });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await expect(
                service.transitionStage(transactionId.toString(), TransactionStage.AGREEMENT),
            ).rejects.toThrow(BadRequestException);
        });

        it('should reject backward transition (earnest_money → agreement)', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.EARNEST_MONEY });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await expect(
                service.transitionStage(transactionId.toString(), TransactionStage.AGREEMENT),
            ).rejects.toThrow(BadRequestException);
        });
    });

    // ─── Idempotency ───

    describe('Idempotency', () => {
        it('should return current state when transitioning to the same stage', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.EARNEST_MONEY });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            const result = await service.transitionStage(
                transactionId.toString(),
                TransactionStage.EARNEST_MONEY,
            );

            expect(result.stage).toBe(TransactionStage.EARNEST_MONEY);
            expect(tx.save).not.toHaveBeenCalled();
            expect(tx.stageHistory).toHaveLength(0);
        });

        it('should not recalculate commission on already completed transaction', async () => {
            const existingCommission = {
                totalPool: 100000,
                agencyAmount: 50000,
                agencyPercentage: 50,
                agentShares: [],
                calculatedAt: new Date(),
            };

            const tx = createMockTransaction({
                stage: TransactionStage.COMPLETED,
                commission: existingCommission,
            });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            const result = await service.transitionStage(
                transactionId.toString(),
                TransactionStage.COMPLETED,
            );

            // İdempotency guard: aynı stage'deyse save çağrılmamalı
            expect(result.commission).toBe(existingCommission);
            expect(tx.save).not.toHaveBeenCalled();
        });
    });

    // ─── Commission at Completion ───

    describe('Commission at completion', () => {
        it('should calculate commission with same agent (Scenario 1)', async () => {
            const tx = createMockTransaction({
                stage: TransactionStage.TITLE_DEED,
                listingAgentId: agentAId,
                sellingAgentId: agentAId,
                listingAgent: mockAgentA,
                sellingAgent: mockAgentA,
            });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await service.transitionStage(
                transactionId.toString(),
                TransactionStage.COMPLETED,
            );

            expect(tx.commission).not.toBeNull();
            expect(tx.commission.agentShares).toHaveLength(1);
            expect(tx.commission.agentShares[0].role).toBe('both');
            expect(tx.commission.agentShares[0].amount).toBe(50000);
            expect(tx.commission.agentShares[0].percentage).toBe(50);
        });

        it('should calculate commission with different agents (Scenario 2)', async () => {
            const tx = createMockTransaction({
                stage: TransactionStage.TITLE_DEED,
                listingAgentId: agentAId,
                sellingAgentId: agentBId,
            });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await service.transitionStage(
                transactionId.toString(),
                TransactionStage.COMPLETED,
            );

            expect(tx.commission).not.toBeNull();
            expect(tx.commission.agentShares).toHaveLength(2);

            const listing = tx.commission.agentShares.find((s: any) => s.role === 'listing');
            const selling = tx.commission.agentShares.find((s: any) => s.role === 'selling');

            expect(listing.amount).toBe(25000);
            expect(listing.percentage).toBe(25);
            expect(selling.amount).toBe(25000);
            expect(selling.percentage).toBe(25);
        });

        it('should use MongoDB session for atomicity on completion', async () => {
            const tx = createMockTransaction({ stage: TransactionStage.TITLE_DEED });

            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(tx),
                    }),
                }),
            });

            await service.transitionStage(
                transactionId.toString(),
                TransactionStage.COMPLETED,
            );

            expect(mockConnection.startSession).toHaveBeenCalled();
            const session = await mockConnection.startSession();
            expect(session.startTransaction).toHaveBeenCalled();
        });
    });

    // ─── Not Found ───

    describe('Not found', () => {
        it('should throw NotFoundException for non-existent transaction', async () => {
            mockTransactionModel.findById.mockReturnValue({
                populate: jest.fn().mockReturnValue({
                    populate: jest.fn().mockReturnValue({
                        exec: jest.fn().mockResolvedValue(null),
                    }),
                }),
            });

            await expect(
                service.findById(new Types.ObjectId().toString()),
            ).rejects.toThrow(NotFoundException);
        });
    });
});
