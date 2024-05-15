
// This script stores the datapoints
// This script also implements different camera movements
// This things are initted in the document after the model has been loaded

var points = [
  {
    "pos": "0.00716498966709711m 0.6313878383196355m 2.2584389547812767m", "normal": "0.01088693768943239m 0.049246012099770656m 0.9987273426115939m", "data-visibility-attribute": "visible", "hotspot-name": "Pedestrian Detection system", "butt-text": "1", "content": "<strong>Pedestrian Detection system</strong> <br> <p>When opting for the Night Vision with Pedestrian Detection system, a subtle modification is made to the twin-kidney grille. Instead of the standard 13 vertical slats, it features nine, allowing for an unobstructed view for the infrared camera's lens. This enhancement ensures enhanced visibility and performance of the system.</p>"
  },
  { "pos": "-0.5274160353437553m 0.7958048189615428m -2.381016832882327m", "normal": "-0.17973966805389963m 0.22852242858332378m -0.9568025665529194m", "data-visibility-attribute": "visible", "hotspot-name": "Adaptive Brake Lights", "butt-text": "2", "content": "Adaptive Brake Lights <br> <p>The Adaptive Brake Lights comprise layered red LED indicators designed to enhance vehicle visibility. These lights respond to the intensity of braking, signaling to following drivers the urgency of your actions, thereby prompting them to brake promptly. This feature serves to increase safety and awareness on the road.</p>" },
  { "pos": "0.15625384689914779m 0.4231528692557861m -2.4895935319993714m", "normal": "0.031307331239687916m -0.447144063197566m -0.8939138872161119m", "data-visibility-attribute": "visible", "hotspot-name": "Chrome Exhaust Tips", "butt-text": "3", "content": "Chrome Exhaust Tips <br> <p>BMW's dual trapezoidal chrome exhaust tips enhance the vehicle's rear design with a blend of sportiness and elegance, hinting at its performance capabilities. Crafted with precision, their chrome finish adds a premium touch, while their shape exudes dynamism and sophistication, making a bold statement whether the vehicle is parked or in motion.</p>" },
  { "pos": "0.9097586186623581m 0.7637933971104295m -0.034908191094644714m", "normal": "0.986548359926873m 0.16336875654428254m 0.005743075027581192m", "data-visibility-attribute": "visible", "hotspot-name": "Comfort Access system", "butt-text": "4", "content": "Comfort Access system <br> <p>The Comfort Access system, part of the Convenience Package, provides keyless entry to the vehicle using a multifunction remote control. Additionally, the package includes the soft-close feature, employing small electric motors to delicately close all four doors and the trunk lid, enhancing convenience and luxury.</p>" }
];
// ****************************************************** -->
//		kod fÃƒÂ¶r att fÃƒÂ¥ till panorering:
// ****************************************************** -->
function InitPanning() {
  const modelViewer = document.querySelector('#viewer');
  console.log(modelViewer);
  const tapDistance = 2;
  let panning = false;
  let panX, panY;
  let startX, startY;
  let lastX, lastY;
  let metersPerPixel;

  const startPan = () => {
    const orbit = modelViewer.getCameraOrbit();
    const { theta, phi, radius } = orbit;
    const psi = theta - modelViewer.turntableRotation;
    metersPerPixel = 0.75 * radius / modelViewer.getBoundingClientRect().height;
    panX = [-Math.cos(psi), 0, Math.sin(psi)];
    panY = [
      -Math.cos(phi) * Math.sin(psi),
      Math.sin(phi),
      -Math.cos(phi) * Math.cos(psi)
    ];
    modelViewer.interactionPrompt = 'none';
  };

  const movePan = (thisX, thisY) => {
    const dx = (thisX - lastX) * metersPerPixel;
    const dy = (thisY - lastY) * metersPerPixel;
    lastX = thisX;
    lastY = thisY;

    const target = modelViewer.getCameraTarget();
    target.x += dx * panX[0] + dy * panY[0];
    target.y += dx * panX[1] + dy * panY[1];
    target.z += dx * panX[2] + dy * panY[2];
    modelViewer.cameraTarget = `${target.x}m ${target.y}m ${target.z}m`;

    // This pauses turntable rotation
    modelViewer.dispatchEvent(new CustomEvent(
      'camera-change', { detail: { source: 'user-interaction' } }));
  };

  const recenter = (pointer) => {
    panning = false;
    if (Math.abs(pointer.clientX - startX) > tapDistance ||
      Math.abs(pointer.clientY - startY) > tapDistance)
      return;
    const rect = modelViewer.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    const hit = modelViewer.positionAndNormalFromPoint(x, y);
    modelViewer.cameraTarget =
      hit == null ? 'auto auto auto' : hit.position.toString();
  };

  const onPointerUp = (event) => {
    const pointer = event.clientX ? event : event.changedTouches[0];
    if (Math.abs(pointer.clientX - startX) < tapDistance &&
      Math.abs(pointer.clientY - startY) < tapDistance) {
      recenter(pointer);
    }
    panning = false;
  };

  modelViewer.addEventListener('mousedown', (event) => {
    startX = event.clientX;
    startY = event.clientY;
    panning = event.button === 2 || event.ctrlKey || event.metaKey ||
      event.shiftKey;
    if (!panning)
      return;

    lastX = startX;
    lastY = startY;
    startPan();
    event.stopPropagation();
  }, true);

  modelViewer.addEventListener('touchstart', (event) => {
    startX = event.touches[0].clientX;
    startY = event.touches[0].clientY;
    panning = event.touches.length === 2;
    if (!panning)
      return;

    const { touches } = event;
    lastX = 0.5 * (touches[0].clientX + touches[1].clientX);
    lastY = 0.5 * (touches[0].clientY + touches[1].clientY);
    startPan();
  }, true);

  modelViewer.addEventListener('mousemove', (event) => {
    if (!panning)
      return;

    movePan(event.clientX, event.clientY);
    event.stopPropagation();
  }, true);

  modelViewer.addEventListener('touchmove', (event) => {
    if (!panning || event.touches.length !== 2)
      return;

    const { touches } = event;
    const thisX = 0.5 * (touches[0].clientX + touches[1].clientX);
    const thisY = 0.5 * (touches[0].clientY + touches[1].clientY);
    movePan(thisX, thisY);
  }, true);

  self.addEventListener('mouseup', (event) => {
    recenter(event);
  }, true);

  self.addEventListener('touchend', (event) => {
    if (event.touches.length === 0) {
      recenter(event.changedTouches[0]);
    }
  }, true);
};