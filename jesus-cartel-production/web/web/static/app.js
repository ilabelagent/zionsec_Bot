function attachOverlay(formId){
  const form = document.getElementById(formId);
  if(!form) return;
  form.addEventListener('submit', ()=>{
    const ov = document.getElementById('overlay');
    if(ov){ ov.hidden = false; }
  });
}

function applyPreset(values){
  const map = {
    noise_reduce: 'input[name="noise_reduce"]',
    noise_floor: 'input[name="noise_floor"]',
    deess_center: 'input[name="deess_center"]',
    deess_strength: 'input[name="deess_strength"]',
    highpass: 'input[name="highpass"]',
    lowpass: 'input[name="lowpass"]',
    limiter: 'input[name="limiter"]',
  };
  for(const k in values){
    const sel = map[k];
    const el = document.querySelector(sel);
    if(el){ el.value = values[k]; }
  }
}

function setupPresets(){
  const sel = document.getElementById('preset-select');
  if(!sel) return;
  sel.addEventListener('change', ()=>{
    const p = sel.value;
    if(p === 'music'){
      applyPreset({noise_reduce:12, noise_floor:-28, deess_center:0.25, deess_strength:1.0, highpass:30, lowpass:18000, limiter:0.98});
    } else if(p === 'podcast'){
      applyPreset({noise_reduce:14, noise_floor:-30, deess_center:0.22, deess_strength:1.4, highpass:80, lowpass:17000, limiter:0.96});
    } else if(p === 'aggressive'){
      applyPreset({noise_reduce:16, noise_floor:-32, deess_center:0.27, deess_strength:1.6, highpass:70, lowpass:16000, limiter:0.95});
    }
  });
}

document.addEventListener('DOMContentLoaded', ()=>{
  attachOverlay('clean-form');
  attachOverlay('separate-form');
  setupPresets();
  const adviceBtn = document.getElementById('advice-btn');
  if(adviceBtn){
    adviceBtn.addEventListener('click', async ()=>{
      const ov = document.getElementById('overlay'); if(ov) ov.hidden=false;
      try{
        const fileInput = document.querySelector('input[name="files"]');
        const ctxSel = document.getElementById('context-select');
        const context = ctxSel ? ctxSel.value : 'clean';
        const fd = new FormData();
        if(fileInput && fileInput.files && fileInput.files[0]){
          fd.append('file', fileInput.files[0]);
        }
        fd.append('context', context);
        const resp = await fetch('/api/advice', { method:'POST', body: fd });
        const data = await resp.json();
        if(data && data.ok && data.params){
          applyPreset(data.params);
          alert(`Advice source: ${data.source}\n${data.notes||''}`);
        } else {
          alert('Advice failed.');
        }
      } catch(e){
        console.error(e); alert('Advice error.');
      } finally {
        if(ov) ov.hidden=true;
      }
    });
  }
});
