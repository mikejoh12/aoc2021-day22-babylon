import { SceneSerializer } from '@babylonjs/core';
let objectUrl;

export function doDownload(filename, mesh) {
  if (objectUrl) {
    window.URL.revokeObjectURL(objectUrl);
  }

  let serializedMesh = SceneSerializer.SerializeMesh(mesh);

  let strMesh = JSON.stringify(serializedMesh);

  if (filename.toLowerCase().lastIndexOf(".babylon") !== filename.length - 8 || filename.length < 9) {
    filename += ".babylon";
  }

  let blob = new Blob([strMesh], { type: "octet/stream" });

  // turn blob into an object URL; saved as a member, so can be cleaned out later
  objectUrl = (window.webkitURL || window.URL).createObjectURL(blob);

  let link = window.document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  let click = document.createEvent("MouseEvents");
  click.initEvent("click", true, false);
  link.dispatchEvent(click);
}
