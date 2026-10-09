import React from 'react';
import { Store, ShieldCheck } from 'lucide-react';

export default function Footer({ onOpenInfo }) {
  return (
    <footer className="bg-white border-t border-gray-200 mt-auto pb-24 pt-10">
      <div className="max-w-5xl mx-auto px-6 text-center md:text-left flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
            <Store className="w-5 h-5 text-indigo-600" />
            <h2 className="text-lg font-black text-gray-900 tracking-tight">Lojinha's On</h2>
          </div>
          <p className="text-sm text-gray-500 max-w-xs mx-auto md:mx-0">O maior e mais seguro marketplace local para impulsionar o seu negócio.</p>
        </div>

        <div className="text-sm text-gray-500 space-y-1">
          <p className="font-bold text-gray-800 flex items-center justify-center md:justify-end gap-1"><ShieldCheck className="w-4 h-4 text-green-500"/> Empresa Verificada</p>
          <p>CNPJ: Em processo de regularização (MEI)</p>
          <p>Desenvolvido menezes.devv</p>
        </div>
      </div>
      
      <div className="max-w-5xl mx-auto px-6 mt-8 pt-6 border-t border-gray-100 flex flex-wrap justify-center gap-4 text-xs text-gray-400 font-medium">
        <button onClick={() => onOpenInfo('termos')} className="hover:text-indigo-600 transition-colors focus:outline-none">Termos de Uso</button>
        <span>&bull;</span>
        <button onClick={() => onOpenInfo('privacidade')} className="hover:text-indigo-600 transition-colors focus:outline-none">Política de Privacidade</button>
        <span>&bull;</span>
        <button onClick={() => onOpenInfo('faq')} className="hover:text-indigo-600 transition-colors focus:outline-none">Dúvidas Frequentes (FAQ)</button>
      </div>
    </footer>
  );
}
