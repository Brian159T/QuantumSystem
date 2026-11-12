# Corrección de colores disponibles en el chatbot

Estas sentencias corrigen las relaciones entre vehículos y colores, y marcan los embeddings de vehículos para que puedan regenerarse.

## 1. Registrar el color principal de cada vehículo

```sql
BEGIN;

INSERT INTO "Vehiculos_Colores" ("id_vehiculo", "id_color")
SELECT v."id_vehiculo", v."id_color"
FROM "Vehiculos" v
WHERE v."id_color" IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM "Vehiculos_Colores" vc
    WHERE vc."id_vehiculo" = v."id_vehiculo"
      AND vc."id_color" = v."id_color"
  );

UPDATE "Vehiculos" SET "embedding" = NULL;

COMMIT;
```

## 2. Verificar los colores por modelo

```sql
SELECT v."id_vehiculo", v."Nombre_Modelo",
  COALESCE(STRING_AGG(c."Color", ', ' ORDER BY c."Color"), 'Sin colores registrados')
    AS colores_disponibles
FROM "Vehiculos" v
LEFT JOIN "Vehiculos_Colores" vc ON vc."id_vehiculo" = v."id_vehiculo"
LEFT JOIN "Colores" c ON c."id_color" = vc."id_color"
GROUP BY v."id_vehiculo", v."Nombre_Modelo"
ORDER BY v."id_vehiculo";
```

## 3. Regenerar los embeddings

Desde `Backend/`:

```powershell
npx ts-node scripts/vectorizar_datos.ts
```

## 4. Crear el código de reserva

```sql
ALTER TABLE "Reservas"
ADD COLUMN IF NOT EXISTS "codigo_reserva" VARCHAR(20);

UPDATE "Reservas"
SET "codigo_reserva" = 'VT-' || LPAD("id_reserva"::text, 6, '0')
WHERE "codigo_reserva" IS NULL;

ALTER TABLE "Reservas"
ALTER COLUMN "codigo_reserva" SET NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'Reservas_codigo_reserva_key'
  ) THEN
    ALTER TABLE "Reservas"
    ADD CONSTRAINT "Reservas_codigo_reserva_key"
    UNIQUE ("codigo_reserva");
  END IF;
END $$;
```

El backend debe enviar un valor para `codigo_reserva` al crear nuevas reservas, o generar el mismo formato (`VT-000001`, `VT-000002`, etc.) antes de insertar.

## Nota importante

El vectorizador debe incluir `colores_disponibles` en el texto enviado a Gemini, por ejemplo:

```text
Nombre_Modelo:KAIYI EQUTE Tipo:Auto Colores disponibles:Blanco, Rojo, Azul
```

SQL corrige las relaciones y fuerza la regeneración, pero el chatbot solo responderá sobre colores si ese campo se incorpora al texto del embedding o al contexto enviado al modelo.
