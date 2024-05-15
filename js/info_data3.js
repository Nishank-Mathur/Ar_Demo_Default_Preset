
// This script stores the datapoints
// This script also implements different camera movements
// This things are initted in the document after the model has been loaded

var points = [
  {
    "pos": "-1.3081145944148251m 0.350818655014653m 0.4983520065222791m", "normal": "-0.24835002330372902m 0.05882839443754176m 0.9668823537188682m", "data-visibility-attribute": "visible", "hotspot-name": "Laser Headlights", "butt-text": "1", "content": "<strong>Laser Headlights</strong> <br> <p>The BMW Laser Headlights enhance visibility and convenience with features like the Follow-Me-Home function, which keeps low beams on after the ignition is turned off. The High Beam Assistant adjusts based on traffic conditions, and the mirror package with a rain sensor ensures optimal visibility and safety in adverse weather.</p>"
  },
  { "pos": "-1.1891835957853791m 0.16131414924986548m -0.3000632547335328m", "normal": "0m 4.7153372406681295e-7m -0.9999999999998889m", "data-visibility-attribute": "visible", "hotspot-name": "Brakes", "butt-text": "2", "content": "Brakes <br> <p>The M Compound brakes deliver exceptional deceleration performance, boasting remarkable stability and reduced weight. Featuring brake calipers finished in striking Red high-gloss with prominent M lettering, this high-performance braking system exudes a distinctly sporty aesthetic while ensuring top-tier performance on the road or track.</p>" },
  { "pos": "0.1509660104086492m 0.8461831570616021m -0.12599224952732463m", "normal": "-0.015423590425920904m 0.9993166668726129m -0.03359035827413747m", "data-visibility-attribute": "visible", "hotspot-name": "Metal Roof", "butt-text": "3", "content": "Metal Roof <br> <p>The BMW Eclipse metal roof seamlessly blends style and functionality. Engineered from lightweight materials, it not only enhances agility and stability but also lowers the car's center of gravity for improved handling. Its sleek design contributes to aerodynamic efficiency while providing robust protection from external elements.</p>" },
  { "pos": "0.7490922602559468m 0.179298925384007m -0.5461375680865719m", "normal": "0.1543147193166116m -0.24315699044312536m -0.9576333564579281m", "data-visibility-attribute": "visible", "hotspot-name": "Forged Wheels", "butt-text": "4", "content": "Forged Wheels <br> <p>BMW's forged wheels, made from high-quality materials, offer strength and reduced weight for improved agility. Paired with performance tires, they ensure optimal grip and confident handling in any conditions.</p>" }
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