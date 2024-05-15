
// This script stores the datapoints
// This script also implements different camera movements
// This things are initted in the document after the model has been loaded

var points = [
  {
    "pos": "0.15807878794453473m 0.49162590383614835m 2.094367926547254m", "normal": "0.060110240301263794m -0.11502405727975853m 0.991542346679065m", "data-visibility-attribute": "visible", "hotspot-name": "Bumper", "butt-text": "1", "content": "<strong>Bumper</strong> <br> <p>The carbon air conduction elements integrated into the bumper amplify the vehicle's motorsport heritage, adding an extra layer of brilliance.These lightweight components carve out two distinct channels for cooling air, not only enhancing performance but also adding a striking visual accent to the front apron.</p>"
  },
  { "pos": "-0.8148988280967921m 0.6122119726600992m 1.7407519983125903m", "normal": "-0.7766116569523065m 0.42388987414404783m 0.4660383126781923m", "data-visibility-attribute": "visible", "hotspot-name": "M Lights", "butt-text": "2", "content": "M Lights <br> <p>The M Lights Shadow Line features a sleek black finish applied to all chrome elements within the headlights, resulting in a design that is instantly recognizable and unmistakably bold.</p>" },
  { "pos": "0.9627661838742229m 1.0019200302258808m 0.326639638913786m", "normal": "0.7177179391032088m -0.18431626452575894m 0.6714971887660538m", "data-visibility-attribute": "visible", "hotspot-name": "Exterior Mirrors", "butt-text": "3", "content": "Exterior Mirrors <br> <p>The aerodynamically optimized M exterior mirrors play a crucial role in reducing drag on the new BMW M4 Coupé. Their design not only enhances performance but also emphasizes visual appeal. The mirror caps, crafted from visible carbon, highlight this meticulous fine-tuning, adding a captivating touch to the vehicle's exterior.</p>" },
  { "pos": "-0.6311701810870675m 0.6236075293842878m -2.2690682124100308m", "normal": "-0.5749829454667301m 0.22718272662417294m -0.785991489232555m", "data-visibility-attribute": "visible", "hotspot-name": "Rear Diffuser", "butt-text": "4", "content": "Rear Diffuser <br> <p>The high-quality carbon rear diffuser highlights the vehicle's advanced engineering and adds extra sportiness with its bold, prominent struts. Meticulously handcrafted from lightweight carbon, it epitomizes precision and performance, enhancing the vehicle's dynamic appeal.</p>" }
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