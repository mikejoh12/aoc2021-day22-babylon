import React from "react";
import { SceneLoader, FreeCamera, Vector3, HemisphericLight, MeshBuilder, CSG , StandardMaterial, Mesh, Color3, Color4 } from "@babylonjs/core";
import { AdvancedDynamicTexture, TextBlock } from '@babylonjs/gui/2D';
import SceneComponent from "./babylon/SceneComponent";
import { instructions } from "./instructions";
import { doDownload } from "./util/util";
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
  mat.diffuseColor = new Color3(.2, .15, .95);

  let a = MeshBuilder.CreateBox("a", { width: x2-x1, height: y2-y1, depth: z2-z1, updatable: true}, scene );
  a.position = new Vector3((x1+x2)/2, (y1+y2)/2, (z1+z2)/2);

  for (let i = 1; i < stepInstructions.length; i++) {
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
  reactor.name = 'reactor';
  doDownload('reactor-mesh', reactor);
}

const onSceneReady = (scene) => {
  scene.clearColor = new Color4(0,0,0,0);
  let camera = new FreeCamera("camera1", new Vector3(0, 0, -300000), scene);
  camera.setTarget(Vector3.Zero());
  camera.minZ = 200000;
  camera.maxZ = 400000;
  const canvas = scene.getEngine().getRenderingCanvas();
  camera.attachControl(canvas, true);
  let light = new HemisphericLight("light", new Vector3(1, 1, 1), scene);
  light.intensity = 1.2;

  // SceneLoader.ImportMest code below loads the reactor mesh quickly from a saved .babylon file.
  // Uncomment the section to use the file found in /public/assets
  
  SceneLoader.Append("./assets/", "reactor-mesh.babylon", scene,
                   function(scene){
    reactor = scene.meshes[0];
  });
  

  // Code below creates a combined mesh file that can be saved from the browser.
  // Place this file named reactor-mesh.babylon in /public/assets.
  // To load mesh from the file, comment out buildMesh below and uncomment SceneLoader
  // section above.

  //buildMesh(scene);
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
  <div>
    <h2 className="top-text">Advent of Code 2021 - Sub Reactor</h2>
    <div id="app" className="my-canvas">
      <SceneComponent antialias onSceneReady={onSceneReady} onRender={onRender} id="my-canvas" />
    </div>
  </div>
  )};

export default App;