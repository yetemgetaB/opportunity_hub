import { Module } from '@nestjs/common';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AssessmentsModule } from './assessments/assessments.module';

@Module({
  imports: [RecommendationsModule, AssessmentsModule]
})
export class AppModule {}