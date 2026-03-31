import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { OllamaModule } from '../ollama/ollama.module';
import { DocumentModule } from '../document/document.module';

@Module({
  imports: [OllamaModule, DocumentModule],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}