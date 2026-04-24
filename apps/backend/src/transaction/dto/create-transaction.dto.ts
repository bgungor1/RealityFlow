import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { PropertyType } from '../../common/constants/property-types.js';

export class CreateTransactionDto {
    @IsString()
    @IsNotEmpty()
    propertyAddress: string;

    @IsEnum(PropertyType)
    propertyType: PropertyType;

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
