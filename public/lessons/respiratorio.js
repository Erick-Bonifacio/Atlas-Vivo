// Atlas Vivo — aula aprofundada: sistema respiratório. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).respiratorio = {
  dur: 60,
  lead: 'Como o ar chega aos alvéolos, como o oxigênio e o gás carbônico atravessam a membrana respiratória, como o sangue os transporta e como o encéfalo regula tudo isso.',
  goals: [
    'Percorrer as vias aéreas e distinguir zona de condução e zona respiratória.',
    'Explicar a mecânica da ventilação com base na relação entre pressão e volume.',
    'Descrever a difusão dos gases e o transporte de O₂ e de CO₂ no sangue.',
    'Entender o controle químico da respiração e por que o CO₂ é o principal estímulo.',
    'Relacionar doenças respiratórias, tabagismo e poluição à saúde pública.'],
  enem: [
    'Mecânica da respiração: diafragma, costelas, pressão e volume.',
    'Hematose: difusão, hemoglobina, monóxido de carbono e altitude.',
    'Transporte de CO₂ como bicarbonato e controle do pH do sangue.',
    'Controle da respiração pelo bulbo e a resposta ao exercício.',
    'Tabagismo, poluição, asma, tuberculose, influenza e vacinação.',
    'Respiração celular × ventilação pulmonar.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 22: O sistema respiratório', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/22-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Visão geral', t: 'Para que respirar', h: 'Duas respirações diferentes: a do pulmão e a da célula', m: { sys: ['respiratorio'] }, b: [
      { p: 'As células obtêm energia queimando nutrientes com oxigênio dentro das mitocôndrias. Esse processo, a respiração celular, produz ATP e libera gás carbônico como resíduo. O sistema respiratório existe para entregar oxigênio ao sangue e retirar o gás carbônico: é a troca gasosa, que acontece nos alvéolos.' },
      { warn: ['“Respirar é o mesmo que respiração celular.”', 'São processos diferentes. A ventilação é o movimento do ar para dentro e para fora dos pulmões. A respiração celular é a série de reações químicas que ocorre dentro de cada célula, usando o O₂ que a ventilação e a circulação entregaram.'] },
      { def: [['Ventilação pulmonar', 'movimento do ar entre o ambiente e os alvéolos (inspiração e expiração).'], ['Hematose', 'troca de gases entre o ar alveolar e o sangue dos capilares.'], ['Respiração celular', 'reações das células que usam O₂ para obter ATP e produzem CO₂.']] },
      { p: 'Além de trocar gases, o sistema respiratório aquece e umidifica o ar, filtra partículas, ajuda a regular o pH do sangue pela eliminação de CO₂, permite a fala (a laringe abriga as pregas vocais) e abriga o olfato, no teto da cavidade nasal.' },
      { fig: 'r-respiratorio', cap: 'Traqueia e pulmões ocupam boa parte do tórax, protegidos pela caixa torácica.' },
    ] },
    { ch: 'Cap. 1, Visão geral', t: 'Vias aéreas', h: 'Do nariz aos alvéolos, uma árvore que se ramifica', m: { sys: ['respiratorio'], parts: ['respiratorio', ['traqueia', 'brônquio']] }, b: [
      { p: 'O ar entra pelo nariz, onde pelos retêm partículas grandes, o muco captura poeira e microrganismos e a rede de vasos sanguíneos aquece o ar. Passa pela faringe (compartilhada com o sistema digestório) e pela laringe, onde a epiglote evita que o alimento entre nas vias aéreas. A traqueia, com anéis de cartilagem em forma de C que a mantêm aberta, divide-se nos dois brônquios principais, que se ramificam em brônquios menores e bronquíolos.' },
      { table: { cap: 'Zona de condução e zona respiratória', head: ['Região', 'Estruturas', 'Função'], rows: [
        ['Zona de condução', 'Nariz, faringe, laringe, traqueia, brônquios, bronquíolos', 'Conduzir, aquecer, umedecer e filtrar o ar. Não há trocas gasosas.'],
        ['Zona respiratória', 'Bronquíolos respiratórios, ductos alveolares e alvéolos', 'Trocas gasosas. Os alvéolos têm parede muito fina e são envolvidos por capilares.']] } },
      { p: 'O epitélio da traqueia e dos brônquios é ciliado e tem células produtoras de muco. Os cílios batem em direção à faringe, formando uma “escada rolante mucociliar” que leva ao exterior o muco com as partículas capturadas. A fumaça do cigarro paralisa e destrói os cílios, e por isso o fumante tosse mais e tem mais infecções respiratórias.' },
      { recall: ['Em que parte das vias aéreas ocorrem as trocas gasosas?', 'Somente na zona respiratória, principalmente nos alvéolos. O ar que fica na zona de condução não participa das trocas e é chamado de espaço morto anatômico.'] },
    ] },
    { ch: 'Cap. 2, Mecânica', t: 'Pulmões, pleuras e caixa torácica', h: 'Um sistema fechado que muda de volume', m: { sys: ['respiratorio', 'esqueletico'] }, b: [
      { p: 'O pulmão direito tem três lobos e o esquerdo tem dois, pois divide espaço com o coração. Cada pulmão é envolvido por uma dupla membrana, as pleuras: a visceral, colada ao pulmão, e a parietal, colada à parede torácica e ao diafragma. Entre elas há uma fina camada de líquido que reduz o atrito e mantém as duas coladas, como duas lâminas de vidro molhadas.' },
      { p: 'Por causa dessa união, o pulmão acompanha os movimentos da caixa torácica. A pressão no espaço pleural é um pouco menor que a pressão atmosférica; se entra ar nesse espaço (pneumotórax), o pulmão perde a fixação à parede e colapsa.' },
      { ul: ['Diafragma: músculo em forma de cúpula entre o tórax e o abdome; é o principal músculo da inspiração.', 'Músculos intercostais externos: elevam as costelas e aumentam o diâmetro do tórax.', 'Na expiração forçada entram em ação os intercostais internos e os músculos da parede abdominal.'] },
    ] },
    { ch: 'Cap. 2, Mecânica', t: 'Ventilação', h: 'Por que o ar entra: pressão e volume', m: { sys: ['respiratorio', 'muscular'] }, b: [
      { p: 'O ar sempre se move de onde a pressão é maior para onde é menor. Como o volume e a pressão de um gás em recipiente fechado variam em sentidos opostos (lei de Boyle), basta mudar o volume do tórax para criar a diferença de pressão que movimenta o ar.' },
      { steps: { t: 'inspiração', items: [
        'O diafragma contrai e desce; os intercostais externos contraem e elevam as costelas.',
        'O volume da caixa torácica aumenta, e o pulmão, preso à parede pelas pleuras, acompanha.',
        'A pressão dentro dos alvéolos fica menor que a atmosférica.',
        'O ar entra pelas vias aéreas até a pressão se igualar.'] } },
      { steps: { t: 'expiração em repouso', items: [
        'Diafragma e intercostais relaxam; o recuo elástico dos pulmões e da caixa torácica reduz o volume.',
        'A pressão alveolar passa a ser maior que a atmosférica.',
        'O ar sai. Em repouso, esse movimento é passivo, sem gasto direto de energia pelos músculos.'] } },
      { table: { cap: 'Volumes pulmonares típicos de um adulto jovem em repouso (valores aproximados; variam com idade, sexo e altura)', head: ['Medida', 'Significado', 'Valor aproximado'], rows: [
        ['Volume corrente', 'Ar que entra e sai a cada ciclo normal', '≈ 500 mL'],
        ['Volume de reserva inspiratório', 'Ar que ainda pode entrar após uma inspiração normal', '≈ 3 000 mL'],
        ['Volume de reserva expiratório', 'Ar que ainda pode sair após uma expiração normal', '≈ 1 100 mL'],
        ['Volume residual', 'Ar que permanece nos pulmões após expiração máxima', '≈ 1 200 mL'],
        ['Capacidade vital', 'Maior volume que se consegue expirar após inspirar ao máximo', '≈ 4 600 mL']] } },
      { p: 'Os alvéolos tendem a colapsar porque a água que os reveste cria tensão superficial. Células especiais (pneumócitos tipo II) produzem o surfactante, mistura de lipídios e proteínas que reduz essa tensão. Bebês prematuros muito precoces podem ter pouco surfactante e desenvolver a síndrome do desconforto respiratório.' },
    ] },
    { ch: 'Cap. 3, Gases e sangue', t: 'Hematose e transporte', h: 'Do ar do alvéolo à mitocôndria', m: { micro: 'alveolo' }, b: [
      { p: 'A troca de gases acontece por difusão simples: cada gás se move do local onde sua pressão parcial é maior para onde é menor, sem gasto de energia. No alvéolo, a pressão parcial de O₂ é cerca de 100 mmHg e a do sangue que chega dos tecidos, cerca de 40 mmHg; por isso o O₂ passa do ar para o sangue. Com o CO₂ ocorre o contrário (cerca de 46 mmHg no sangue venoso e 40 mmHg no alvéolo).' },
      { fig: 'alveolo', cap: 'Alvéolos envolvidos por capilares: a membrana respiratória é formada pelas células do alvéolo, pela parede do capilar e pela membrana basal entre elas.' },
      { p: 'A membrana é muito fina e a área total é grande. A difusão é eficiente quando há grande superfície, pequena espessura e grande diferença de pressão parcial. Doenças que engrossam a membrana (fibrose) ou destroem alvéolos (enfisema) reduzem a hematose.' },
      { table: { cap: 'Transporte dos gases no sangue', head: ['Gás', 'Formas de transporte', 'Detalhes'], rows: [
        ['O₂', 'Cerca de 98% ligado à hemoglobina nas hemácias; cerca de 2% dissolvido no plasma', 'Cada molécula de hemoglobina liga até 4 O₂ e muda de cor (oxihemoglobina é mais vermelha-viva).'],
        ['CO₂', 'Cerca de 70% como íon bicarbonato (HCO₃⁻); 20% a 25% ligado à hemoglobina; cerca de 7% dissolvido', 'Nas hemácias, a anidrase carbônica acelera CO₂ + H₂O ⇌ H₂CO₃ ⇌ H⁺ + HCO₃⁻.']] } },
      { p: 'A hemoglobina libera mais O₂ onde ele é mais necessário: tecidos em atividade têm mais CO₂, menor pH e maior temperatura, o que diminui a afinidade da hemoglobina pelo O₂ (efeito Bohr). O monóxido de carbono (CO), produzido por combustão incompleta, tem afinidade cerca de 200 vezes maior pela hemoglobina que o O₂ e impede o transporte do oxigênio, razão pela qual é tão perigoso em ambientes fechados.' },
      { note: ['Altitude', 'Em grandes altitudes a pressão do ar é menor, a pressão parcial de O₂ cai e a hemoglobina fica menos saturada. Em semanas, o organismo aumenta a produção do hormônio eritropoetina nos rins, que estimula a medula óssea a formar mais hemácias.'] },
    ] },
    { ch: 'Cap. 4, Controle', t: 'Controle da respiração', h: 'O que faz o ritmo respiratório mudar', m: { sys: ['respiratorio', 'nervoso'] }, b: [
      { p: 'O ritmo básico nasce no bulbo (tronco encefálico), cujos neurônios enviam sinais ao diafragma e aos intercostais, e é ajustado pela ponte. Mesmo assim podemos controlar a respiração por alguns instantes, pelo córtex cerebral. O ritmo é ajustado por sensores químicos.' },
      { cols: [['Quimiorreceptores centrais (bulbo)', 'Detectam o aumento de H⁺ no líquido que banha o encéfalo, causado pelo aumento de CO₂ no sangue. É o principal estímulo da respiração.'], ['Quimiorreceptores periféricos (corpos carotídeos e aórticos)', 'Respondem à queda importante de O₂, ao aumento de CO₂ e à queda do pH do sangue.'], ['Receptores de estiramento nos pulmões', 'Evitam a insuflação excessiva do pulmão.']] },
      { steps: { t: 'resposta ao exercício', items: [
        'Os músculos aumentam o consumo de O₂ e produzem mais CO₂.',
        'A concentração de CO₂ e de H⁺ no sangue sobe e o pH cai ligeiramente.',
        'Os quimiorreceptores enviam sinais ao bulbo.',
        'A frequência e a profundidade da respiração aumentam; o coração também acelera.',
        'Mais CO₂ é eliminado, o pH volta ao normal e o estímulo diminui (retroalimentação negativa).'] } },
      { warn: ['“A falta de oxigênio é o que nos faz respirar.”', 'No dia a dia, o principal estímulo é o aumento de CO₂ (e a consequente queda do pH). Por isso hiperventilar de propósito antes de mergulhar é perigoso: elimina CO₂, retarda a vontade de respirar e a pessoa pode desmaiar por falta de O₂ sem perceber.'] },
    ] },
    { ch: 'Cap. 5, Saúde', t: 'Doenças respiratórias e saúde pública', h: 'O que adoece o pulmão e como prevenir', m: { sys: ['respiratorio'] }, b: [
      { table: { cap: 'Principais problemas respiratórios', head: ['Condição', 'Causa', 'O que acontece', 'Prevenção e cuidado'], rows: [
        ['Asma', 'Inflamação crônica das vias aéreas, com alérgenos e outros gatilhos', 'Broncoconstrição reversível, chiado e falta de ar', 'Evitar gatilhos; broncodilatadores e corticoides inalatórios sob orientação'],
        ['DPOC (bronquite crônica e enfisema)', 'Principalmente tabagismo prolongado e poluição', 'Obstrução progressiva do fluxo de ar e destruição de alvéolos', 'Não fumar; parar de fumar reduz o risco'],
        ['Pneumonia', 'Vírus, bactérias ou fungos nos alvéolos', 'Alvéolos preenchidos por secreção; febre e tosse', 'Vacinas (pneumocócica, influenza), higiene das mãos'],
        ['Tuberculose', 'Bactéria Mycobacterium tuberculosis, transmitida por gotículas e aerossóis', 'Lesões nos pulmões; tosse prolongada, emagrecimento', 'Diagnóstico precoce; tratamento prolongado e gratuito no SUS; vacina BCG protege contra formas graves em crianças'],
        ['Influenza e covid-19', 'Vírus respiratórios', 'Infecção das vias aéreas e dos pulmões', 'Vacinação conforme o calendário; ventilar ambientes'],
        ['Câncer de pulmão', 'Associado ao tabagismo (e a outros agentes, como o radônio e o amianto)', 'Tumor no pulmão', 'Não fumar; evitar exposição ocupacional'],
        ['Fibrose cística', 'Doença genética recessiva', 'Muco espesso nas vias aéreas e infecções frequentes', 'Acompanhamento e triagem neonatal']] } },
      { p: 'O tabagismo é a principal causa evitável de doenças respiratórias e cardiovasculares. A fumaça contém milhares de substâncias, entre elas monóxido de carbono, nicotina (que causa dependência) e substâncias cancerígenas. No Brasil existem leis que restringem o fumo em ambientes coletivos, e o SUS oferece tratamento para quem quer parar. A poluição do ar, por veículos e queimadas, também aumenta internações por doenças respiratórias.' },
    ] },
    { ch: 'Cap. 6, Integração', t: 'O respiratório e o resto do corpo', h: 'Oxigênio é inútil sem transporte', m: { sys: ['respiratorio', 'cardiovascular'] }, b: [
      { cols: [['Cardiovascular', 'O ventrículo direito envia o sangue aos pulmões pela circulação pulmonar; as veias pulmonares trazem o sangue oxigenado ao átrio esquerdo. Sem a circulação, o O₂ não chega às células.'], ['Nervoso', 'Bulbo e ponte geram e ajustam o ritmo respiratório, e o córtex permite controle voluntário (fala, mergulho, canto).'], ['Urinário', 'Pulmões e rins regulam juntos o pH do sangue: os pulmões eliminam CO₂; os rins excretam H⁺ e reabsorvem bicarbonato.']] },
      { p: 'No exercício físico, o aumento da frequência cardíaca e da ventilação ocorre de forma integrada para elevar a oferta de O₂ aos músculos. Na altitude e em doenças respiratórias crônicas, a medula óssea e o coração se adaptam. Essas conexões são a base de muitas questões que combinam sistemas.' },
      { recall: ['Por que um acidente de trânsito que fratura várias costelas pode comprometer a respiração?', 'Porque as costelas fazem parte do mecanismo de aumento do volume do tórax e também protegem a pleura; a dor limita o movimento e pode ocorrer pneumotórax.'] },
    ] },
  ],
  sint: {
    text: 'O ar passa pelas vias de condução, onde é aquecido, umedecido e filtrado, e chega aos alvéolos. A inspiração ocorre quando o diafragma e os intercostais aumentam o volume do tórax e a pressão alveolar cai. A difusão de O₂ e CO₂ depende das pressões parciais; o sangue transporta o O₂ principalmente ligado à hemoglobina e o CO₂ principalmente como bicarbonato. O bulbo controla o ritmo respiratório de acordo com o CO₂ e o pH do sangue.',
    conf: [
      ['Ventilação × respiração celular', 'Ventilação é o movimento do ar nos pulmões; respiração celular é a produção de ATP nas células.'],
      ['Inspiração × expiração', 'Na inspiração, o diafragma contrai e desce. Na expiração em repouso, relaxa e sobe.'],
      ['Principal estímulo da respiração', 'É o aumento de CO₂ (queda do pH), e não a falta de O₂.'],
      ['Hemoglobina × CO', 'O monóxido de carbono tem afinidade muito maior pela hemoglobina e bloqueia o transporte de O₂.']],
    cards: [
      ['Onde ocorre a hematose?', 'Nos alvéolos, por difusão entre o ar alveolar e o sangue dos capilares.'],
      ['Que músculo é o principal da inspiração?', 'O diafragma.'],
      ['O que é o surfactante?', 'Substância que reduz a tensão superficial nos alvéolos e evita seu colapso.'],
      ['Como o CO₂ é transportado majoritariamente?', 'Como íon bicarbonato (HCO₃⁻) no plasma, formado nas hemácias com ajuda da anidrase carbônica.'],
      ['Por que o monóxido de carbono é tão perigoso?', 'Porque tem afinidade cerca de 200 vezes maior pela hemoglobina que o O₂ e impede o transporte de oxigênio.'],
      ['Que região do encéfalo controla o ritmo respiratório?', 'O bulbo, com ajuda da ponte.'],
      ['O que faz o epitélio ciliado da traqueia?', 'Move o muco com as partículas em direção à faringe, mantendo as vias limpas.']],
  },
};
