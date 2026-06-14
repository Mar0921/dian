-- First, just update the tipo column
UPDATE questions_public SET tipo = 'quick' WHERE tipo = 'multiple_choice';

-- Add correcta column to questions if not exists
ALTER TABLE questions ADD COLUMN IF NOT EXISTS correcta text;

-- Add temp column to extract correct answer
ALTER TABLE questions_public ADD COLUMN IF NOT EXISTS tmp_correcta text;

-- Extract correct answer from the JSON options
UPDATE questions_public 
SET tmp_correcta = (
  SELECT (opt->>'id') 
  FROM jsonb_array_elements(opciones) opt 
  WHERE (opt->>'correcta')::boolean = true
  LIMIT 1
);

-- Now transform options format from [{"id":"A","texto":"..."}] to {"A": "...", ...}
UPDATE questions_public 
SET opciones = (
  SELECT jsonb_object_agg((opt->>'id'), opt->>'texto')
  FROM jsonb_array_elements(opciones) opt
);

-- Insert into questions table with correct answer (using tmp_correcta)
INSERT INTO questions (id, pregunta, tipo, opciones, correcta, activa)
SELECT id, pregunta, tipo, opciones, tmp_correcta, activa
FROM questions_public
ON CONFLICT (id) DO UPDATE 
SET tipo = EXCLUDED.tipo,
    opciones = EXCLUDED.opciones,
    correcta = EXCLUDED.correcta;