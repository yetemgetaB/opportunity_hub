import { Module } from '@nestjs/common';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { AssessmentsModule } from './assessments/assessments.module';
import { VoiceModule } from './voice/voice.module';

@Module({
  imports: [RecommendationsModule, AssessmentsModule, VoiceModule]
})
export class AppModule {}