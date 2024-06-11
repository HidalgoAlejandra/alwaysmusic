//npm init --yes
//npm i pg

//requerir al programa pg
const { Pool } = require("pg");

const config = {
  host: "localhost",
  database: "always",
  user: "postgres",
  password: "postgres",
  port: 5432,
};

const pool = new Pool(config);

// funcion para capturar errores
const manejoerror = (err, pool, tabla) => {
  switch (err.code) {
    case "28P01":
      console.log(
        "autentificacion password falló o no existe usuario: " +
          pool.options.user
      );
      break;
    case "42P01":
      console.log("No existe la tabla [" + tabla + "] consultada");
      break;
    case "3D000":
      console.log("Base de Datos [" + pool.options.database + "] no existe");
      break;
    case "ENOTFOUND":
      console.log(
        "Error en valor usado como localhost: " + pool.options.localhost
      );
      break;
    case "ECONNREFUSED":
      console.log(
        "Error en el puerto de conexion a BD, usando: " + pool.options.port
      );
      break;
    default:
      console.log("Error interno del servidor ");
      break;
  }
};

const argumentos = process.argv.slice(2);

const funcion = argumentos[0];
const nombre = argumentos[1];
const rut = argumentos[2];
const curso = argumentos[3];
const nivel = argumentos[4];

//Nuevo estudiante
const nuevo = async ({ nombre, rut, curso, nivel }) => {
  try {
    const busqueda =
      "insert into estudiantes values ($1, $2, $3, $4) returning *";
    const res = await pool.query(busqueda, [nombre, rut, curso, nivel]);
    console.log("Estudiante editado con exito", res.rows[0]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoerror(err, pool, "estudiantes");
  }
};

//Consultar todos
const consulta = async () => {
  try {
    const busqueda = "select * from estudiantes";
    const res = await pool.query(busqueda);
    console.log("Registro actual de Estudiantes", res.rows[0]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoerror(err, pool, "estudiantes");
  }
};

//Editar estudiante por rut
const editar = async ({ nombre, rut, curso, nivel }) => {
  try {
    const busqueda =
      "update estudiantes set nombre=$1, curso=$3, nivel=$4 where rut=$2 returning *";
    const res = await pool.query(busqueda, [nombre, rut, curso, nivel]);
    console.log("Estudiante editado con exito", res.rows[0]);
    console.log([rut]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoerror(err, pool, "estudiantes");
  }
};

//Consultar por rut
const consultarut = async ({ rut }) => {
  try {
    const busqueda = "select * from estudiantes  where rut=$1";
    const res = await pool.query(busqueda, [rut]);
    console.log("Estudiante consultado", res.rows[0]);
    console.log([rut]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoerror(err, pool, "estudiantes");
  }
};

//Eliminar por rut
const eliminar = async ({ rut }) => {
  try {
    const busqueda = "delete from estudiantes  where rut=$1";
    const res = await pool.query(busqueda, [rut]);
    console.log("Registro de estudiante eliminado", res.rows[0]);
    console.log([rut]);
  } catch (err) {
    console.error("Codigo del error: ", err.code);
    manejoerror(err, pool, "estudiantes");
  }
};

const funciones = {
  nuevo: nuevo,
  consulta: consulta,
  editar: editar,
  consultarut: consultarut,
  eliminar: eliminar,
};

const arreglo = Object.keys(funciones);

//ejecucion principal
(async () => {
  if (funcion == "nuevo") {
    nuevo({
      nombre,
      rut,
      curso,
      nivel,
    });
  } else if (funcion == "consulta") {
    consulta();
  } else if (funcion == "consultarut") {
    const rut = nombre; //uso nombre porque es el primer argumento, y paso el valor hay
    consultarut({ rut });
  } else if (funcion == "editar") {
    editar({ nombre, rut, curso, nivel });
  } else if (funcion == "eliminar") {
    const rut = nombre; //uso nombre porque es el primer argumento, y paso el valor hay
    eliminar({ rut });
  }
  //pool.end();
})();

//Ejemplos
//node index nuevo 'Brian May' '12.345.678-9' guitarra 7
//node index consulta
//node index editar 'Brian May' '12.345.678-9' guitarra 10
//node index consultarut '12.345.678-9'
//node index eliminar '12.345.678-9'
