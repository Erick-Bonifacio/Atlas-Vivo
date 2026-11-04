// Atlas Vivo — aula aprofundada: organização do corpo e homeostase. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).organizacao = {
  dur: 55,
  lead: 'A linguagem da anatomia, os níveis de organização, as células e seus transportes e a ideia que une todos os sistemas: a homeostase.',
  goals: [
    'Usar a terminologia anatômica: planos, posições, regiões e cavidades.',
    'Relacionar os níveis de organização, dos átomos ao organismo, e os quatro tecidos básicos.',
    'Descrever a membrana plasmática, as principais organelas e os tipos de transporte.',
    'Explicar homeostase e retroalimentação negativa e positiva com exemplos.',
    'Reconhecer os sistemas do corpo e suas funções gerais.'],
  enem: [
    'Transporte através da membrana: difusão, osmose, transporte ativo e fagocitose.',
    'Organelas e suas funções (mitocôndria, ribossomo, lisossomo, complexo de Golgi).',
    'Homeostase e retroalimentação: glicemia, temperatura, pressão arterial.',
    'Tecidos: epitelial, conjuntivo, muscular e nervoso e seus exemplos.',
    'Células-tronco, câncer como descontrole do ciclo celular.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 1–4: Organização do corpo e células', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, A linguagem', t: 'Terminologia anatômica', h: 'Como descrever onde está cada coisa', m: { sys: [] }, b: [
      { p: 'Para ler um atlas, uma prova ou um laudo é preciso usar o mesmo sistema de referência. A descrição parte da posição anatômica: pessoa em pé, olhando para frente, braços ao lado do corpo com as palmas voltadas para frente. Direita e esquerda sempre se referem ao lado da pessoa descrita, e não ao do observador; por isso, em uma vista frontal, o lado direito do corpo aparece à esquerda de quem olha.' },
      { fig: 'r-corpo', cap: 'O corpo como conjunto de sistemas. No Atlas, cada sistema pode ser isolado e estudado.' },
      { table: { cap: 'Termos de posição e direção', head: ['Termo', 'Significado', 'Exemplo'], rows: [
        ['Anterior (ventral) × posterior (dorsal)', 'Frente × costas', 'O esterno é anterior ao coração'],
        ['Superior (cranial) × inferior (caudal)', 'Mais perto da cabeça × mais perto dos pés', 'O estômago é superior ao intestino grosso (colo transverso, em geral)'],
        ['Medial × lateral', 'Mais perto do plano mediano × mais longe', 'O nariz é medial em relação aos olhos'],
        ['Proximal × distal', 'Mais perto × mais longe da raiz do membro', 'O cotovelo é proximal ao punho'],
        ['Superficial × profundo', 'Mais perto × mais longe da superfície', 'A pele é superficial aos músculos']] } },
      { table: { cap: 'Planos de corte', head: ['Plano', 'Divide o corpo em'], rows: [
        ['Sagital (mediano, se passa no meio)', 'Direita e esquerda'],
        ['Frontal (coronal)', 'Anterior e posterior'],
        ['Transversal (axial)', 'Superior e inferior']] } },
    ] },
    { ch: 'Cap. 1, A linguagem', t: 'Cavidades e regiões', h: 'Onde ficam os órgãos', m: { sys: ['digestorio', 'respiratorio', 'cardiovascular'] }, b: [
      { p: 'O corpo tem duas grandes cavidades. A dorsal, na parte de trás, tem a cavidade craniana (encéfalo) e a vertebral (medula espinal). A ventral, na frente, é dividida pelo diafragma: a cavidade torácica (pulmões em suas pleuras, coração no pericárdio e o espaço central, o mediastino, com traqueia, esôfago e grandes vasos) e a cavidade abdominopélvica (órgãos do abdome e da pelve, envoltos pelo peritônio).' },
      { ul: ['Para localizar uma dor ou um órgão, o abdome é dividido em quatro quadrantes por duas linhas que se cruzam no umbigo: superior direito (fígado, vesícula), superior esquerdo (estômago, baço), inferior direito (apêndice), inferior esquerdo (parte do colo).', 'O Atlas 3D mostra camadas por sistema; use essa vista para comparar estruturas “vizinhas” e “profundas”.'] },
      { recall: ['Em qual cavidade fica o coração e o que o separa do abdome?', 'Na cavidade torácica (mediastino), dentro do pericárdio. O diafragma separa o tórax do abdome.'] },
    ] },
    { ch: 'Cap. 2, Do átomo ao organismo', t: 'Níveis de organização e tecidos', h: 'Cada nível depende do anterior', m: { sys: [] }, b: [
      { p: 'Átomos formam moléculas, que formam organelas e células. Células semelhantes e com a mesma função formam um tecido. Tecidos diferentes se combinam em um órgão, e órgãos que cooperam em uma função formam um sistema. Os sistemas reunidos constituem o organismo.' },
      { fig: 'niveis', cap: 'Níveis de organização: 1 átomo; 2 molécula; 3 célula; 4 tecido; 5 órgão; 6 sistema; 7 organismo.' },
      { table: { cap: 'Tecidos básicos', head: ['Tecido', 'Características', 'Exemplos'], rows: [
        ['Epitelial', 'Células justapostas, pouca matriz; reveste superfícies e forma glândulas; sem vasos (nutrição por difusão)', 'Epiderme, revestimento do intestino, glândulas'],
        ['Conjuntivo', 'Células dispersas em matriz abundante; sustenta, une, preenche e transporta', 'Tecido frouxo, adiposo, cartilagem, osso, sangue'],
        ['Muscular', 'Células contráteis', 'Esquelético, cardíaco, liso'],
        ['Nervoso', 'Neurônios e glia; recebem e conduzem impulsos', 'Encéfalo, medula, nervos']] } },
      { p: 'Os órgãos combinam vários tecidos: o estômago tem epitélio (revestimento e glândulas), tecido conjuntivo (sustentação), músculo liso (movimentos) e tecido nervoso (controle). Membranas são lâminas de epitélio e conjuntivo que revestem cavidades: mucosas (em contato com o exterior), serosas (pleura, peritônio, pericárdio), sinoviais (articulações) e a cutânea (pele).' },
    ] },
    { ch: 'Cap. 3, A célula', t: 'Membrana e organelas', h: 'A unidade da vida', m: { sys: [] }, b: [
      { p: 'A membrana plasmática é uma bicamada de fosfolipídios com proteínas. É seletivamente permeável: controla o que entra e o que sai. Em seu interior, o citoplasma contém organelas, estruturas com funções específicas.' },
      { table: { cap: 'Organelas e funções', head: ['Organela', 'Função', 'Importância no corpo'], rows: [
        ['Núcleo', 'Guarda o DNA e controla a atividade da célula', 'Hemácias maduras de mamíferos o perdem'],
        ['Mitocôndria', 'Respiração celular aeróbica: produz a maior parte do ATP', 'Muito numerosa em músculo e fígado'],
        ['Ribossomos', 'Síntese de proteínas', 'Livres ou ligados ao retículo'],
        ['Retículo endoplasmático rugoso e liso', 'Rugoso: síntese e processamento de proteínas; liso: lipídios e desintoxicação', 'Liso abundante no fígado'],
        ['Complexo de Golgi', 'Modifica, empacota e distribui proteínas', 'Células secretoras (glândulas)'],
        ['Lisossomos', 'Digestão intracelular', 'Fagócitos, como os neutrófilos e macrófagos, os usam'],
        ['Citoesqueleto', 'Forma, movimento, divisão', 'Cílios e flagelos (espermatozoide)']] } },
      { table: { cap: 'Transporte através da membrana', head: ['Tipo', 'Como ocorre', 'Gasta ATP?', 'Exemplo'], rows: [
        ['Difusão simples', 'Soluto passa do mais para o menos concentrado', 'Não', 'O₂ e CO₂ nos alvéolos'],
        ['Osmose', 'Água passa para o lado de maior concentração de soluto', 'Não', 'Água nos rins e nas hemácias'],
        ['Difusão facilitada', 'Proteínas transportadoras a favor do gradiente', 'Não', 'Glicose entrando em células'],
        ['Transporte ativo', 'Proteínas bombeiam contra o gradiente', 'Sim', 'Bomba de Na⁺/K⁺'],
        ['Endocitose (fagocitose, pinocitose) e exocitose', 'Vesículas levam material para dentro ou para fora', 'Sim', 'Fagocitose de bactéria; liberação de neurotransmissor']] } },
      { warn: ['“Em solução com muito sal, a água entra na célula.”', 'A água segue para o lado com mais soluto. Uma célula em solução hipertônica (muito sal) perde água e murcha; em solução hipotônica, ganha água e pode estourar (as hemácias). O soro fisiológico (0,9% de NaCl) é isotônico em relação ao sangue.'] },
    ] },
    { ch: 'Cap. 4, Equilíbrio', t: 'Homeostase', h: 'Equilíbrio dinâmico', m: { sys: ['nervoso', 'endocrino'] }, b: [
      { p: 'Homeostase é a manutenção do meio interno (temperatura, glicose, água, íons, pH, pressão) dentro de limites compatíveis com a vida. As variáveis oscilam; o que se mantém é a faixa. O líquido que banha as células, o meio interno, deve ter composição relativamente estável para que as células funcionem.' },
      { cols: [['Receptor (sensor)', 'Detecta a variável. Ex.: termorreceptores, barorreceptores, células beta do pâncreas (sensíveis à glicose).'], ['Centro de controle', 'Compara com o valor de referência e decide. Ex.: hipotálamo, bulbo, hipófise.'], ['Efetor', 'Executa a resposta. Ex.: glândulas sudoríparas, vasos, músculos, rins.']] },
      { table: { cap: 'Exemplos de retroalimentação negativa', head: ['Variável', 'Sensor', 'Centro de controle', 'Efetores e resposta'], rows: [
        ['Temperatura', 'Termorreceptores', 'Hipotálamo', 'Suor e vasodilatação (calor); tremor e vasoconstrição (frio)'],
        ['Glicemia', 'Células beta e alfa do pâncreas', 'Pâncreas endócrino', 'Insulina reduz; glucagon aumenta'],
        ['Pressão arterial', 'Barorreceptores', 'Bulbo', 'Coração e vasos; rins'],
        ['Água do corpo', 'Osmorreceptores no hipotálamo', 'Hipotálamo e hipófise', 'ADH e rins; sede'],
        ['CO₂ e pH', 'Quimiorreceptores', 'Bulbo', 'Ventilação aumenta ou diminui']] } },
      { steps: { t: 'retroalimentação negativa da temperatura', items: [
        'A temperatura do corpo sobe acima do valor de referência.',
        'Termorreceptores enviam o sinal ao hipotálamo, o centro de controle.',
        'O hipotálamo ativa os efetores: glândulas sudoríparas (suor) e vasos da pele (vasodilatação).',
        'O corpo perde calor, a temperatura cai e o estímulo diminui.'] } },
      { p: 'Na retroalimentação negativa, a resposta reduz o desvio que a provocou; ela estabiliza. Na retroalimentação positiva, a resposta amplifica a alteração inicial até um desfecho: contrações do parto (ocitocina), coagulação do sangue e o pico de LH que leva à ovulação.' },
      { warn: ['“Homeostase é quando nada muda no corpo.”', 'É um equilíbrio dinâmico: o corpo está constantemente corrigindo desvios. A temperatura sobe e desce ao longo do dia, e a glicemia sobe depois de comer; a homeostase mantém a faixa.'] },
    ] },
    { ch: 'Cap. 5, O conjunto', t: 'Os sistemas do corpo', h: 'Onze sistemas, um organismo', m: { sys: ['digestorio', 'respiratorio', 'cardiovascular', 'urinario', 'nervoso', 'endocrino'] }, b: [
      { table: { cap: 'Sistemas e funções gerais', head: ['Sistema', 'Função principal', 'Exemplo de órgão'], rows: [
        ['Tegumentar', 'Barreira, proteção, sensibilidade e termorregulação', 'Pele'],
        ['Esquelético', 'Sustentação, proteção, reserva de minerais e produção de sangue', 'Fêmur'],
        ['Muscular', 'Movimento, postura e produção de calor', 'Bíceps braquial'],
        ['Nervoso', 'Detectar, integrar e responder rapidamente', 'Encéfalo'],
        ['Endócrino', 'Regulação por hormônios', 'Tireoide'],
        ['Cardiovascular', 'Transporte de gases, nutrientes, hormônios e resíduos', 'Coração'],
        ['Linfático e imune', 'Drenagem e defesa', 'Baço, linfonodos'],
        ['Respiratório', 'Trocas gasosas', 'Pulmões'],
        ['Digestório', 'Digestão e absorção', 'Intestino delgado'],
        ['Urinário', 'Filtração, excreção, equilíbrio de água e sais', 'Rins'],
        ['Reprodutor', 'Produção de gametas, hormônios sexuais e gestação', 'Ovários, testículos']] } },
      { note: ['Cerca de 60% do peso do corpo é água', 'Dois terços dessa água estão dentro das células (líquido intracelular) e um terço está fora delas (líquido extracelular, que inclui o plasma e o líquido intersticial). É por isso que a hidratação e o equilíbrio de sais são tão importantes para todos os sistemas.'] },
      { recall: ['Qual sistema conecta os outros por meio do transporte?', 'O cardiovascular, com o sangue (e o linfático, na devolução de líquido). Sem o transporte, nenhum sistema recebe oxigênio e nutrientes nem se livra de resíduos.'] },
    ] },
  ],
  sint: {
    text: 'A anatomia usa posição, direção e planos de corte padronizados. O corpo se organiza em átomos, moléculas, células, tecidos, órgãos, sistemas e organismo. A membrana plasmática controla trocas por difusão, osmose, transporte ativo e vesículas, e as organelas dividem as tarefas da célula. Todos os sistemas contribuem para a homeostase, mantida sobretudo por retroalimentação negativa, com receptor, centro de controle e efetor.',
    conf: [
      ['Tecido × órgão', 'Tecido: células semelhantes. Órgão: diferentes tecidos trabalhando juntos.'],
      ['Direita do corpo × direita de quem olha', 'Em vista frontal, o lado direito do corpo aparece à esquerda do observador.'],
      ['Difusão × transporte ativo', 'Difusão não gasta ATP e vai a favor do gradiente; o ativo gasta ATP e vai contra.'],
      ['Retroalimentação negativa × positiva', 'A negativa reduz o desvio; a positiva o amplifica até um desfecho.']],
    cards: [
      ['Qual é a ordem dos níveis de organização?', 'Átomo, molécula, célula, tecido, órgão, sistema e organismo.'],
      ['Quais são os quatro tecidos básicos?', 'Epitelial, conjuntivo, muscular e nervoso.'],
      ['Qual a organela da respiração celular aeróbica?', 'A mitocôndria.'],
      ['O que é a bomba de sódio e potássio?', 'Proteína de transporte ativo que mantém a diferença de Na⁺ e K⁺ entre os lados da membrana, gastando ATP.'],
      ['Quais os componentes de um mecanismo de regulação?', 'Receptor, centro de controle e efetor.'],
      ['Que plano divide o corpo em frente e costas?', 'O plano frontal (coronal).'],
      ['O que acontece com uma hemácia em solução hipotônica?', 'Ganha água por osmose e pode se romper.']],
  },
};
