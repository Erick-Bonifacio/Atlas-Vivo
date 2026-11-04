// Atlas Vivo — aula aprofundada: sistema endócrino. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).endocrino = {
  dur: 55,
  lead: 'Como glândulas e células liberam hormônios no sangue, como eles encontram seus alvos e como o corpo mantém o equilíbrio por retroalimentação.',
  goals: [
    'Diferenciar glândulas endócrinas e exócrinas e classificar hormônios por natureza química.',
    'Entender o eixo hipotálamo–hipófise e o controle da tireoide, das suprarrenais e das gônadas.',
    'Explicar a regulação da glicemia por insulina e glucagon e os tipos de diabetes.',
    'Interpretar a resposta ao estresse e o uso de hormônios na medicina e no esporte.',
    'Relacionar o sistema endócrino ao sistema nervoso e aos demais sistemas.'],
  enem: [
    'Insulina, glucagon, diabetes e glicemia.',
    'Retroalimentação negativa: tireoide, hipófise, cálcio.',
    'Hipotálamo e hipófise; hormônios do crescimento; ADH.',
    'Adrenalina e cortisol: resposta ao estresse.',
    'Anabolizantes, anticoncepcionais hormonais e hormônios sexuais.',
    'Iodo e o bócio endêmico; sal iodado como política pública.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 17: O sistema endócrino', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/17-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Bases', t: 'Comunicação por hormônios', h: 'Mensageiros no sangue', m: { sys: ['endocrino'] }, b: [
      { p: 'Hormônios são substâncias liberadas por glândulas endócrinas (que não têm ductos e lançam seus produtos diretamente no sangue) e por células especializadas de vários órgãos. Chegam a todo o corpo, mas só atuam nas células-alvo que têm o receptor certo. Glândulas exócrinas, ao contrário, liberam seus produtos por ductos, como a saliva e o suor.' },
      { fig: 'endocrino', cap: 'Principais glândulas endócrinas no corpo feminino e no masculino.' },
      { table: { cap: 'Tipos de hormônio', head: ['Tipo', 'Exemplos', 'Como atuam'], rows: [
        ['Peptídeos e proteínas', 'Insulina, glucagon, GH, ADH, ocitocina', 'Não atravessam a membrana: ligam-se a receptores na superfície e desencadeiam sinais dentro da célula (segundos a minutos)'],
        ['Esteroides (derivados do colesterol)', 'Cortisol, aldosterona, testosterona, estrógenos, progesterona', 'Atravessam a membrana, ligam-se a receptores no interior e alteram a expressão de genes (horas)'],
        ['Derivados de aminoácidos', 'Adrenalina, noradrenalina, hormônios da tireoide, melatonina', 'Adrenalina atua na superfície; tireoidianos, no interior']] } },
      { table: { cap: 'Sistema nervoso × sistema endócrino', head: ['Aspecto', 'Nervoso', 'Endócrino'], rows: [
        ['Mensageiro', 'Impulso elétrico e neurotransmissores', 'Hormônios no sangue'],
        ['Velocidade', 'Milissegundos', 'Segundos a horas'],
        ['Duração do efeito', 'Curta', 'Mais longa'],
        ['Alcance', 'Específico, ponto a ponto', 'Amplo, qualquer célula com receptor']] } },
    ] },
    { ch: 'Cap. 1, Bases', t: 'Hipotálamo e hipófise', h: 'A central de comando', m: { sys: ['endocrino', 'nervoso'] }, b: [
      { p: 'O hipotálamo, no encéfalo, une os sistemas nervoso e endócrino. Ele comanda a hipófise, uma glândula do tamanho de uma ervilha situada logo abaixo. A neuro-hipófise (posterior) armazena e libera ADH e ocitocina, produzidos no hipotálamo. A adeno-hipófise (anterior) produz seus próprios hormônios sob controle de hormônios liberadores e inibidores do hipotálamo, transportados por um sistema de vasos sanguíneos.' },
      { table: { cap: 'Hormônios da hipófise', head: ['Hormônio', 'Origem', 'Alvo e efeito'], rows: [
        ['GH (hormônio do crescimento)', 'Adeno-hipófise', 'Estimula o crescimento de ossos e músculos e o metabolismo. Falta na infância: nanismo hipofisário; excesso: gigantismo (infância) ou acromegalia (adulto)'],
        ['TSH', 'Adeno-hipófise', 'Estimula a tireoide'],
        ['ACTH', 'Adeno-hipófise', 'Estimula o córtex da suprarrenal a liberar cortisol'],
        ['FSH e LH', 'Adeno-hipófise', 'Estimulam as gônadas: gametas e hormônios sexuais'],
        ['Prolactina', 'Adeno-hipófise', 'Estimula a produção de leite'],
        ['ADH', 'Hipotálamo, liberado pela neuro-hipófise', 'Aumenta a reabsorção de água nos rins'],
        ['Ocitocina', 'Hipotálamo, liberada pela neuro-hipófise', 'Contração do útero no parto e ejeção do leite']] } },
      { note: ['Retroalimentação positiva rara', 'Na maioria dos eixos hormonais, o hormônio final inibe a produção dos hormônios que o estimulam (retroalimentação negativa). A ocitocina no parto é exceção: as contrações do útero estimulam mais liberação de ocitocina até o nascimento.'] },
    ] },
    { ch: 'Cap. 2, Metabolismo', t: 'Tireoide e paratireoides', h: 'Ritmo do metabolismo e cálcio', m: { sys: ['endocrino'] }, b: [
      { p: 'A tireoide, na frente do pescoço, produz T₃ e T₄, hormônios que contêm iodo e controlam a velocidade do metabolismo, o crescimento e o desenvolvimento do sistema nervoso. Também produz calcitonina, que reduz o cálcio no sangue.' },
      { steps: { t: 'eixo da tireoide (retroalimentação negativa)', items: [
        'O hipotálamo libera TRH, que estimula a adeno-hipófise a liberar TSH.',
        'O TSH estimula a tireoide a produzir T₃ e T₄.',
        'Quando T₃ e T₄ aumentam no sangue, inibem o hipotálamo e a hipófise.',
        'A produção de TSH cai e os níveis dos hormônios tireoidianos voltam ao normal.'] } },
      { table: { cap: 'Alterações da tireoide', head: ['Condição', 'O que ocorre', 'Efeitos'], rows: [
        ['Hipotireoidismo', 'Pouca produção de T₃ e T₄', 'Cansaço, intolerância ao frio, ganho de peso, lentidão'],
        ['Hipertireoidismo', 'Produção excessiva', 'Agitação, perda de peso, calor, taquicardia'],
        ['Bócio', 'Aumento da glândula; no bócio endêmico, falta de iodo na dieta', 'O sal iodado previne; no Brasil a iodação do sal é obrigatória por lei'],
        ['Cretinismo (hipotireoidismo congênito)', 'Falta de hormônio tireoidiano no desenvolvimento', 'Retardo físico e mental; o teste do pezinho detecta e permite tratar']] } },
      { p: 'As quatro pequenas paratireoides, situadas atrás da tireoide, produzem o paratormônio (PTH), que aumenta o cálcio no sangue: estimula a reabsorção óssea, a reabsorção de cálcio nos rins e a ativação da vitamina D. O cálcio é essencial para contração muscular, condução nervosa e coagulação.' },
    ] },
    { ch: 'Cap. 2, Metabolismo', t: 'Pâncreas endócrino e diabetes', h: 'Insulina e glucagon', m: { sys: ['endocrino', 'digestorio'], parts: ['digestorio', ['pâncreas']] }, b: [
      { p: 'O pâncreas é uma glândula mista. Suas ilhotas de Langerhans, que formam a parte endócrina, têm células beta, que produzem insulina, e células alfa, que produzem glucagon. Os dois hormônios têm efeitos opostos e mantêm a glicemia, a concentração de glicose no sangue, em uma faixa estreita.' },
      { fig: 'glicemia', cap: 'Regulação da glicemia por insulina e glucagon entre pâncreas e fígado.' },
      { steps: { t: 'depois de uma refeição rica em carboidratos', items: [
        'A glicose absorvida no intestino faz a glicemia subir.',
        'As células beta liberam insulina.',
        'A insulina faz células musculares e adiposas captarem glicose e estimula o fígado a armazená-la como glicogênio; a glicemia cai.',
        'Com a glicemia normal, a liberação de insulina diminui.'] } },
      { steps: { t: 'durante o jejum', items: [
        'A glicemia cai.',
        'As células alfa liberam glucagon.',
        'O glucagon estimula o fígado a converter glicogênio em glicose e a produzir glicose a partir de outras substâncias.',
        'A glicose sai do fígado para o sangue e a glicemia volta ao normal.'] } },
      { table: { cap: 'Diabetes mellitus', head: ['Tipo', 'Causa', 'Características'], rows: [
        ['Tipo 1', 'Destruição autoimune das células beta; falta de insulina', 'Costuma surgir cedo; exige insulina todos os dias'],
        ['Tipo 2', 'Resistência das células à insulina e produção insuficiente', 'Mais comum; ligada a obesidade, sedentarismo e hereditariedade; pode ser prevenida e controlada com alimentação, exercício e medicamentos'],
        ['Gestacional', 'Alteração da tolerância à glicose durante a gravidez', 'Exige acompanhamento; aumenta o risco de diabetes tipo 2 depois']] } },
      { p: 'Os sinais clássicos de hiperglicemia são urinar muito (poliúria), sentir muita sede (polidipsia) e fome (polifagia), por causa da glicose que arrasta água na urina. A hiperglicemia crônica lesa vasos e nervos, afetando olhos, rins e pés. A hipoglicemia (glicemia muito baixa) pode causar tontura, suor frio e desmaio, e exige correção rápida com açúcar.' },
    ] },
    { ch: 'Cap. 3, Estresse e sexo', t: 'Suprarrenais e estresse', h: 'Adrenalina rápida, cortisol lento', m: { sys: ['endocrino', 'urinario'], parts: ['endocrino', ['suprarrenal']] }, b: [
      { p: 'As glândulas suprarrenais ficam sobre os rins. A medula, interna, produz adrenalina e noradrenalina em resposta ao sistema nervoso simpático: coração acelera, vias aéreas e vasos dos músculos dilatam, fígado libera glicose. O córtex, externo, produz esteroides: o cortisol (glicocorticoide), a aldosterona (mineralocorticoide) e pequenas quantidades de hormônios sexuais.' },
      { cols: [['Adrenalina', 'Resposta imediata ao susto ou ao exercício: aumenta frequência cardíaca, glicemia e fluxo para os músculos.'], ['Cortisol', 'Resposta mais lenta a estresse: eleva a glicose, mobiliza reservas e reduz a inflamação e a resposta imune.'], ['Aldosterona', 'Aumenta a retenção de sódio e de água pelos rins, o que eleva a pressão arterial.']] },
      { p: 'Estresse crônico mantém o cortisol elevado e pode contribuir para hipertensão, aumento da glicemia, alterações do sono e maior suscetibilidade a infecções. O uso prolongado de corticoides como medicamento tem efeitos semelhantes e deve ser acompanhado por médico. Na doença de Addison faltam hormônios do córtex; na síndrome de Cushing há excesso de cortisol.' },
    ] },
    { ch: 'Cap. 3, Estresse e sexo', t: 'Gônadas e outros hormônios', h: 'Hormônios sexuais, sono e mais', m: { sys: ['endocrino', 'reprodutor'] }, b: [
      { table: { cap: 'Outras fontes de hormônios', head: ['Órgão', 'Hormônio', 'Efeitos'], rows: [
        ['Testículos', 'Testosterona', 'Caracteres sexuais masculinos, produção de espermatozoides, massa muscular'],
        ['Ovários', 'Estrógenos e progesterona', 'Caracteres sexuais femininos, ciclo menstrual, preparação do útero para a gestação'],
        ['Glândula pineal', 'Melatonina', 'Regula o ciclo claro-escuro; é liberada principalmente no escuro'],
        ['Rins', 'Eritropoetina', 'Estimula a produção de hemácias'],
        ['Coração (átrios)', 'Peptídeo natriurético atrial', 'Aumenta a eliminação de sódio e água'],
        ['Tecido adiposo', 'Leptina', 'Sinaliza saciedade'],
        ['Timo', 'Timosina e outros', 'Maturação dos linfócitos T na infância']] } },
      { p: 'Os hormônios sexuais são regulados pelo eixo hipotálamo–hipófise–gônadas (veja a aula do sistema reprodutor). Na puberdade, o aumento de FSH e LH leva à maturação das gônadas. Na menopausa, a queda de estrógenos contribui para a perda de massa óssea.' },
    ] },
    { ch: 'Cap. 4, Sociedade', t: 'Hormônios na saúde e no cotidiano', h: 'Usos, riscos e políticas públicas', m: { sys: ['endocrino'] }, b: [
      { ul: ['Anticoncepcionais hormonais usam estrógeno e/ou progestagênio sintéticos para inibir a ovulação por retroalimentação negativa sobre a hipófise. Não protegem contra infecções sexualmente transmissíveis (só o preservativo protege).', 'Anabolizantes esteroides imitam a testosterona. O uso sem indicação médica causa atrofia dos testículos, alterações do fígado, do coração e do humor e é proibido no esporte.', 'Insulina é o tratamento essencial do diabetes tipo 1 e, em alguns casos, do tipo 2; sua dose e seu horário dependem de orientação.', 'Hormônio do crescimento sintético é usado em crianças com deficiência diagnosticada; seu uso no esporte é proibido.', 'Alguns poluentes podem interferir na ação dos hormônios (disruptores endócrinos), tema de pesquisa e regulação.'] },
      { warn: ['“Hormônio é a mesma coisa que neurotransmissor.”', 'A diferença está no meio de transporte e no alcance: neurotransmissores atuam na fenda sináptica; hormônios circulam pelo sangue. Algumas substâncias, como a noradrenalina e a adrenalina, funcionam das duas formas.'] },
    ] },
    { ch: 'Cap. 5, Integração', t: 'O endócrino e os outros sistemas', h: 'Regulação em equipe', m: { sys: ['endocrino', 'nervoso', 'urinario'] }, b: [
      { cols: [['Nervoso', 'Hipotálamo e hipófise; adrenalina e simpático; sono e melatonina.'], ['Digestório', 'Insulina e glucagon regulam a glicose absorvida; hormônios gastrointestinais regulam secreções e apetite.'], ['Urinário', 'ADH, aldosterona e peptídeo natriurético regulam água e sais; eritropoetina é produzida nos rins.']] },
      { cols: [['Esquelético', 'GH, hormônios sexuais, PTH e calcitonina regulam o crescimento e o cálcio dos ossos.'], ['Reprodutor', 'FSH, LH, estrógenos, progesterona e testosterona regulam gametas, ciclo e gestação.'], ['Cardiovascular e imune', 'Adrenalina e aldosterona alteram a pressão e o débito; cortisol modula a inflamação.']] },
      { recall: ['Por que alguém com diabetes tipo 1 não consegue tratar-se apenas com dieta?', 'Porque as células beta foram destruídas e o corpo não produz insulina; sem ela, a glicose não entra nas células. A reposição de insulina é indispensável.'] },
    ] },
  ],
  sint: {
    text: 'Glândulas endócrinas liberam hormônios no sangue, que atuam em células com receptores específicos. O hipotálamo comanda a hipófise, que controla tireoide, suprarrenais e gônadas por eixos de retroalimentação negativa. Insulina e glucagon mantêm a glicemia; adrenalina e cortisol coordenam a resposta ao estresse; os hormônios sexuais regulam a reprodução. Os efeitos são mais lentos e duradouros que os do sistema nervoso.',
    conf: [
      ['Endócrina × exócrina', 'Endócrina libera no sangue; exócrina libera por ductos.'],
      ['Insulina × glucagon', 'Insulina reduz a glicemia; glucagon a eleva.'],
      ['Diabetes tipo 1 × tipo 2', 'No tipo 1 falta insulina (autoimune); no tipo 2 há resistência à insulina.'],
      ['ADH × ocitocina', 'ADH atua nos rins; ocitocina, no útero e nas glândulas mamárias.']],
    cards: [
      ['Quais hormônios o pâncreas endócrino produz?', 'Insulina (células beta) e glucagon (células alfa).'],
      ['Qual o papel do iodo?', 'É necessário para produzir T₃ e T₄; sua falta causa bócio.'],
      ['O que o TSH faz?', 'Estimula a tireoide a produzir seus hormônios.'],
      ['Que glândula une os sistemas nervoso e endócrino?', 'O hipotálamo, que controla a hipófise.'],
      ['O que faz o cortisol?', 'Aumenta a glicemia, mobiliza reservas e reduz inflamação; é o principal hormônio do estresse prolongado.'],
      ['O que o PTH faz?', 'Aumenta o cálcio no sangue.'],
      ['Por que a hiperglicemia aumenta a diurese?', 'A glicose excedente na urina arrasta água por osmose.']],
  },
};
