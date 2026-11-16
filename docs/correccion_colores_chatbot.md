# Corrección de colores disponibles en el chatbot

**Estado: IMPLEMENTADO (nov 2026).** Esta es la solución que quedo en la base de datos y en el código.

## Problema

El chatbot no respondia "que colores tiene cada modelo" porque el RAG (`Backend/src/rag/index.ts`) **solo lee las columnas de la allowlist de `Vehiculos`** (`COLUMNAS_POR_TABLA` en `Backend/src/embeddings/index.ts`). Los colores vivian en la tabla N:M `Vehiculos_Colores`, que no entraba ni al `embedding` ni al contexto que se le pasa al modelo.

## Solucion implementada

Se **desnormalizaron** los colores dentro de `Vehiculos` en una columna derivada `Colores_Disponibles` (TEXT), mantenida por trigger, y se agrego a la allowlist.

### 1. Columna derivada + trigger (SQL)

```sql
-- Columna derivada
ALTER TABLE "Vehiculos"
  ADD COLUMN IF NOT EXISTS "Colores_Disponibles" TEXT;

-- Poblarla con los colores de la N:M (o el principal si no hay N:M)
UPDATE "Vehiculos" v
SET "Colores_Disponibles" = COALESCE(
      (SELECT string_agg(c."Color", ', ' ORDER BY c."Color")
         FROM "Vehiculos_Colores" vc
         JOIN "Colores" c ON c."id_color" = vc."id_color"
        WHERE vc."id_vehiculo" = v."id_vehiculo"),
      (SELECT c2."Color"
         FROM "Colores" c2
        WHERE c2."id_color" = v."id_color")
    );

-- Mantenerla sincronizada
CREATE OR REPLACE FUNCTION fn_vehiculos_colores_disponibles()
RETURNS TRIGGER AS $$
DECLARE
  vid INT := COALESCE(NEW."id_vehiculo", OLD."id_vehiculo");
BEGIN
  UPDATE "Vehiculos" v
     SET "Colores_Disponibles" = COALESCE(
           (SELECT string_agg(c."Color", ', ' ORDER BY c."Color")
              FROM "Vehiculos_Colores" vc
              JOIN "Colores" c ON c."id_color" = vc."id_color"
             WHERE vc."id_vehiculo" = v."id_vehiculo"),
           (SELECT c2."Color" FROM "Colores" c2 WHERE c2."id_color" = v."id_color")
         )
   WHERE v."id_vehiculo" = vid;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_vc_colores ON "Vehiculos_Colores";
CREATE TRIGGER trg_vc_colores
AFTER INSERT OR UPDATE OR DELETE ON "Vehiculos_Colores"
FOR EACH ROW EXECUTE FUNCTION fn_vehiculos_colores_disponibles();

DROP TRIGGER IF EXISTS trg_vehiculo_color_principal ON "Vehiculos";
CREATE TRIGGER trg_vehiculo_color_principal
AFTER UPDATE OF "id_color" ON "Vehiculos"
FOR EACH ROW EXECUTE FUNCTION fn_vehiculos_colores_disponibles();
```

### 2. Cambios de codigo

- `Backend/src/embeddings/index.ts` -> agregar `'Colores_Disponibles'` al array `Vehiculos` de `COLUMNAS_POR_TABLA`.
- `Backend/src/rag/index.ts` -> agregar `Colores_Disponibles: 'Colores disponibles'` en `ETIQUETAS.Vehiculos`.

### 3. Regenerar los embeddings

```sql
UPDATE "Vehiculos" SET "embedding" = NULL;
```

Desde `Backend/`:

```powershell
$env:PGPASSWORD='123456'; npx ts-node scripts/vectorizar_datos.ts
```

### 4. Verificar los colores por modelo

```sql
SELECT "id_vehiculo", "Nombre_Modelo", "Colores_Disponibles"
FROM "Vehiculos" ORDER BY "id_vehiculo";
```

Resultado esperado (verificado nov 2026): `TROOPER -> 'Azul, Rojo'` y cada modelo con su color. Los 6 vehiculos quedan vectorizados (6/6).

## Nota importante

El trigger actualiza el **texto** pero **no re-vectoriza** (no se puede llamar a Gemini desde un trigger). Si cambian los colores por `/api/vehiculos-colores`, el `embedding` de ese vehiculo queda desactualizado hasta poner su `embedding` en `NULL` y volver a correr el vectorizador. Pendiente: automatizar esa re-vectorizacion en el controlador de `Vehiculos_Colores`.

## Anexo: codigo de reserva (tema aparte, sin relacion con colores)

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
