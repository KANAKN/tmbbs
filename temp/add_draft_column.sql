-- Add is_draft column to Question table
ALTER TABLE public."Question" 
ADD COLUMN IF NOT EXISTS is_draft BOOLEAN DEFAULT FALSE;

-- Create index for better performance when filtering drafts
CREATE INDEX IF NOT EXISTS idx_question_is_draft ON public."Question" (is_draft);

-- Update existing questions to set is_draft to false
UPDATE public."Question" 
SET is_draft = FALSE 
WHERE is_draft IS NULL;

-- Grant necessary permissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public."Question" TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;
