import React, { useEffect, useMemo, useRef, useState } from "react";

const DEFAULT_DAYS_PT = [
  { key: "segunda", label: "Segunda" },
  { key: "terca", label: "Terça" },
  { key: "quarta", label: "Quarta" },
  { key: "quinta", label: "Quinta" },
  { key: "sexta", label: "Sexta" },
  { key: "sabado", label: "Sábado" },
  { key: "domingo", label: "Domingo" },
];

const STORAGE_KEY = "menu_semana_v2";

const emptyDataFor = (days) => Object.fromEntries(days.map((d) => [d.key, { almoco: "", jantar: "" }]));

export function formatShareText({ title, days, data }) {
  const safeTitle = (title || "Cardápio da Semana").trim();
  const lines = [safeTitle];
  for (const d of days) {
    const { almoco, jantar } = data[d.key] || { almoco: "", jantar: "" };
    if (!almoco && !jantar) continue;
    lines.push(`\n${d.label}`);
    if (almoco) lines.push(`• Almoço: ${almoco}`);
    if (jantar) lines.push(`• Jantar: ${jantar}`);
  }
  if (lines.length === 1) lines.push("(Sem itens ainda)");
  return lines.join("\n").trim();
}

export default function WeeklyMenuPlanner() {
  const [title, setTitle] = useState("Cardápio da Semana");
  const [days, setDays] = useState(DEFAULT_DAYS_PT);
  const [data, setData] = useState(() => {
    const empty = emptyDataFor(DEFAULT_DAYS_PT);
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? { ...empty, ...JSON.parse(saved) } : empty;
    } catch {
      return empty;
    }
  });

  const [startDayKey, setStartDayKey] = useState(DEFAULT_DAYS_PT[0].key);
  const [toast, setToast] = useState(null);
  const previewRef = useRef(null);

  useEffect(() => { if (!toast) return; const t = setTimeout(() => setToast(null), 2400); return () => clearTimeout(t); }, [toast]);
  useEffect(() => { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch {} }, [data]);

  const handleChange = (dayKey, field, value) => { setData(prev => ({ ...prev, [dayKey]: { ...prev[dayKey], [field]: value } })); };

  const clearAll = () => { setData(emptyDataFor(days)); setToast({ type: "success", message: "Cardápio limpo." }); };

  const fillExample = () => {
    const exemplo = {
      segunda: { almoco: "Arroz, feijão, frango grelhado, salada", jantar: "Sopa de legumes + torradas" },
      terca: { almoco: "Macarrão ao sugo com carne moída", jantar: "Omelete de queijo e salada" },
      quarta: { almoco: "Peixe assado, purê de batata", jantar: "Sanduíche natural" },
      quinta: { almoco: "Strogonoff de frango + arroz", jantar: "Crepioca recheada" },
      sexta: { almoco: "Chili com arroz", jantar: "Pizza caseira" },
      sabado: { almoco: "Feijoada leve", jantar: "Hambúrguer artesanal" },
      domingo: { almoco: "Lasanha", jantar: "Sushi / Temaki" },
    };
    setData(prev => ({ ...prev, ...exemplo }));
    setToast({ type: "info", message: "Exemplo aplicado." });
  };

  const shareText = useMemo(() => formatShareText({ title, days, data }), [title, days, data]);

  const copyToClipboard = async () => {
    try { await navigator.clipboard.writeText(shareText); setToast({ type: "success", message: "Texto copiado!" }); } catch { setToast({ type: "error", message: "Cópia bloqueada pelo navegador." }); }
  };

  const openWhatsApp = () => { window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, "_blank"); };

  const rotatedDays = useMemo(() => {
    const index = DEFAULT_DAYS_PT.findIndex(d => d.key === startDayKey);
    return [...DEFAULT_DAYS_PT.slice(index), ...DEFAULT_DAYS_PT.slice(0, index)];
  }, [startDayKey]);

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900" style={{fontFamily: "Inter, system-ui, -apple-system, Roboto, 'Helvetica Neue', Arial"}}>
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 py-3 flex flex-col items-center gap-2 md:flex-row md:justify-center">
          <div className="flex-1 text-center">
            <input className="w-full max-w-md text-2xl md:text-3xl font-semibold bg-transparent outline-none focus:ring-2 ring-gray-200 rounded-xl px-2 py-1" value={title} onChange={e => setTitle(e.target.value)} placeholder="Título do cardápio" />
          </div>
          <div className="flex flex-wrap gap-2 print:hidden mt-2 md:mt-0">
            <select value={startDayKey} onChange={e => setStartDayKey(e.target.value)} className="px-4 py-2 rounded-2xl border border-gray-200">
              {DEFAULT_DAYS_PT.map(d => <option key={d.key} value={d.key}>{d.label}</option>)}
            </select>
            <button onClick={copyToClipboard} className="px-4 py-2 rounded-2xl shadow-sm" style={{background:"#059669", color:"#fff"}}>Copiar texto</button>
            <button onClick={openWhatsApp} className="px-4 py-2 rounded-2xl shadow-sm" style={{background:"#ecfdf5", color:"#065f46", border:"1px solid #d1fae5"}}>Enviar no WhatsApp</button>
            <button onClick={fillExample} className="px-4 py-2 rounded-2xl shadow-sm" style={{background:"#312e81", color:"#fff"}}>Exemplo rápido</button>
            <button onClick={clearAll} className="px-4 py-2 rounded-2xl shadow-sm" style={{background:"#fff", color:"#dc2626", border:"1px solid #e5e7eb"}}>Limpar</button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4">
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 print:grid-cols-2">
          {rotatedDays.map(d => (
            <article key={d.key} className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                <h2 className="font-semibold text-lg">{d.label}</h2>
                <div className="flex gap-2">
                  <button className="text-xs px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100" onClick={() => setData(prev => ({ ...prev, [d.key]: { almoco: prev[d.key]?.jantar || "", jantar: prev[d.key]?.almoco || "" } }))}>Inverter</button>
                  <button className="text-xs px-2 py-1 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100" onClick={() => setData(prev => ({ ...prev, [d.key]: { almoco: "", jantar: "" } }))}>Limpar</button>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Almoço</label>
                  <textarea value={data[d.key]?.almoco || ""} onChange={e => handleChange(d.key, "almoco", e.target.value)} placeholder="Ex.: Arroz, feijão, frango, salada" className="w-full resize-y min-h-[60px] rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 p-3" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Jantar</label>
                  <textarea value={data[d.key]?.jantar || ""} onChange={e => handleChange(d.key, "jantar", e.target.value)} placeholder="Ex.: Sopa, omelete, sanduíche" className="w-full resize-y min-h-[60px] rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 p-3" />
                </div>
              </div>
            </article>
          ))}
        </section>

        <section className="mt-8 bg-white p-4 rounded-2xl shadow-sm border border-gray-200">
          <h3 className="font-semibold text-lg mb-2">Pré-visualização do texto</h3>
          <pre ref={previewRef} className="whitespace-pre-wrap font-mono p-2 bg-gray-50 rounded-xl border border-gray-200">{shareText}</pre>
        </section>
      </main>
    </div>
  );
}
