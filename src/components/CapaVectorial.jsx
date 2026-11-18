// Capa de mapa vectorial (MapLibre) para usarla dentro de Leaflet.
// Se usa para el mapa "Claro" de OpenFreeMap, que es gratis y no pide clave.
import { createLayerComponent } from "@react-leaflet/core";
import { maplibreGL } from "@maplibre/maplibre-gl-leaflet";
import "maplibre-gl/dist/maplibre-gl.css";

// ¿Cómo funciona createLayerComponent?
// react-leaflet trae componentes listos (TileLayer, Marker...), pero no uno para MapLibre.
// createLayerComponent sirve para hacer uno propio. Se le pasan 2 funciones:
//
// 1) crearCapa: se ejecuta una sola vez, cuando el componente aparece.
//    Crea la capa de Leaflet con las props (aquí style y attribution) y la regresa
//    junto con el "contexto". El contexto es lo que le permite a LayersControl
//    saber que esta capa existe, para que funcione igual que un <TileLayer>.
//    react-leaflet se encarga de agregarla al mapa y de quitarla cuando ya no se usa.
//
// 2) actualizarCapa: se ejecuta cuando cambian las props. Aquí, si cambia el estilo,
//    se le pasa el nuevo al mapa de MapLibre.
function crearCapa({ style, attribution }, contexto) {
  // interactive: false (el valor normal del plugin) deja que los clics le lleguen a Leaflet,
  // así tocar el mapa sigue moviendo el pin con el formulario abierto
  // El texto de créditos se pasa en attributionControl.customAttribution y no en "attribution",
  // porque el plugin ignora "attribution". Así el texto se quita bien al cambiar a otra capa.
  const capa = maplibreGL({
    style,
    attributionControl: { customAttribution: attribution },
  });
  return { instance: capa, context: contexto };
}

function actualizarCapa(capa, props, propsAnteriores) {
  if (props.style !== propsAnteriores.style) {
    const mapaMaplibre = capa.getMaplibreMap();
    if (mapaMaplibre) mapaMaplibre.setStyle(props.style);
  }
}

const CapaVectorial = createLayerComponent(crearCapa, actualizarCapa);

export default CapaVectorial;
