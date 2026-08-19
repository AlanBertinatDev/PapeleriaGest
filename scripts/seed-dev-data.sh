#!/usr/bin/env bash
#
# Carga datos de prueba persistentes en la base de dev (productos, ofertas, un curso
# con docente y material, y pedidos en distintos estados) para poder abrir el frontend
# y ver algo de inmediato en cualquier PC, sin depender de haber cargado datos a mano
# antes. Pensado para correrse contra una base limpia (recién migrada) o una que ya
# tenga estos mismos datos de un run anterior — es seguro volver a correrlo.
#
# Requisitos: backend corriendo en localhost:8080, contenedor de Postgres
# "papeleriagest-postgres-1" levantado (DB_PORT=5433), y `python3` disponible.
#
# Uso: ./scripts/seed-dev-data.sh

set -euo pipefail

BASE_URL="http://localhost:8080"
DB_CONTAINER="papeleriagest-postgres-1"
DB_USER="papeleriagest"
DB_NAME="papeleriagest"

# --- Credenciales fijas de las cuentas de prueba ---------------------------------
ADMIN_EMAIL="admin@papeleria.dev"
ADMIN_PASS="Admin1234!"
CLIENTE_EMAIL="cliente@papeleria.dev"
CLIENTE_PASS="Cliente1234!"
DOCENTE_EMAIL="docente@papeleria.dev"
DOCENTE_PASS="Docente1234!"

psql_c() {
  docker exec -i "$DB_CONTAINER" psql -U "$DB_USER" -d "$DB_NAME" -tA -c "$1"
}

json_get() {
  # json_get '<json>' campo -> valor del campo top-level
  python3 -c "import sys,json; print(json.loads(sys.stdin.read()).get('$1',''))"
}

echo "== Verificando que el backend responda en $BASE_URL =="
if ! curl -s -o /dev/null -w '' "$BASE_URL/api/ofertas"; then
  echo "No se pudo conectar a $BASE_URL. Levantá el backend (DB_PORT=5433 ./mvnw spring-boot:run) y reintentá." >&2
  exit 1
fi

register_si_falta() {
  local nombre="$1" email="$2" cedula="$3" password="$4"
  local existe
  existe=$(psql_c "SELECT id FROM usuario WHERE email='$email';")
  if [ -z "$existe" ]; then
    curl -s -X POST "$BASE_URL/api/auth/register" -H "Content-Type: application/json" \
      -d "{\"nombre\":\"$nombre\",\"email\":\"$email\",\"cedula\":\"$cedula\",\"telefono\":\"099000000\",\"password\":\"$password\"}" \
      >/dev/null
    echo "  creada cuenta $email"
  else
    echo "  ya existía $email"
  fi
}

echo "== Usuarios de prueba =="
register_si_falta "Admin Dev" "$ADMIN_EMAIL" "90000001" "$ADMIN_PASS"
register_si_falta "Cliente Dev" "$CLIENTE_EMAIL" "90000002" "$CLIENTE_PASS"
register_si_falta "Docente Dev" "$DOCENTE_EMAIL" "90000003" "$DOCENTE_PASS"

# nivel_id: 1=Administrador, 2=Estandar, 3=Docente (ver tabla `nivel`)
psql_c "UPDATE usuario SET nivel_id=1 WHERE email='$ADMIN_EMAIL';" >/dev/null
psql_c "UPDATE usuario SET nivel_id=2 WHERE email='$CLIENTE_EMAIL';" >/dev/null
psql_c "UPDATE usuario SET nivel_id=3 WHERE email='$DOCENTE_EMAIL';" >/dev/null

ADMIN_TOKEN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASS\"}" | json_get token)
CLIENTE_LOGIN=$(curl -s -X POST "$BASE_URL/api/auth/login" -H "Content-Type: application/json" \
  -d "{\"email\":\"$CLIENTE_EMAIL\",\"password\":\"$CLIENTE_PASS\"}")
CLIENTE_TOKEN=$(echo "$CLIENTE_LOGIN" | json_get token)
DOCENTE_ID=$(psql_c "SELECT id FROM usuario WHERE email='$DOCENTE_EMAIL';")

auth_admin=(-H "Authorization: Bearer $ADMIN_TOKEN" -H "Content-Type: application/json")
auth_cliente=(-H "Authorization: Bearer $CLIENTE_TOKEN" -H "Content-Type: application/json")

echo "== Categoría y marca =="
CATEGORIA_ID=$(psql_c "SELECT id FROM categoria_producto WHERE nombre='Papelería';")
if [ -z "$CATEGORIA_ID" ]; then
  curl -s -X POST "$BASE_URL/api/categorias" "${auth_admin[@]}" -d '{"nombre":"Papelería","porcentaje":22}' >/dev/null
  CATEGORIA_ID=$(psql_c "SELECT id FROM categoria_producto WHERE nombre='Papelería';")
fi

MARCA_ID=$(psql_c "SELECT id FROM marca WHERE nombre='Genérica';")
if [ -z "$MARCA_ID" ]; then
  curl -s -X POST "$BASE_URL/api/marcas" "${auth_admin[@]}" -d '{"nombre":"Genérica"}' >/dev/null
  MARCA_ID=$(psql_c "SELECT id FROM marca WHERE nombre='Genérica';")
fi

echo "== Productos =="
crear_producto_si_falta() {
  local codigo="$1" nombre="$2" precioVenta="$3" precioCompra="$4" cantidad="$5"
  local existe
  existe=$(psql_c "SELECT codigo_producto FROM producto WHERE codigo_producto=$codigo;")
  if [ -z "$existe" ]; then
    curl -s -X POST "$BASE_URL/api/productos" "${auth_admin[@]}" -d "{
      \"codigoProducto\":$codigo,\"nombre\":\"$nombre\",\"precioVenta\":$precioVenta,
      \"precioCompra\":$precioCompra,\"categoriaId\":$CATEGORIA_ID,\"marcaId\":$MARCA_ID,
      \"cantidad\":$cantidad,\"stockMinimo\":5}" >/dev/null
    echo "  creado producto $codigo ($nombre)"
  fi
}
crear_producto_si_falta 9001 "Cuaderno 100 hojas" 300 220 60
crear_producto_si_falta 9002 "Lapicera Bic azul" 90 50 200
crear_producto_si_falta 9003 "Resma A4" 950 700 40
crear_producto_si_falta 9004 "Marcador fluorescente" 150 100 3   # stock bajo, a propósito
crear_producto_si_falta 9005 "Cartuchera escolar" 1200 900 0    # sin stock, a propósito

echo "== Oferta vigente (pack) =="
OFERTA_ID=$(psql_c "SELECT id FROM oferta WHERE titulo='Pack vuelta a clases';")
if [ -z "$OFERTA_ID" ]; then
  curl -s -X POST "$BASE_URL/api/ofertas" "${auth_admin[@]}" -d '{
    "titulo":"Pack vuelta a clases","descripcion":"Cuaderno + lapicera + resma",
    "precio":1100,"fechaDesde":"2026-07-01","fechaHasta":"2026-12-31",
    "tipo":"PACK","productoIds":[9001,9002,9003],
    "notificarPorCorreo":false,"audienciaNotificacion":null,"destacarHome":false}' >/dev/null
  echo "  creada oferta pack"
fi

echo "== Curso, docente asignado y material =="
CURSO_ID=$(psql_c "SELECT id FROM curso WHERE grado='5' AND grupo='A';")
if [ -z "$CURSO_ID" ]; then
  curl -s -X POST "$BASE_URL/api/cursos" "${auth_admin[@]}" -d '{"grado":"5","grupo":"A"}' >/dev/null
  CURSO_ID=$(psql_c "SELECT id FROM curso WHERE grado='5' AND grupo='A';")
fi

ASIGNACION=$(psql_c "SELECT id FROM materia_curso_docente WHERE curso_id=$CURSO_ID AND docente_id=$DOCENTE_ID;")
if [ -z "$ASIGNACION" ]; then
  curl -s -X POST "$BASE_URL/api/cursos/$CURSO_ID/docentes" "${auth_admin[@]}" \
    -d "{\"docenteId\":$DOCENTE_ID,\"materia\":\"Matemática\"}" >/dev/null
  echo "  docente asignado a 5°A - Matemática"
fi

psql_c "INSERT INTO curso_estudiante (curso_id, estudiante_id)
        SELECT $CURSO_ID, id FROM usuario WHERE email='$CLIENTE_EMAIL'
        ON CONFLICT DO NOTHING;" >/dev/null

echo "== Pedidos del cliente (solo si todavía no tiene ninguno) =="
CLIENTE_ID=$(echo "$CLIENTE_LOGIN" | python3 -c "import sys,json; print(json.loads(sys.stdin.read())['usuario']['id'])")
PEDIDOS_EXISTENTES=$(psql_c "SELECT count(*) FROM pedido WHERE usuario_id=$CLIENTE_ID;")

if [ "$PEDIDOS_EXISTENTES" = "0" ]; then
  crear_pedido() {
    curl -s -X POST "$BASE_URL/api/pedidos" "${auth_cliente[@]}" -d "$1" | json_get id
  }

  P1=$(crear_pedido '{"esEnvio":false,"direccion":null,"descripcion":"Retiro pendiente","items":[{"productoId":9001,"cantidad":2}]}')
  P2=$(crear_pedido '{"esEnvio":false,"direccion":null,"descripcion":"Pedido listo para retirar","items":[{"productoId":9002,"cantidad":3}]}')
  P3=$(crear_pedido '{"esEnvio":true,"direccion":"Calle Falsa 123","descripcion":"Entregado con envío a domicilio","items":[{"productoId":9003,"cantidad":1}]}')
  P4=$(crear_pedido '{"esEnvio":false,"direccion":null,"descripcion":"Cancelado por el cliente","items":[{"productoId":9004,"cantidad":1}]}')
  P5=$(crear_pedido '{"esEnvio":false,"direccion":null,"descripcion":"En revisión: falta stock de un color","items":[{"productoId":9002,"cantidad":1}]}')

  curl -s -X PUT "$BASE_URL/api/pedidos/$P2/estado" "${auth_admin[@]}" -d '{"estado":"LISTO"}' >/dev/null

  curl -s -X PUT "$BASE_URL/api/pedidos/$P3/estado" "${auth_admin[@]}" -d '{"estado":"LISTO"}' >/dev/null
  curl -s -X PUT "$BASE_URL/api/pedidos/$P3/estado" "${auth_admin[@]}" -d '{"estado":"ENTREGADO"}' >/dev/null

  curl -s -X PUT "$BASE_URL/api/pedidos/$P4/cancelar" "${auth_cliente[@]}" >/dev/null

  curl -s -X PUT "$BASE_URL/api/pedidos/$P5/en-revision" "${auth_admin[@]}" \
    -d '{"motivo":"Nos quedamos sin uno de los colores, te contactamos para coordinar"}' >/dev/null

  echo "  creados pedidos #$P1 (pendiente), #$P2 (listo), #$P3 (entregado), #$P4 (cancelado), #$P5 (en revisión)"
else
  echo "  el cliente ya tiene $PEDIDOS_EXISTENTES pedidos, no se agregan más"
fi

cat <<EOF

========================================================================
 Datos de prueba listos. Credenciales (fijas, seguí usando las mismas):

   Admin:    $ADMIN_EMAIL   / $ADMIN_PASS
   Cliente:  $CLIENTE_EMAIL / $CLIENTE_PASS
   Docente:  $DOCENTE_EMAIL / $DOCENTE_PASS

 Frontend: http://localhost:5175   Backend: http://localhost:8080
========================================================================
EOF
