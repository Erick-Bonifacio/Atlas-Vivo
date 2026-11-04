// Atlas Vivo — aula aprofundada: integração e revisão. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).integracao = {
  dur: 55,
  lead: 'Casos que usam vários sistemas ao mesmo tempo, e um método para resolver questões integradas: identificar a variável, o sensor, o centro de controle e o efetor.',
  goals: [
    'Analisar situações do cotidiano (exercício, refeição, calor, susto, infecção, altitude, gestação) com vários sistemas.',
    'Aplicar um roteiro para resolver questões de integração.',
    'Revisar as principais relações entre os sistemas estudados na trilha.',
    'Reconhecer, em enunciados de vestibular, as palavras-chave e as armadilhas mais comuns.'],
  enem: [
    'Questões que combinam respiratório, cardiovascular e muscular em exercício físico.',
    'Glicemia, alimentação, diabetes: digestório, endócrino e cardiovascular.',
    'Desidratação e equilíbrio hídrico: rins, ADH, sede, suor.',
    'Resposta ao estresse, ao frio e ao calor: nervoso, endócrino, tegumentar.',
    'Infecção, febre, vacinas e imunidade.',
    'Leitura de gráficos e tabelas fisiológicas.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/1-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Método', t: 'Como resolver questões integradas', h: 'Um roteiro de quatro perguntas', m: { sys: ['nervoso', 'endocrino', 'cardiovascular'] }, b: [
      { p: 'Questões de integração parecem difíceis porque citam muitos órgãos, mas quase sempre seguem o mesmo esquema de regulação. Se você identifica o esquema, a resposta decorre.' },
      { steps: { t: 'roteiro de resolução', items: [
        'Qual é a variável que mudou? (temperatura, glicose, água, pH, pressão, O₂, CO₂...)',
        'Quem mede essa variável? (o sensor, ou receptor, e onde está)',
        'Quem decide? (o centro de controle: hipotálamo, bulbo, hipófise, pâncreas...)',
        'Quem executa e em que direção? (os efetores: músculos, glândulas, rins, vasos...) A resposta tende a reduzir o desvio inicial.'] } },
      { warn: ['Armadilhas frequentes', 'Confundir artéria com sangue oxigenado; confundir ventilação com respiração celular; achar que a bile é enzima; trocar ADH por aldosterona; inverter vacina e soro; afirmar que a temperatura “não muda” na homeostase. Releia o enunciado procurando o termo exato.'] },
      { recall: ['Se uma questão diz que a concentração de CO₂ no sangue aumentou, que variável, sensor, centro e efetor você aplicaria?', 'Variável: CO₂ (e pH). Sensor: quimiorreceptores. Centro: bulbo. Efetores: diafragma e intercostais; a ventilação aumenta e elimina CO₂.'] },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Exercício físico', h: 'Quase tudo muda ao mesmo tempo', m: { sys: ['muscular', 'cardiovascular', 'respiratorio'] }, b: [
      { steps: { t: 'o que acontece quando você corre', items: [
        'O córtex motor comanda os músculos; o consumo de ATP e de O₂ nas fibras aumenta e a produção de CO₂ e de calor também.',
        'O CO₂ e o H⁺ aumentam no sangue; quimiorreceptores e centros do bulbo aumentam a ventilação.',
        'O sistema nervoso simpático e a adrenalina aceleram o coração, aumentam o débito cardíaco e dilatam as arteríolas dos músculos, reduzindo o fluxo para o tubo digestório e os rins.',
        'O fígado libera glicose; o tecido adiposo libera ácidos graxos.',
        'O calor produzido eleva a temperatura: o hipotálamo ativa a vasodilatação na pele e o suor.',
        'No fim do exercício, a respiração e a frequência cardíaca ficam elevadas por alguns minutos para repor o O₂ e eliminar o CO₂ e o calor excedentes.'] } },
      { p: 'O treinamento regular amplia essas respostas: o coração bombeia mais sangue por batimento (frequência cardíaca de repouso menor), há mais capilares e mitocôndrias nos músculos e o consumo máximo de O₂ aumenta.' },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Refeição e glicemia', h: 'Digestório, cardiovascular e endócrino', m: { sys: ['digestorio', 'endocrino'], parts: ['digestorio', ['pâncreas', 'fígado']] }, b: [
      { steps: { t: 'depois de uma refeição com pão e leite', items: [
        'A amilase e as dissacaridases quebram o amido e a lactose em glicose e galactose; a glicose é absorvida no intestino por cotransporte com sódio.',
        'Pela veia porta, a glicose chega ao fígado, e a glicemia no sangue aumenta.',
        'As células beta do pâncreas liberam insulina (estimulada também por GIP).',
        'Músculos, tecido adiposo e fígado captam glicose; o fígado forma glicogênio; a glicemia volta ao normal.',
        'Horas depois, no jejum, o glucagon faz o fígado liberar glicose.'] } },
      { p: 'Em quem tem diabetes tipo 1, falta insulina e a glicemia fica alta; no tipo 2, as células respondem mal à insulina. A urina com glicose arrasta água e aumenta o volume (poliúria), o que causa sede. O exemplo reúne digestório, cardiovascular, endócrino e urinário.' },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Calor, suor e desidratação', h: 'Água, sal, temperatura e pressão', m: { sys: ['tegumentar', 'urinario', 'endocrino', 'nervoso'] }, b: [
      { steps: { t: 'dia quente e pouca água', items: [
        'A temperatura sobe: vasodilatação na pele e suor aumentam; o corpo perde água e sais.',
        'O sangue fica mais concentrado e o volume cai; osmorreceptores do hipotálamo detectam o aumento da osmolaridade.',
        'A hipófise libera ADH; os rins reabsorvem mais água e a urina fica escura e em pouco volume; surge a sede.',
        'A queda do volume reduz a pressão: barorreceptores ativam o simpático (coração acelera) e o sistema renina–angiotensina–aldosterona retém sódio e água.',
        'Beber água e repor sais normaliza o volume e interrompe as respostas.'] } },
      { note: ['Soro caseiro e soro de reidratação', 'O soro de reidratação oral usa glicose e sais em proporções definidas porque a glicose é absorvida junto com o sódio, e a água acompanha por osmose. Por isso é mais eficaz que água pura em perdas por diarreia.'] },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Susto, estresse e frio', h: 'Nervoso e endócrino em ação conjunta', m: { sys: ['nervoso', 'endocrino', 'cardiovascular'] }, b: [
      { cols: [['Susto (resposta rápida)', 'A amígdala e o hipotálamo ativam o simpático; a medula da suprarrenal libera adrenalina; coração acelera, pupilas dilatam, fígado libera glicose e o digestório “para”.'], ['Estresse prolongado (resposta lenta)', 'O eixo hipotálamo–hipófise–suprarrenal libera cortisol, que mantém a glicose alta, reduz inflamação e, em excesso, eleva a pressão e enfraquece a defesa.'], ['Frio', 'Vasoconstrição na pele, tremor muscular e liberação de hormônios tireoidianos e adrenalina aumentam a produção de calor.']] },
      { p: 'Esses três exemplos mostram a divisão de tarefas: o sistema nervoso responde em segundos; o endócrino mantém e amplia a resposta por minutos e horas.' },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Infecção, febre e vacina', h: 'Barreira, defesa e memória', m: { sys: ['linfatico', 'tegumentar', 'cardiovascular'] }, b: [
      { steps: { t: 'um vírus respiratório', items: [
        'O vírus supera as barreiras (cílios e muco) e infecta células das vias aéreas.',
        'Macrófagos e células dendríticas liberam sinais; surge inflamação local e febre (pirogênios elevam o ponto de ajuste do hipotálamo).',
        'As células apresentadoras levam antígenos aos linfonodos; linfócitos T e B são ativados.',
        'Anticorpos neutralizam o vírus; linfócitos T citotóxicos eliminam células infectadas.',
        'A infecção é controlada e restam células de memória. Uma vacina reproduz essa memória sem a doença.'] } },
      { warn: ['“Febre é sempre ruim e deve ser eliminada.”', 'Febre é uma resposta de defesa; medicamentos aliviam o desconforto, mas o essencial é descobrir a causa e atentar para sinais de gravidade, sobretudo em bebês, idosos e gestantes.'] },
    ] },
    { ch: 'Cap. 2, Casos', t: 'Altitude e gestação', h: 'Adaptações de longo prazo', m: { sys: ['respiratorio', 'cardiovascular', 'reprodutor'] }, b: [
      { cols: [['Altitude', 'Menor pressão parcial de O₂ → ventilação aumenta; os rins liberam eritropoetina; a medula forma mais hemácias; o hematócrito sobe após semanas.'], ['Gestação', 'A progesterona e o estrógeno aumentam; o volume de sangue cresce; o rim filtra mais; o cálcio da mãe é mobilizado; a placenta faz as trocas.'], ['Envelhecimento', 'Perda de massa óssea e muscular, menor elasticidade das artérias, menor reserva dos órgãos; atividade física e nutrição atenuam o processo.']] },
      { recall: ['Por que atletas treinam em altitude para competir ao nível do mar?', 'Porque a hipóxia estimula a eritropoetina e a produção de hemácias; ao voltar, o sangue transporta mais O₂ por um tempo.'] },
    ] },
    { ch: 'Cap. 3, Revisão', t: 'Mapa de relações entre os sistemas', h: 'Quem depende de quem', m: { sys: ['digestorio', 'respiratorio', 'cardiovascular', 'urinario', 'nervoso', 'endocrino'] }, b: [
      { table: { cap: 'Relações mais cobradas', head: ['Sistemas', 'Relação'], rows: [
        ['Respiratório + cardiovascular', 'O pulmão oxigena o sangue; o coração e os vasos o distribuem; juntos controlam O₂ e CO₂ nos tecidos'],
        ['Digestório + cardiovascular + endócrino', 'Nutrientes absorvidos vão ao fígado pela veia porta; insulina e glucagon regulam a glicemia'],
        ['Urinário + endócrino + cardiovascular', 'Água e sais: rins, ADH e aldosterona; volume de sangue e pressão'],
        ['Nervoso + endócrino', 'Hipotálamo–hipófise; adrenalina; resposta ao estresse'],
        ['Esquelético + muscular + nervoso', 'Movimento: ossos e músculos obedecem a comandos nervosos'],
        ['Tegumentar + nervoso + cardiovascular', 'Termorregulação: sensores na pele, hipotálamo e vasos'],
        ['Imune + cardiovascular + linfático', 'Leucócitos viajam pelo sangue e pela linfa; linfonodos filtram a linfa'],
        ['Reprodutor + endócrino + imune', 'Eixo hormonal do ciclo; tolerância e proteção ao feto']] } },
      { p: 'Agora é hora de praticar: faça o quiz desta aula e passe ao banco de questões de vestibulares, em que o mesmo raciocínio aparece com enunciados reais, e depois volte ao Atlas 3D para localizar as estruturas citadas.' },
    ] },
  ],
  sint: {
    text: 'Os sistemas do corpo trabalham juntos por mecanismos de regulação em que uma variável é medida por um sensor, avaliada por um centro de controle e corrigida por efetores. Situações do dia a dia, como o exercício, a refeição, o calor, o susto, a infecção, a altitude e a gestação, combinam respostas nervosas, hormonais, circulatórias, respiratórias, urinárias, musculares e imunes. O roteiro variável–sensor–centro–efetor ajuda a resolver questões integradas.',
    conf: [
      ['Resposta nervosa × hormonal', 'A nervosa é rápida e curta; a hormonal é mais lenta e duradoura.'],
      ['Suor × diurese', 'O suor perde água por evaporação para esfriar; a diurese ajusta água e sais conforme a necessidade.'],
      ['Vacina × soro', 'Vacina: memória e prevenção; soro: anticorpos prontos para tratar.'],
      ['Alterar a variável × alterar o ponto de ajuste', 'Na febre, o ponto de ajuste do hipotálamo sobe; no calor, o corpo age para manter o ponto de ajuste.']],
    cards: [
      ['Quais as quatro perguntas do roteiro?', 'Qual a variável? Quem mede? Quem decide? Quem executa e em que direção?'],
      ['Por que a respiração acelera no exercício?', 'Porque o CO₂ e o H⁺ aumentam e os quimiorreceptores estimulam o bulbo.'],
      ['Por que a pessoa com sede urina pouco?', 'Porque o ADH aumenta a reabsorção de água nos rins.'],
      ['Que hormônio baixa a glicemia?', 'A insulina.'],
      ['O que faz a adrenalina?', 'Aumenta a frequência cardíaca e a glicemia e redistribui o fluxo para os músculos.'],
      ['Como a febre se forma?', 'Pirogênios elevam o ponto de ajuste do hipotálamo.'],
      ['O que muda na altitude?', 'Mais ventilação e, em semanas, mais eritropoetina e hemácias.']],
  },
};
