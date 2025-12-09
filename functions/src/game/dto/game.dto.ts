import { IsString, IsArray, IsBoolean, IsEnum } from 'class-validator';
import { ScoreCategory } from '../game-engine';

export class JoinGameDto {
  @IsString()
  playerId!: string;

  @IsString()
  playerName!: string;
}

export class SetKeepStatusDto {
  @IsArray()
  @IsBoolean({ each: true })
  keepStatus!: boolean[];
}

export class SelectScoreDto {
  @IsEnum(ScoreCategory)
  category!: ScoreCategory;
}
