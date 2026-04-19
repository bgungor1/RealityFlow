import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    propertyAddress: string;

    @IsEnum(['sale', 'rental'])
    propertyType: string;

    @IsNumber()
    @Min(0)
    totalServiceFee: number;

    @IsMongoId()
    @IsNotEmpty()
    listingAgentId: string;

    @IsMongoId()
    @IsNotEmpty()
    sellingAgentId: string;
}
