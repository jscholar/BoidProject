import { UpdaterComputeMode } from "../@types/Updaters";

function onComputeModeChange(callback: (computeMode: UpdaterComputeMode) => any) {
  let prev = UpdaterComputeMode.GPU;
  
  document.getElementById("compute-mode").addEventListener("click", ({ target }: MouseEvent) => {
    const computeMode = (target as HTMLInputElement).value as UpdaterComputeMode ?? prev;
    prev = computeMode;
    callback(computeMode);
  });
}

export default onComputeModeChange;
