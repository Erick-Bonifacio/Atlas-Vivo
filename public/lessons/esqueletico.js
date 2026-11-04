// Atlas Vivo — aula aprofundada: sistema esquelético. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).esqueletico = {
  dur: 50,
  lead: 'Do tecido ósseo à articulação: como os ossos se formam, se renovam, sustentam o corpo e guardam cálcio e células do sangue.',
  goals: [
    'Descrever o tecido ósseo, suas células e a estrutura do osso compacto e esponjoso.',
    'Organizar o esqueleto em axial e apendicular e classificar os ossos.',
    'Explicar crescimento, remodelação e consolidação de fraturas.',
    'Distinguir os tipos de articulação e identificar partes de uma articulação sinovial.',
    'Relacionar nutrição, hormônios e atividade física à saúde dos ossos.'],
  enem: [
    'Funções do esqueleto: suporte, proteção, movimento, reserva de cálcio, formação de células sanguíneas.',
    'Osteoporose, raquitismo, vitamina D e cálcio.',
    'Articulações, ligamentos e tendões; luxação, entorse e fratura.',
    'Medula óssea e transplante; formação do sangue.',
    'Adaptações do esqueleto (bipedismo, coluna em curvas).'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, caps. 6–9: Sistema esquelético', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/6-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, O osso', t: 'Funções e tecido ósseo', h: 'Um tecido vivo e em renovação constante', m: { sys: ['esqueletico'] }, b: [
      { p: 'O esqueleto não é uma estrutura inerte. Seus ossos têm vasos, nervos e células vivas, e se renovam durante toda a vida. Suas funções são: sustentar o corpo; proteger órgãos (crânio, caixa torácica, coluna); servir de alavanca para os músculos, permitindo o movimento; armazenar minerais, principalmente cálcio e fósforo; produzir células do sangue na medula óssea vermelha; e guardar energia como gordura na medula amarela.' },
      { fig: 'r-esqueletico', cap: 'O esqueleto em vista frontal.' },
      { p: 'O osso é um tecido conjuntivo com matriz mineralizada. A matriz tem fibras de colágeno, que dão flexibilidade, e cristais de hidroxiapatita (fosfato de cálcio), que dão dureza. Sem os minerais, o osso seria flexível demais; sem o colágeno, quebradiço.' },
      { table: { cap: 'Células do tecido ósseo', head: ['Célula', 'Função'], rows: [
        ['Osteoblasto', 'Forma matriz nova e a mineraliza'],
        ['Osteócito', 'Osteoblasto aprisionado na matriz; mantém o tecido e percebe cargas mecânicas'],
        ['Osteoclasto', 'Célula grande que reabsorve (dissolve) o osso, liberando cálcio'],
        ['Células osteoprogenitoras', 'Dão origem a osteoblastos']] } },
      { recall: ['Se o osso é tão duro, por que ele precisa de colágeno?', 'Porque o colágeno dá flexibilidade e resistência à tração. Só mineral, o osso seria muito frágil; só colágeno, seria mole.'] },
    ] },
    { ch: 'Cap. 1, O osso', t: 'Estrutura de um osso', h: 'Compacto por fora, esponjoso por dentro', m: { sys: ['esqueletico'] }, b: [
      { p: 'Em um osso longo, como o fêmur, a diáfise (corpo) é de osso compacto e envolve o canal medular, ocupado por medula. As epífises (extremidades) têm osso esponjoso por dentro, uma rede de trabéculas que reduz o peso e resiste às forças em várias direções, e uma camada fina de osso compacto por fora. As epífises são recobertas por cartilagem articular. O periósteo, membrana externa rica em vasos e nervos, nutre o osso e participa da regeneração.' },
      { ul: ['O osso compacto é formado por unidades cilíndricas, os ósteons (sistemas de Havers), com um canal central por onde passam vasos e nervos.', 'A medula óssea vermelha, que produz células do sangue, ocupa o osso esponjoso de ossos como esterno, costelas, vértebras e a pelve; a amarela, rica em gordura, ocupa a diáfise dos ossos longos de adultos.'] },
      { table: { cap: 'Classificação dos ossos pela forma', head: ['Tipo', 'Exemplos', 'Característica'], rows: [
        ['Longos', 'Fêmur, úmero, tíbia', 'Comprimento maior que a largura; alavancas'],
        ['Curtos', 'Ossos do carpo e do tarso', 'Cúbicos; dão estabilidade com mobilidade limitada'],
        ['Planos', 'Ossos do crânio, esterno, costelas', 'Protegem e oferecem áreas para músculos'],
        ['Irregulares', 'Vértebras, ossos da face', 'Forma complexa'],
        ['Sesamoides', 'Patela (rótula)', 'Pequenos, dentro de tendões']] } },
    ] },
    { ch: 'Cap. 2, O esqueleto', t: 'Esqueleto axial e apendicular', h: '206 ossos em dois grupos', m: { sys: ['esqueletico'] }, b: [
      { p: 'O esqueleto adulto tem, em geral, 206 ossos. O esqueleto axial forma o eixo do corpo; o esqueleto apendicular une os membros ao eixo pelas cinturas escapular e pélvica.' },
      { fig: 'esqueleto', cap: 'Esqueleto axial em destaque: crânio, coluna vertebral e caixa torácica.' },
      { table: { cap: 'Organização do esqueleto', head: ['Divisão', 'Componentes', 'Nº de ossos (adulto)'], rows: [
        ['Crânio', '8 ossos do neurocrânio e 14 da face', '22'],
        ['Ossículos da orelha e hioide', 'Martelo, bigorna e estribo (de cada lado) e osso hioide', '7'],
        ['Coluna vertebral', '7 cervicais, 12 torácicas, 5 lombares, sacro e cóccix (vértebras fundidas)', '26'],
        ['Caixa torácica', '12 pares de costelas e o esterno', '25'],
        ['Total do esqueleto axial', '', '80'],
        ['Cinturas e membros superiores', 'Clavícula, escápula, úmero, rádio, ulna, ossos da mão', '64'],
        ['Cinturas e membros inferiores', 'Ossos do quadril, fêmur, patela, tíbia, fíbula, ossos do pé', '62'],
        ['Total do esqueleto apendicular', '', '126']] } },
      { p: 'A coluna vertebral tem quatro curvaturas (cervical, torácica, lombar e sacral) que absorvem impactos e permitem o equilíbrio na postura bípede. Entre as vértebras há discos de cartilagem fibrosa. O desvio lateral da coluna é a escoliose; o aumento da curvatura lombar, a lordose; o da torácica, a cifose. Em recém-nascidos há mais ossos, que depois se fundem.' },
    ] },
    { ch: 'Cap. 3, Dinâmica', t: 'Crescimento, remodelação e fraturas', h: 'O osso se refaz', m: { sys: ['esqueletico'] }, b: [
      { p: 'O esqueleto do embrião é de cartilagem ou de membranas conjuntivas. Na ossificação intramembranosa, osso se forma direto sobre membrana de tecido conjuntivo; é como surgem os ossos planos do crânio. Na ossificação endocondral, um molde de cartilagem hialina é substituído por osso; é como se formam a maioria dos ossos, inclusive os ossos longos.' },
      { p: 'Os ossos longos crescem em comprimento nas cartilagens de crescimento (placas epifisárias), entre a diáfise e as epífises. O hormônio do crescimento (GH), os hormônios da tireoide e os hormônios sexuais controlam esse processo. Na adolescência avançada, as placas se fecham e o crescimento em estatura termina.' },
      { p: 'Mesmo adulto, o osso se renova: osteoclastos removem osso velho e osteoblastos formam o novo (remodelação). Esse processo mantém o cálcio do sangue (controlado pelo paratormônio e pela calcitonina) e adapta o osso à carga: exercícios com impacto aumentam a massa óssea; inatividade prolongada a reduz.' },
      { steps: { t: 'consolidação de uma fratura', items: [
        'O vaso rompido forma um hematoma no local.',
        'Células formam o calo mole de cartilagem e tecido fibroso que une as extremidades.',
        'Osteoblastos substituem o calo mole pelo calo ósseo (osso esponjoso).',
        'Com o tempo, o osso é remodelado e recupera o formato e a resistência.'] } },
    ] },
    { ch: 'Cap. 3, Dinâmica', t: 'Articulações', h: 'Onde os ossos se encontram', m: { sys: ['esqueletico', 'muscular'] }, b: [
      { table: { cap: 'Tipos de articulação por estrutura', head: ['Tipo', 'Exemplos', 'Mobilidade'], rows: [
        ['Fibrosas', 'Suturas do crânio', 'Praticamente nenhuma'],
        ['Cartilagíneas', 'Discos entre vértebras; sínfise púbica', 'Pequena'],
        ['Sinoviais', 'Joelho, ombro, quadril, cotovelo', 'Grande; a maioria das articulações dos membros']] } },
      { fig: 'articulacao', cap: 'Articulação sinovial: cartilagem, cápsula, ligamentos, tendões e músculos.' },
      { p: 'A articulação sinovial tem uma cápsula que envolve a cavidade articular, preenchida com líquido sinovial, que lubrifica e nutre a cartilagem. Ligamentos ligam osso com osso e estabilizam a articulação; tendões ligam músculo a osso. Meniscos, no joelho, amortecem impactos. Os tipos mais comuns são: gínglimo (dobradiça: cotovelo), esferoide (ombro e quadril, de grande liberdade) e pivô (rotação da cabeça).' },
      { table: { cap: 'Lesões comuns', head: ['Lesão', 'O que é'], rows: [
        ['Fratura', 'Ruptura do osso'],
        ['Luxação', 'Deslocamento das extremidades ósseas, com perda do contato articular'],
        ['Entorse', 'Estiramento ou ruptura de ligamentos'],
        ['Distensão', 'Estiramento ou ruptura de fibras musculares ou tendões'],
        ['Artrose (osteoartrite)', 'Desgaste da cartilagem articular, mais comum com a idade'],
        ['Artrite reumatoide', 'Doença autoimune que inflama a membrana sinovial']] } },
    ] },
    { ch: 'Cap. 4, Saúde', t: 'Nutrição, hormônios e doenças ósseas', h: 'Cálcio, vitamina D e carga', m: { sys: ['esqueletico', 'endocrino'] }, b: [
      { p: 'A saúde do osso depende de ingestão de cálcio e fósforo, de vitamina D (produzida na pele sob luz solar e obtida em alguns alimentos), de proteínas, de hormônios (PTH, calcitonina, GH, estrógenos, testosterona, tireoidianos) e de atividade física com carga. Fumar e o consumo excessivo de álcool reduzem a massa óssea.' },
      { table: { cap: 'Doenças ósseas', head: ['Condição', 'O que acontece', 'Prevenção'], rows: [
        ['Osteoporose', 'Perda de massa óssea e de qualidade da microarquitetura, com risco aumentado de fratura; frequente em mulheres após a menopausa (queda de estrógenos) e em idosos', 'Cálcio, vitamina D, exercício com carga, não fumar; tratamento médico'],
        ['Raquitismo', 'Falha na mineralização do osso em crescimento, por falta de vitamina D, cálcio ou fósforo; pernas arqueadas', 'Exposição ao sol, alimentação adequada'],
        ['Osteomalácia', 'Equivalente do raquitismo em adultos', 'Idem'],
        ['Câncer ósseo e metástases', 'Tumores primários (osteossarcoma) ou metástases', 'Diagnóstico precoce']] } },
      { warn: ['“Beber leite basta para ter ossos fortes.”', 'Beber leite não basta: sem vitamina D a absorção de cálcio é pequena, e sem exercício com carga o osso não recebe o estímulo para se manter. Dieta, sol e atividade física atuam juntos.'] },
    ] },
    { ch: 'Cap. 5, Integração', t: 'Medula óssea e outros sistemas', h: 'Mais do que sustentar', m: { sys: ['esqueletico', 'muscular', 'cardiovascular'] }, b: [
      { p: 'A medula óssea vermelha contém células-tronco hematopoiéticas, que originam hemácias, leucócitos e plaquetas. O transplante de medula óssea substitui essas células em doenças como leucemias; requer compatibilidade genética (HLA) entre doador e receptor, e no Brasil há um cadastro nacional de doadores voluntários.' },
      { cols: [['Muscular', 'Músculos puxam os ossos por tendões; as contrações geram a força que remodela o osso.'], ['Cardiovascular', 'Os ossos produzem as células do sangue; o cálcio ósseo participa da coagulação e da contração do coração.'], ['Endócrino e urinário', 'Hormônios regulam o cálcio ósseo; os rins ativam a vitamina D e eliminam o excesso de minerais.']] },
      { recall: ['Por que astronautas perdem massa óssea em viagens longas?', 'Porque, sem gravidade, os ossos recebem pouca carga; os osteoclastos reabsorvem mais do que os osteoblastos formam.'] },
    ] },
  ],
  sint: {
    text: 'O esqueleto sustenta, protege, permite o movimento, guarda cálcio e fósforo e abriga a medula óssea que forma as células do sangue. O osso é um tecido vivo, com matriz de colágeno e minerais, renovado por osteoclastos e osteoblastos. Articulações, ligamentos e tendões ligam os ossos entre si e aos músculos. Cálcio, vitamina D, hormônios e exercício com carga mantêm os ossos fortes ao longo da vida.',
    conf: [
      ['Ligamento × tendão', 'Ligamento une osso com osso; tendão une músculo com osso.'],
      ['Osteoblasto × osteoclasto', 'Osteoblasto forma osso; osteoclasto reabsorve.'],
      ['Osso compacto × esponjoso', 'Compacto: camada densa externa. Esponjoso: trabéculas internas, com medula.'],
      ['Entorse × luxação × fratura', 'Entorse: ligamento. Luxação: osso fora da articulação. Fratura: osso quebrado.']],
    cards: [
      ['Quantos ossos tem o esqueleto adulto?', '206, em geral (80 no axial e 126 no apendicular).'],
      ['Que células formam osso novo?', 'Osteoblastos.'],
      ['Onde é produzido o sangue no adulto?', 'Na medula óssea vermelha, principalmente em ossos chatos e nas epífises.'],
      ['Qual a função da vitamina D no osso?', 'Aumenta a absorção intestinal de cálcio, permitindo a mineralização.'],
      ['O que é osteoporose?', 'Perda de massa e qualidade do osso, com risco aumentado de fraturas.'],
      ['Como crescem os ossos longos?', 'Nas placas epifisárias, até que se fechem no fim da adolescência.'],
      ['O que é líquido sinovial?', 'Líquido que lubrifica e nutre a cartilagem das articulações sinoviais.']],
  },
};
