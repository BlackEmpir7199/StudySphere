-- Add isAIMessage field to messages table
ALTER TABLE messages ADD COLUMN IF NOT EXISTS "isAIMessage" BOOLEAN DEFAULT false;
