import { Types } from 'mongoose';
import { CommissionService } from '../commission.service.js';

describe('CommissionService', () => {
    let service: CommissionService;

    beforeEach(() => {
        service = new CommissionService();
    });

    const agentA = {
        id: new Types.ObjectId().toString(),
        fullName: 'Ali Yılmaz',
    };

    const agentB = {
        id: new Types.ObjectId().toString(),
        fullName: 'Ayşe Demir',
    };

    // ─── Scenario 1: Aynı agent (listing = selling) ───

    describe('Scenario 1 — Same agent (listing = selling)', () => {
        it('should give 50% to agency and 50% to the single agent', () => {
            const result = service.calculate({
                totalServiceFee: 100000,
                listingAgent: agentA,
                sellingAgent: agentA,
            });

            expect(result.totalPool).toBe(100000);
            expect(result.agencyAmount).toBe(50000);
            expect(result.agencyPercentage).toBe(50);
            expect(result.agentShares).toHaveLength(1);
            expect(result.agentShares[0].role).toBe('both');
            expect(result.agentShares[0].amount).toBe(50000);
            expect(result.agentShares[0].percentage).toBe(50);
            expect(result.agentShares[0].agentName).toBe('Ali Yılmaz');
            expect(result.calculatedAt).toBeInstanceOf(Date);
        });

        it('should set agentId as ObjectId matching the agent', () => {
            const result = service.calculate({
                totalServiceFee: 100000,
                listingAgent: agentA,
                sellingAgent: agentA,
            });

            expect(result.agentShares[0].agentId.toString()).toBe(agentA.id);
        });
    });

    // ─── Scenario 2: Farklı agentlar ───

    describe('Scenario 2 — Different agents', () => {
        it('should give 50% to agency, 25% to listing agent, 25% to selling agent', () => {
            const result = service.calculate({
                totalServiceFee: 100000,
                listingAgent: agentA,
                sellingAgent: agentB,
            });

            expect(result.totalPool).toBe(100000);
            expect(result.agencyAmount).toBe(50000);
            expect(result.agencyPercentage).toBe(50);
            expect(result.agentShares).toHaveLength(2);

            const listing = result.agentShares.find(s => s.role === 'listing');
            const selling = result.agentShares.find(s => s.role === 'selling');

            expect(listing).toBeDefined();
            expect(listing!.amount).toBe(25000);
            expect(listing!.percentage).toBe(25);
            expect(listing!.agentName).toBe('Ali Yılmaz');
            expect(listing!.agentId.toString()).toBe(agentA.id);

            expect(selling).toBeDefined();
            expect(selling!.amount).toBe(25000);
            expect(selling!.percentage).toBe(25);
            expect(selling!.agentName).toBe('Ayşe Demir');
            expect(selling!.agentId.toString()).toBe(agentB.id);
        });
    });

    // ─── Edge Cases ───

    describe('Edge cases', () => {
        it('should handle zero service fee correctly', () => {
            const result = service.calculate({
                totalServiceFee: 0,
                listingAgent: agentA,
                sellingAgent: agentB,
            });

            expect(result.totalPool).toBe(0);
            expect(result.agencyAmount).toBe(0);
            expect(result.agentShares[0].amount).toBe(0);
            expect(result.agentShares[1].amount).toBe(0);
        });

        it('should handle large service fee without precision loss', () => {
            const result = service.calculate({
                totalServiceFee: 1_000_000,
                listingAgent: agentA,
                sellingAgent: agentB,
            });

            expect(result.agencyAmount).toBe(500_000);
            expect(result.agentShares[0].amount).toBe(250_000);
            expect(result.agentShares[1].amount).toBe(250_000);

            const total = result.agencyAmount
                + result.agentShares.reduce((sum, s) => sum + s.amount, 0);
            expect(total).toBe(1_000_000);
        });

        it('should handle odd service fee (rounding)', () => {
            const result = service.calculate({
                totalServiceFee: 99999,
                listingAgent: agentA,
                sellingAgent: agentB,
            });

            const total = result.agencyAmount
                + result.agentShares.reduce((sum, s) => sum + s.amount, 0);
            expect(total).toBe(99999);
        });

        it('should always set calculatedAt to a Date', () => {
            const result = service.calculate({
                totalServiceFee: 50000,
                listingAgent: agentA,
                sellingAgent: agentA,
            });

            expect(result.calculatedAt).toBeInstanceOf(Date);
        });
    });
});
