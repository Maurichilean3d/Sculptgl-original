import { mat4 } from 'gl-matrix';

export function yawPitchRollToMat4(out, yaw, pitch, roll) {
  mat4.identity(out);
  mat4.rotateY(out, out, yaw);
  mat4.rotateX(out, out, pitch);
  mat4.rotateZ(out, out, roll);
  return out;
}
