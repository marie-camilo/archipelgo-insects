const CONFIG = {
  engine: { antialias: true, preserveDrawingBuffer: true },
  camera: {
    mapRadius: 50, mapAlpha: Math.PI / 4, mapBeta: Math.PI / 3,
    islandRadius: 15, islandAlpha: Math.PI / 2, islandBeta: Math.PI / 3,
    boatRadius: 20,
  },
  colors: {
    ocean: "#1976d2", oceanDeep: "#0d47a1", island: "#7cb342",
    islandActive: "#ffa726", islandComplete: "#42a5f5", insect: "#ffeb3b",
  },
  animation: { boatTravelDuration: 3000, transitionDuration: 500 },
  debug: false,
};
