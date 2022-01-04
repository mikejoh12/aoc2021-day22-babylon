import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, CSG , StandardMaterial } from "@babylonjs/core";
import SceneComponent from "./babylon/SceneComponent";
import { instructions } from "./instructions";
import './App.css';

let reactor;

function buildInstructions(str) {
  return str.split('\n').map((line) => {
      const [mode, pos] = line.split(' ');
      const [x, y, z] = pos.split(',');
      const xNrs = x.split('=')[1];
      const [x1, x2] = xNrs.split('..').map((nr) => Number(nr));
      const yNrs = y.split('=')[1];
      const [y1, y2] = yNrs.split('..').map((nr) => Number(nr));
      const zNrs = z.split('=')[1];
      const [z1, z2] = zNrs.split('..').map((nr) => Number(nr));
      return { mode, x1, x2, y1, y2, z1, z2 }
})}

function buildMesh(scene) {
  const stepInstructions = buildInstructions(instructions);
  const {mode, x1, x2, y1, y2, z1, z2} = stepInstructions[0];
  
  let mat = new StandardMaterial("mat", scene);

  let a = MeshBuilder.CreateBox("a", { width: x2-x1, height: y2-y1, depth: z2-z1, updatable: true}, scene );
  a.position = new Vector3((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);

  for (let i = 1; i < stepInstructions.length; i++) {
    console.log(i);
    const {mode, x1, x2, y1, y2, z1, z2} = stepInstructions[i];
    const b = MeshBuilder.CreateBox("b", { width: x2-x1, height: y2-y1, depth: z2-z1}, scene);
    b.position = new Vector3((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);
    let aCSG = CSG.FromMesh(a);
    let bCSG = CSG.FromMesh(b);
    a.dispose();
    b.dispose();
    mode === 'on' ? aCSG.unionInPlace(bCSG) : aCSG.subtractInPlace(bCSG);
    a = aCSG.toMesh("csg", mat, scene);
    aCSG = null;
    bCSG = null;
  }
  reactor = a;
}

const onSceneReady = (scene) => {
  // This creates and positions a free camera (non-mesh)
  var camera = new FreeCamera("camera1", new Vector3(0, 50, -330000), scene);
  // This targets the camera to scene origin
  camera.setTarget(Vector3.Zero());
  camera.maxZ = 500000;
  const canvas = scene.getEngine().getRenderingCanvas();
  // This attaches the camera to the canvas
  camera.attachControl(canvas, true);
  // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
  var light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);
  // Default intensity is 1. Let's dim the light a small amount
  light.intensity = 2;

  buildMesh(scene);

};

/**
 * Will run on every frame render.  We are spinning the box on y-axis.
 */
const onRender = (scene) => {
  if (reactor !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 10;
    reactor.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

function App() {
  return (
  <div id="app">
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
  )};

export default App;