import React, { useEffect } from 'react';
import { X, ShieldAlert, FileText, HelpCircle } from 'lucide-react';

export default function InfoModal({ page, onClose }) {
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!page) return null;

  const contentMap = {
    'termos': {
      title: 'Termos de Uso',
      icon: <FileText className="w-6 h-6 text-indigo-600" />,
      text: `Bem-vindo ao Lojinha's On.\n\nAo utilizar a nossa plataforma, concorda com os seguintes termos:\n\n1. O Lojinha's On atua apenas como um intermediário na divulgação de produtos e serviços locais.\n2. A responsabilidade sobre a qualidade, garantia e entrega dos produtos é exclusivamente do vendedor anunciante.\n3. Proibimos estritamente a venda de artigos ilícitos, falsificados ou que violem os direitos de terceiros.\n4. O utilizador compromete-se a fornecer informações verdadeiras no seu registo e nos seus anúncios.\n\nEstes termos podem ser atualizados a qualquer momento pela administração.`
    },
    'privacidade': {
      title: 'Política de Privacidade',
      icon: <ShieldAlert className="w-6 h-6 text-indigo-600" />,
      text: `A sua privacidade é importante para nós.\n\n1. Recolhemos apenas os dados estritamente necessários para o funcionamento da plataforma (nome, e-mail, telefone e endereço).\n2. As suas informações não serão vendidas ou partilhadas com terceiros para fins de marketing sem o seu consentimento explícito.\n3. Utilizamos a câmara e o armazenamento do seu dispositivo apenas para o upload da foto de perfil e das fotos dos anúncios.\n4. Todo o tráfego de dados é protegido e gerido pelas diretrizes de alta segurança dos servidores do Google Cloud (Firebase).\n\nPode solicitar a eliminação completa da sua conta e dos seus dados a qualquer momento contactando o nosso Suporte Oficial.`
    },
    'faq': {
      title: 'Dúvidas Frequentes (FAQ)',
      icon: <HelpCircle className="w-6 h-6 text-indigo-600" />,
      text: `P: Como crio um anúncio?\nR: Vá à aba "Conta", clique em "Publicar", preencha os dados do seu produto, adicione uma fotografia e clique em Publicar Anúncio.\n\nP: A plataforma cobra alguma taxa?\nR: Não. Criar a conta e anunciar no Lojinha's On é totalmente gratuito para os vendedores e compradores.\n\nP: Como recebo o pagamento das vendas?\nR: A plataforma não processa os pagamentos nem fica com o seu dinheiro. O cliente entrará em contacto direto consigo pelo WhatsApp e vocês combinam a forma de pagamento (Dinheiro, PIX, Cartão) e a entrega.\n\nP: Como ganho o selo de Verificado?\nR: Atualmente, a verificação é feita de forma manual pela nossa equipa administrativa após análise do seu perfil de vendedor. Caso cumpra as boas práticas, receberá o selo verde de Empresa Verificada.`
    }
  };

  const { title, icon, text } = contentMap[page] || contentMap['termos'];

  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex justify-center items-end sm:items-center sm:p-6 transition-all duration-300" style={{ zIndex: 9999999 }}>
      <div className="bg-white w-full sm:max-w-2xl h-[85vh] sm:h-auto sm:max-h-[85vh] flex flex-col relative sm:rounded-[2rem] rounded-t-[2rem] shadow-2xl overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95 duration-300">
        <div className="flex items-center justify-between p-5 sm:p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-100 rounded-xl shadow-sm border border-indigo-50">{icon}</div>
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">{title}</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-700 bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition-colors active:scale-90 shadow-sm"><X className="w-5 h-5" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 hide-scrollbar bg-white">
          <div className="prose prose-indigo max-w-none text-gray-600 whitespace-pre-wrap leading-relaxed sm:text-lg">{text}</div>
        </div>
        <div className="p-4 sm:p-6 bg-gray-50 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 transition-colors active:scale-95 shadow-md shadow-indigo-600/20">Entendido</button>
        </div>
      </div>
    </div>
  );
}
