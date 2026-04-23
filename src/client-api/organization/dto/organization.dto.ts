import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ClientApiOrganizationDto {
  @ApiProperty({ example: 'uuid' })
  id: string;

  @ApiProperty({ example: 'My Organization' })
  name: string;

  @ApiPropertyOptional({ example: 'Organization description' })
  description?: string | null;

  @ApiPropertyOptional({ example: 'https://example.com/logo.png' })
  logo?: string | null;
}
