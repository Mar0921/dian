-- Add sample main questions to questions_public with proper format
INSERT INTO questions_public (pregunta, tipo, opciones, activa) VALUES
('Documento que establece los mínimos de integridad que deben regir el actuar de la DIAN.','main','{"A":"Código de buen Gobierno","B":"Filosofía Dian","C":"Diccionario de Competencias Comportamentales","D":"Código de Integridad"}'::jsonb,true),
('Honestidad, respeto, compromiso, diligencia y justicia son para la DIAN:','main','{"A":"Cinco palabras","B":"Valores","C":"Temas de trabajo","D":"Riesgos"}'::jsonb,true),
('Se conoce como el compromiso sagrado de la DIAN:','main','{"A":"El respeto por la diferencia","B":"La atención diligente","C":"La transparencia en el servicio","D":"El recaudo de los recursos económicos del país"}'::jsonb,true)
ON CONFLICT DO NOTHING;

-- Add same questions to questions table with correct answer as letter
INSERT INTO questions (id, pregunta, tipo, opciones, correcta, activa) VALUES
((SELECT id FROM questions_public WHERE pregunta = 'Documento que establece los mínimos de integridad que deben regir el actuar de la DIAN.' LIMIT 1),'Documento que establece los mínimos de integridad que deben regir el actuar de la DIAN.','main','{"A":"Código de buen Gobierno","B":"Filosofía Dian","C":"Diccionario de Competencias Comportamentales","D":"Código de Integridad"}'::jsonb,'D',true),
((SELECT id FROM questions_public WHERE pregunta = 'Honestidad, respeto, compromiso, diligencia y justicia son para la DIAN:' LIMIT 1),'Honestidad, respeto, compromiso, diligencia y justicia son para la DIAN:','main','{"A":"Cinco palabras","B":"Valores","C":"Temas de trabajo","D":"Riesgos"}'::jsonb,'B',true),
((SELECT id FROM questions_public WHERE pregunta = 'Se conoce como el compromiso sagrado de la DIAN:' LIMIT 1),'Se conoce como el compromiso sagrado de la DIAN:','main','{"A":"El respeto por la diferencia","B":"La atención diligente","C":"La transparencia en el servicio","D":"El recaudo de los recursos económicos del país"}'::jsonb,'D',true)
ON CONFLICT DO NOTHING;