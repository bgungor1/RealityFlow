import { IsEnum, IsMongoId, IsNotEmpty, IsNumber, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PropertyType } from '../../common/constants/property-types.js';

export class CreateTransactionDto {
    @ApiProperty({ 
        example: '123 Reality Blvd, Los Angeles, CA', 
        description: 'The full physical address of the property' 
    })
    @IsString()
    @IsNotEmpty()
    propertyAddress: string;

    @ApiProperty({ 
        enum: PropertyType, 
        example: PropertyType.SALE,
        description: 'Type of transaction: sale or rental' 
    })
    @IsEnum(PropertyType)
    propertyType: PropertyType;

    @ApiProperty({ 
        example: 50000, 
        description: 'The total service fee/commission pool to be distributed' 
    })
    @IsNumber()
    @Min(0)
    totalServiceFee: number;

    @ApiProperty({ 
        example: '6523a1b2c3d4e5f6a7b8c9d0', 
        description: 'The MongoDB ObjectId of the listing agent' 
    })
    @IsMongoId()
    @IsNotEmpty()
    listingAgentId: string;

    @ApiProperty({ 
        example: '6523a1b2c3d4e5f6a7b8c9d1', 
        description: 'The MongoDB ObjectId of the selling agent' 
    })
    @IsMongoId()
    @IsNotEmpty()
    sellingAgentId: string;
}
