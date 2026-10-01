// Paste into the DevTools console of an already-open (pre-save-feature) editor tab.
// Reads every layer back out of the page and downloads a project file that the new version can open.
(async () => {
  const q = s => document.querySelector(s);
  const frame = () => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r)));
  const toDataUrl = blob => new Promise(r => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(blob); });
  const n = document.querySelectorAll('#layers li').length;
  if (!n) { console.warn('找不到任何圖層'); return; }
  const layers = [];
  for (let j = 0; j < n; j++) {
    const i = n - 1 - j; // the list shows the top layer first
    document.querySelectorAll('#layers li')[j].click();
    await frame();
    const li = document.querySelectorAll('#layers li')[j];
    const rect = q(`#overlay rect.hit[data-layer="${i}"]`);
    const rot = /rotate\(\s*([-\d.e]+)/.exec(rect.parentNode.getAttribute('transform') || '');
    const blob = await (await fetch(li.querySelector('img').src)).blob();
    layers[i] = {
      name: li.querySelector('span').textContent,
      dataUrl: await toDataUrl(blob),
      x: +rect.getAttribute('x'), y: +rect.getAttribute('y'),
      w: +rect.getAttribute('width'), h: +rect.getAttribute('height'),
      rot: rot ? +rot[1] : 0,
      shape: q('#shape button.on')?.dataset.shape || 'rect',
      radius: +q('#radius').value, border: +q('#border').value, borderColor: q('#borderColor').value,
      opacity: +q('#opacity').value, zoom: +q('#zoomIn').value, px: 0, py: 0,
    };
  }
  const project = {
    app: 'ig-seamless-carousel', version: 1,
    count: +q('#count').value, ratio: +q('#ratio').value, bg: q('#bg').value, quality: q('#quality').value,
    layers,
  };
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(project)], { type: 'application/json' }));
  a.download = `ig-carousel-${new Date().toISOString().slice(0, 16).replace(/[-:T]/g, '')}.igproj.json`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  console.log(`已存 ${n} 個圖層`);
})();
