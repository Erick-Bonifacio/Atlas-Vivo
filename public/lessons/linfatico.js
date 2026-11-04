// Atlas Vivo — aula aprofundada: sistema linfático e imunidade. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).linfatico = {
  dur: 65,
  lead: 'Vasos e órgãos que drenam líquido e abrigam as células de defesa, e como as imunidades inata e adaptativa reconhecem e eliminam agentes infecciosos, com vacinas, soros, alergias e doenças do sistema imune.',
  goals: [
    'Descrever os vasos linfáticos, a linfa e os órgãos linfoides.',
    'Explicar a imunidade inata: barreiras, fagocitose e inflamação.',
    'Explicar a imunidade adaptativa: linfócitos B e T, anticorpos e memória.',
    'Diferenciar imunização ativa (vacinas) e passiva (soros e anticorpos) e interpretar a importância da vacinação coletiva.',
    'Reconhecer alergias, doenças autoimunes e o HIV/aids.'],
  enem: [
    'Vacina × soro: ativa × passiva, memória imunológica.',
    'Calendário e campanhas de vacinação; imunidade coletiva; erradicação de doenças.',
    'Linfócitos B e T; anticorpos; resposta primária e secundária.',
    'HIV/aids: transmissão, prevenção e tratamento no SUS.',
    'Alergias, doenças autoimunes, transplantes e rejeição.',
    'Antibióticos, resistência bacteriana e uso racional.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 21: Sistema linfático e imunidade', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/21-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Programa Nacional de Imunizações e Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Anatomia', t: 'Vasos e órgãos linfáticos', h: 'A segunda rede de drenagem', m: { sys: ['linfatico'] }, b: [
      { p: 'Nos capilares sanguíneos, parte do plasma sai para os tecidos e forma o líquido intersticial. A maior parte volta ao sangue, mas uma fração, junto com proteínas e células, é recolhida pelos capilares linfáticos, vasos de fundo cego e paredes muito permeáveis. Esse líquido passa a se chamar linfa. A linfa percorre vasos que se unem em vasos maiores e desembocam nas veias subclávias, perto do coração: o ducto torácico recebe a linfa de grande parte do corpo e o ducto linfático direito, a do braço direito e do lado direito da cabeça e do tórax. Válvulas e a contração dos músculos ao redor ajudam a empurrar a linfa.' },
      { fig: 'linfatico', cap: 'Vasos linfáticos e linfonodos pelo corpo, com tonsilas, timo, baço e fígado.' },
      { table: { cap: 'Órgãos linfoides', head: ['Órgão', 'Tipo', 'Função'], rows: [
        ['Medula óssea vermelha', 'Primário', 'Origem de todas as células do sangue; os linfócitos B amadurecem aqui'],
        ['Timo', 'Primário', 'Maturação dos linfócitos T; é maior na infância e diminui com a idade'],
        ['Linfonodos (gânglios)', 'Secundário', 'Filtram a linfa e reúnem células de defesa; incham em infecções próximas'],
        ['Baço', 'Secundário', 'Filtra o sangue, remove hemácias envelhecidas e abriga linfócitos'],
        ['Tonsilas, placas de Peyer e apêndice', 'Secundário', 'Defesa nas mucosas da faringe e do intestino']] } },
      { p: 'O sistema linfático tem três funções: drenar o excesso de líquido dos tecidos (se não ocorre, há edema), absorver gorduras no intestino (pelos vasos quilíferos) e dar suporte à imunidade. A obstrução dos vasos ou a retirada de linfonodos, por exemplo no tratamento de câncer de mama, pode causar linfedema.' },
    ] },
    { ch: 'Cap. 2, Imunidade inata', t: 'Primeira linha de defesa', h: 'Barreiras, células e inflamação', m: { sys: ['linfatico', 'tegumentar'] }, b: [
      { p: 'A imunidade inata está presente desde o nascimento, é rápida e age do mesmo modo contra muitos agentes. Suas barreiras: a pele e as mucosas, o muco e os cílios das vias respiratórias, o ácido do estômago, a lisozima da saliva e da lágrima, o pH da pele e da vagina e a microbiota residente, que ocupa espaço e compete com patógenos.' },
      { table: { cap: 'Células e mecanismos da imunidade inata', head: ['Componente', 'O que faz'], rows: [
        ['Neutrófilos', 'Células mais abundantes entre os leucócitos; fagocitam bactérias nas fases iniciais da infecção; pus contém neutrófilos mortos'],
        ['Macrófagos', 'Derivados de monócitos; fagocitam microrganismos e restos celulares e apresentam antígenos aos linfócitos'],
        ['Células dendríticas', 'Capturam antígenos e os levam aos linfonodos para ativar linfócitos T'],
        ['Células NK (natural killer)', 'Matam células infectadas por vírus e células tumorais'],
        ['Sistema do complemento', 'Proteínas do plasma que marcam e perfuram microrganismos'],
        ['Interferons', 'Proteínas que alertam as células vizinhas contra vírus']] } },
      { steps: { t: 'inflamação aguda', items: [
        'Células lesadas ou infectadas liberam sinais químicos, como a histamina.',
        'Os vasos locais se dilatam e ficam mais permeáveis: vermelhidão, calor e inchaço (os sinais clássicos são rubor, calor, tumor e dor).',
        'Neutrófilos e monócitos atravessam a parede do vaso e chegam ao tecido.',
        'Os fagócitos eliminam os microrganismos e os restos; a inflamação cessa e o tecido se repara.'] } },
    ] },
    { ch: 'Cap. 3, Imunidade adaptativa', t: 'Linfócitos, anticorpos e memória', h: 'A defesa que aprende', m: { sys: ['linfatico'] }, b: [
      { p: 'A imunidade adaptativa é específica: reconhece antígenos (moléculas do agente invasor ou de células alteradas) e deixa memória. Quem atua são os linfócitos. Cada linfócito tem receptores para um antígeno específico; quando encontra esse antígeno, multiplica-se e origina clones (seleção clonal).' },
      { table: { cap: 'Linfócitos e suas funções', head: ['Célula', 'Função'], rows: [
        ['Linfócito B', 'Ao ser ativado, vira plasmócito e produz anticorpos (imunidade humoral); algumas células viram células de memória'],
        ['Linfócito T auxiliar (CD4)', 'Coordena a resposta: ativa linfócitos B e T citotóxicos e macrófagos'],
        ['Linfócito T citotóxico (CD8)', 'Mata células infectadas por vírus e células tumorais (imunidade celular)'],
        ['Linfócito T regulador', 'Evita respostas exageradas e contra o próprio corpo']] } },
      { p: 'Anticorpos (imunoglobulinas) são proteínas em forma de Y. Ligam-se ao antígeno e neutralizam toxinas e vírus, marcam o microrganismo para ser fagocitado e ativam o complemento. Os principais tipos: IgM (primeira resposta), IgG (a mais abundante; atravessa a placenta e protege o recém-nascido), IgA (secreções e leite materno) e IgE (alergias e parasitoses).' },
      { steps: { t: 'resposta imune adaptativa a um vírus', items: [
        'Células dendríticas e macrófagos capturam o vírus e apresentam seus antígenos a linfócitos T auxiliares nos linfonodos.',
        'Os linfócitos T auxiliares ativados estimulam linfócitos B e T citotóxicos que reconhecem o mesmo antígeno.',
        'Os linfócitos B se transformam em plasmócitos e produzem anticorpos; os T citotóxicos destroem as células infectadas.',
        'Quando a infecção é controlada, a maioria das células de defesa morre, mas restam células de memória.'] } },
      { note: ['Resposta primária × secundária', 'No primeiro contato com um antígeno, a resposta demora dias e tem poucos anticorpos (IgM, depois IgG). Num segundo contato, as células de memória respondem em horas, com muito mais anticorpos e por mais tempo. É esse princípio que as vacinas usam.'] },
    ] },
    { ch: 'Cap. 4, Imunização', t: 'Vacinas, soros e saúde coletiva', h: 'Ativa × passiva', m: { sys: ['linfatico'] }, b: [
      { table: { cap: 'Imunização ativa × passiva', head: ['', 'Vacina (ativa)', 'Soro ou anticorpo pronto (passiva)'], rows: [
        ['O que se aplica', 'Antígeno (agente atenuado ou inativado, parte do agente, toxina inativada ou instruções genéticas para produzir um antígeno)', 'Anticorpos já prontos (de animais imunizados, de pessoas ou produzidos em laboratório)'],
        ['Quem produz anticorpos', 'O próprio organismo', 'Vêm de fora'],
        ['Memória imunológica', 'Sim', 'Não'],
        ['Início da proteção', 'Dias a semanas', 'Imediato'],
        ['Duração', 'Longa, às vezes por toda a vida (podem ser necessários reforços)', 'Curta (semanas)'],
        ['Uso', 'Prevenção', 'Tratamento de emergência: veneno de cobra, tétano, raiva em situações de risco, botulismo'],
        ['Natural', 'Ter a doença', 'Anticorpos da mãe pela placenta (IgG) e pelo leite (IgA)']] } },
      { table: { cap: 'Tipos de vacina', head: ['Tipo', 'Como funciona', 'Exemplos'], rows: [
        ['Agente vivo atenuado', 'Microrganismo enfraquecido que se multiplica pouco e induz memória', 'Tríplice viral (sarampo, caxumba e rubéola), febre amarela, BCG, rotavírus'],
        ['Agente inativado', 'Microrganismo morto', 'Poliomielite injetável, hepatite A, raiva'],
        ['Toxoide', 'Toxina inativada que induz anticorpos contra a toxina', 'Tétano e difteria'],
        ['Subunidade ou recombinante', 'Fragmento do agente', 'Hepatite B, HPV, meningocócica'],
        ['Vírus que carrega instruções ou RNA mensageiro', 'As células do corpo produzem temporariamente uma proteína do vírus, que induz a resposta imune', 'Algumas vacinas contra covid-19']] } },
      { p: 'Quanto mais pessoas vacinadas, menor a circulação do agente e maior a proteção até de quem não pode se vacinar: é a imunidade coletiva (de rebanho). O Programa Nacional de Imunizações (PNI), criado em 1973, oferece gratuitamente no SUS dezenas de vacinas e foi decisivo para eliminar a poliomielite (último caso de poliovírus selvagem no Brasil em 1989) e controlar o sarampo e a rubéola. A queda recente das coberturas aumenta o risco do retorno de doenças que estavam sob controle. A varíola foi erradicada no mundo em 1980, graças à vacinação.' },
      { warn: ['“Vacina dá a doença.”', 'Vacinas de microrganismo atenuado podem causar sintomas leves e raros; as inativadas, de toxoide e de subunidade não podem causar a doença. Os riscos da doença natural são muito maiores que os eventos adversos graves das vacinas.'] },
    ] },
    { ch: 'Cap. 5, Disfunções', t: 'Alergias, autoimunidade e HIV', h: 'Quando a defesa falha ou erra', m: { sys: ['linfatico'] }, b: [
      { table: { cap: 'Disfunções do sistema imune', head: ['Condição', 'O que ocorre', 'Observações'], rows: [
        ['Alergia (hipersensibilidade)', 'Resposta exagerada a antígenos inofensivos (alérgenos): IgE ativa mastócitos, que liberam histamina', 'Rinite, urticária, asma. A anafilaxia é grave, e a adrenalina é o tratamento de emergência'],
        ['Doença autoimune', 'Ataque contra tecidos do próprio corpo', 'Diabetes tipo 1, artrite reumatoide, lúpus, esclerose múltipla, doença celíaca'],
        ['Rejeição de transplante', 'O sistema imune reconhece moléculas HLA do doador como estranhas', 'Exige compatibilidade e imunossupressores'],
        ['Imunodeficiências', 'Falha de componentes da defesa, congênita ou adquirida', 'HIV/aids é a mais conhecida']] } },
      { p: 'O HIV (vírus da imunodeficiência humana) infecta principalmente linfócitos T auxiliares (CD4) e, sem tratamento, reduz sua quantidade até a aids (síndrome da imunodeficiência adquirida), em que infecções oportunistas e alguns cânceres se instalam. Transmite-se por relações sexuais sem proteção, por sangue contaminado (seringas compartilhadas) e da mãe para o filho na gestação, no parto e na amamentação; não se transmite por abraço, beijo, talheres ou picada de mosquito.' },
      { ul: ['Prevenção: preservativo, uso de material estéril, pré-natal com teste e tratamento, profilaxias pré e pós-exposição (PrEP e PEP) oferecidas no SUS.', 'Tratamento: a terapia antirretroviral, gratuita no SUS, reduz a quantidade de vírus no sangue a níveis indetectáveis; quem mantém a carga viral indetectável não transmite o vírus pela via sexual.', 'O teste é rápido, gratuito e sigiloso nos serviços de saúde.'] },
      { warn: ['“Antibiótico serve para gripe.”', 'Antibióticos agem contra bactérias, não contra vírus. O uso desnecessário ou incompleto favorece a seleção de bactérias resistentes, um grave problema de saúde pública.'] },
    ] },
    { ch: 'Cap. 6, Integração', t: 'Imunidade e o resto do corpo', h: 'Defesa em toda parte', m: { sys: ['linfatico', 'cardiovascular', 'digestorio'] }, b: [
      { cols: [['Cardiovascular', 'Os leucócitos viajam pelo sangue e saem pelos capilares; a linfa devolve líquido e proteínas ao sangue.'], ['Digestório', 'O intestino tem grande parte do tecido linfoide; vilosidades têm quilíferos; a microbiota treina o sistema imune.'], ['Tegumentar e respiratório', 'Barreiras físicas e químicas e células de defesa em pele e mucosas.']] },
      { cols: [['Endócrino', 'O timo é ativo na infância; o cortisol reduz inflamação e resposta imune.'], ['Nervoso', 'A febre é coordenada pelo hipotálamo; o estresse crônico modifica a defesa.'], ['Reprodutor', 'IgG da mãe protege o feto; IgA do leite protege o bebê; a gestação exige tolerância imunológica.']] },
      { recall: ['Por que uma picada de cobra é tratada com soro e não com vacina?', 'Porque a ação do veneno é rápida e é preciso neutralizá-lo já; o soro traz anticorpos prontos. A vacina demoraria dias para gerar anticorpos e protegeria só no futuro.'] },
    ] },
  ],
  sint: {
    text: 'O sistema linfático drena o líquido dos tecidos, absorve gorduras e abriga as células de defesa. A imunidade inata age de modo geral e rápido, com barreiras, fagócitos e inflamação. A adaptativa é específica: linfócitos B produzem anticorpos, linfócitos T coordenam e destroem células infectadas, e as células de memória fazem a segunda resposta ser mais rápida e forte. Vacinas induzem memória; soros dão proteção imediata e passageira. Alergias, doenças autoimunes e o HIV são falhas ou erros dessa defesa.',
    conf: [
      ['Vacina × soro', 'Vacina estimula o corpo a produzir anticorpos e memória; soro entrega anticorpos prontos, sem memória.'],
      ['Inata × adaptativa', 'Inata: imediata e não específica. Adaptativa: específica, mais lenta na primeira vez e com memória.'],
      ['Linfócito B × T', 'B produz anticorpos; T coordena a resposta e destrói células infectadas.'],
      ['HIV × aids', 'HIV é o vírus; aids é a doença causada pela imunodeficiência que ele provoca quando não tratado.']],
    cards: [
      ['Para onde vai a linfa?', 'Para as veias subclávias, pelos ductos linfático direito e torácico.'],
      ['Qual a função do timo?', 'Maturação dos linfócitos T.'],
      ['O que são células de memória?', 'Linfócitos que permanecem após a infecção e respondem rápido e forte a um novo contato.'],
      ['Qual a diferença entre imunização ativa e passiva?', 'Na ativa o corpo produz os anticorpos e guarda memória; na passiva recebe-os prontos, sem memória.'],
      ['O que é imunidade coletiva?', 'Proteção indireta quando muitos estão vacinados, dificultando a circulação do agente.'],
      ['Que células o HIV ataca?', 'Principalmente linfócitos T auxiliares (CD4).'],
      ['Qual o papel da histamina na alergia?', 'Dilata vasos e aumenta sua permeabilidade, provocando coceira, inchaço e secreção.']],
  },
};
