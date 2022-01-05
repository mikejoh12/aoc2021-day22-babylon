import React from "react";
import { FreeCamera, Vector3, HemisphericLight, MeshBuilder, CSG , StandardMaterial, Mesh, Color3 } from "@babylonjs/core";
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
  const { x1, x2, y1, y2, z1, z2 } = stepInstructions[0];
  
  let mat = new StandardMaterial("mat", scene);
  mat.diffuseColor = new Color3(.3, .1, .95);

  let a = MeshBuilder.CreateBox("a", { width: x2-x1, height: y2-y1, depth: z2-z1, updatable: true}, scene );
  a.position = new Vector3((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);

  for (let i = 1; i < 220; i++) {
    console.log(i);
    const {mode, x1, x2, y1, y2, z1, z2} = stepInstructions[i];
    const b = MeshBuilder.CreateBox("b", { width: x2-x1, height: y2-y1, depth: z2-z1}, scene);
    b.position = new Vector3((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);

    if (mode === 'on') {
      a = Mesh.MergeMeshes([a, b], true, true);
    } else if (mode === 'off') {
      let aCSG = CSG.FromMesh(a);
      let bCSG = CSG.FromMesh(b);
      a.dispose();
      b.dispose();
      aCSG.subtractInPlace(bCSG);
      a = aCSG.toMesh("csg", mat, scene);
    }
  }
  reactor = a;
}

const onSceneReady = (scene) => {
  let camera = new FreeCamera("camera1", new Vector3(0, 50000, -320000), scene);
  camera.setTarget(Vector3.Zero());
  camera.minZ = 220000;
  camera.maxZ = 420000;
  const canvas = scene.getEngine().getRenderingCanvas();
  camera.attachControl(canvas, true);
  let light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);
  light.intensity = 1;

  buildMesh(scene);
};

const onRender = (scene) => {
  if (reactor !== undefined) {
    var deltaTimeInMillis = scene.getEngine().getDeltaTime();

    const rpm = 5;
    reactor.rotation.y += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
    reactor.rotation.z += (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
  }
};

function App() {
  return (
  <div id="app">
    <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
  </div>
  )};

export default App;