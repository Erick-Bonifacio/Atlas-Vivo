// Atlas Vivo — aula aprofundada: sistema tegumentar. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).tegumentar = {
  dur: 45,
  lead: 'Como a pele e seus anexos protegem, sentem, regulam a temperatura e se adaptam à luz do sol, e como cuidar dela.',
  goals: [
    'Descrever as camadas da pele e as células da epiderme.',
    'Identificar anexos cutâneos: pelos, unhas e glândulas.',
    'Explicar a cor da pele, os efeitos da radiação ultravioleta e a prevenção do câncer de pele.',
    'Descrever a termorregulação como retroalimentação negativa.',
    'Relacionar a pele a infecções, cicatrização e saúde pública.'],
  enem: [
    'Melanina, radiação ultravioleta, bronzeamento e câncer de pele; protetor solar.',
    'Termorregulação: suor, vasodilatação, febre; umidade do ar e sensação térmica.',
    'Funções de barreira, sensibilidade e síntese de vitamina D.',
    'Hanseníase, micoses, escabiose, leishmaniose; prevenção.',
    'Queimaduras e cicatrização; tétano em ferimentos.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, cap. 5: O sistema tegumentar', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/5-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Estrutura', t: 'Funções e camadas da pele', h: 'O maior órgão do corpo', m: { sys: ['tegumentar'] }, b: [
      { p: 'A pele e seus anexos formam o sistema tegumentar. Em um adulto, a pele cobre cerca de dois metros quadrados e responde por alguns quilos de massa. Suas funções: proteção contra atrito, microrganismos, perda de água e radiação UV; percepção de tato, temperatura, pressão e dor; termorregulação; excreção de água e sais pelo suor; síntese de vitamina D; e comunicação, pela expressão e pela aparência.' },
      { fig: 'pele', cap: 'Corte da pele: epiderme, derme e hipoderme, com pelo, glândula sudorípara, vasos e nervo.' },
      { table: { cap: 'Camadas da pele', head: ['Camada', 'Tecido', 'O que contém e o que faz'], rows: [
        ['Epiderme', 'Epitélio estratificado pavimentoso queratinizado, sem vasos', 'Queratinócitos produzem queratina e formam a barreira; no estrato córneo as células mortas se renovam continuamente; melanócitos produzem melanina; células de Langerhans fazem defesa; células de Merkel participam do tato'],
        ['Derme', 'Tecido conjuntivo denso com fibras de colágeno e elastina', 'Vasos, nervos, receptores, folículos pilosos e glândulas; dá resistência e elasticidade'],
        ['Hipoderme (tela subcutânea)', 'Tecido conjuntivo frouxo e adiposo', 'Reserva de energia, isolamento térmico e amortecimento; fixa a pele às estruturas profundas']] } },
      { recall: ['Por que um arranhão superficial não sangra, mas um corte mais fundo sim?', 'Porque a epiderme não tem vasos sanguíneos; os vasos estão na derme. Só quando a lesão atinge a derme há sangramento.'] },
    ] },
    { ch: 'Cap. 1, Estrutura', t: 'Anexos da pele', h: 'Pelos, unhas e glândulas', m: { sys: ['tegumentar'] }, b: [
      { table: { cap: 'Anexos cutâneos', head: ['Anexo', 'Descrição', 'Função'], rows: [
        ['Pelos', 'Cilindros de queratina que crescem a partir do folículo; o músculo eretor do pelo se prende a ele', 'Proteção; sensibilidade; o arrepio (piloereção) pouco ajuda a reter calor nos humanos'],
        ['Unhas', 'Placas de queratina nas extremidades dos dedos', 'Proteção das pontas e auxílio na preensão'],
        ['Glândulas sudoríparas écrinas', 'Espalhadas pela pele, abrem-se em poros', 'Suor, de composição aquosa, para resfriar o corpo'],
        ['Glândulas sudoríparas apócrinas', 'Axilas e região genital; ativas após a puberdade', 'Secreção mais espessa, cujo odor surge com a ação de bactérias'],
        ['Glândulas sebáceas', 'Associadas aos folículos pilosos', 'Sebo: lubrifica a pele e os pelos e tem ação antimicrobiana; a obstrução e a inflamação causam acne'],
        ['Glândulas mamárias', 'Sudoríparas modificadas', 'Produção de leite']] } },
      { p: 'A queratina é uma proteína resistente e insolúvel em água. Pelos, unhas e a camada mais externa da epiderme são formados por células mortas cheias de queratina; por isso cortar cabelo ou unha não dói.' },
    ] },
    { ch: 'Cap. 2, Sol e cor', t: 'Cor da pele e radiação ultravioleta', h: 'Melanina: proteção que se adapta', m: { sys: ['tegumentar'] }, b: [
      { p: 'A cor da pele depende principalmente da quantidade e do tipo de melanina, pigmento produzido pelos melanócitos e transferido aos queratinócitos. O número de melanócitos é semelhante entre as pessoas; o que varia é quanto pigmento eles produzem, o tipo (eumelanina, escura, e feomelanina, avermelhada) e como se distribui. A variação reflete adaptação ao longo da evolução: populações originárias de regiões de maior incidência de UV tendem a ter mais melanina, que protege o DNA e o ácido fólico, e populações de regiões de menor incidência tendem a ter menos melanina, favorecendo a síntese de vitamina D.' },
      { steps: { t: 'bronzeamento', items: [
        'A radiação UV danifica o DNA dos queratinócitos.',
        'As células liberam sinais que estimulam os melanócitos a produzir mais melanina.',
        'A melanina é transferida e se posiciona sobre o núcleo das células, absorvendo parte da radiação.',
        'A pele escurece; o bronzeado é uma reação ao dano, não um sinal de saúde.'] } },
      { table: { cap: 'Radiação ultravioleta e a pele', head: ['Radiação', 'Efeito principal'], rows: [
        ['UVB', 'Atinge a epiderme: queimadura solar e síntese de vitamina D'],
        ['UVA', 'Penetra até a derme: fotoenvelhecimento, rugas e contribui para o câncer de pele'],
        ['UVC', 'Quase toda absorvida pela camada de ozônio, que por isso é importante']] } },
      { p: 'A vitamina D é formada quando o UVB converte um derivado do colesterol na pele; o fígado e os rins completam a ativação. Ela aumenta a absorção de cálcio no intestino. Exposição curta e moderada costuma bastar para a maioria das pessoas; exposição excessiva não aumenta a vitamina D e eleva o risco de câncer.' },
      { warn: ['“Protetor solar impede a produção de vitamina D, então é melhor evitá-lo.”', 'No uso real, o efeito do protetor sobre os níveis de vitamina D costuma ser pequeno, e a pele produz o que precisa com exposições curtas e cotidianas. Não há justificativa para dispensar o protetor ou buscar bronzeamento “para fazer vitamina D”; quem suspeita de deficiência deve ser avaliado por profissional de saúde.'] },
      { note: ['Câncer de pele', 'É o tipo de câncer mais frequente no Brasil. Os mais comuns são o carcinoma basocelular e o espinocelular; o melanoma, originado nos melanócitos, é menos comum e mais agressivo. Prevenção: evitar o sol entre cerca das 10h e das 16h, usar protetor solar (FPS 30 ou mais, reaplicado), chapéu, roupas e sombra. Sinais de alerta (regra do ABCDE): pinta Assimétrica, de Bordas irregulares, com Cores variadas, Diâmetro maior que 6 mm ou que Evolui.'] },
    ] },
    { ch: 'Cap. 3, Regulação', t: 'Termorregulação', h: 'Manter 36 a 37 °C', m: { sys: ['tegumentar', 'nervoso'] }, b: [
      { p: 'Humanos são endotérmicos e homeotérmicos: produzem calor por metabolismo e mantêm a temperatura corporal em uma faixa estreita, em torno de 36 a 37 °C, mesmo com o ambiente variando. O centro de controle é o hipotálamo, que recebe informações de termorreceptores na pele e no interior do corpo.' },
      { table: { cap: 'Respostas à variação de temperatura', head: ['Situação', 'Respostas', 'Efeito'], rows: [
        ['Calor', 'Vasodilatação na pele; aumento do suor', 'Mais calor é perdido por irradiação, e a evaporação do suor retira energia da pele'],
        ['Frio', 'Vasoconstrição na pele; tremor muscular; menor suor', 'Menos perda de calor; os músculos geram calor']] } },
      { steps: { t: 'resposta ao calor', items: [
        'A temperatura corporal sobe e os termorreceptores enviam sinais ao hipotálamo.',
        'O hipotálamo ativa as respostas: vasodilatação e suor.',
        'O suor evapora e o sangue perde calor para o ambiente.',
        'A temperatura volta à faixa normal e as respostas diminuem (retroalimentação negativa).'] } },
      { p: 'Em dias muito úmidos, o suor evapora com dificuldade e a sensação térmica é pior: a perda de calor por evaporação é menor. Em hipertermia (insolação), a regulação falha e é uma emergência. A febre não é falha: na infecção, substâncias liberadas pelo sistema imune (pirogênios) elevam o ponto de ajuste do hipotálamo, e o corpo age como se estivesse frio até chegar à nova temperatura. Baixar a febre melhora o conforto, mas a febre também ajuda a defesa; o importante é investigar a causa.' },
    ] },
    { ch: 'Cap. 4, Barreira e saúde', t: 'Barreira, cicatrização e doenças da pele', h: 'O que a pele impede e o que a atinge', m: { sys: ['tegumentar'] }, b: [
      { p: 'A pele é uma barreira física (células justapostas e queratina), química (pH ácido, sebo) e biológica (microbiota residente, que ocupa espaço e compete com patógenos). Células de Langerhans capturam antígenos e alertam o sistema imune. Quando a barreira é rompida, o corpo inicia a cicatrização.' },
      { steps: { t: 'cicatrização', items: [
        'Hemostasia: vasos se contraem, plaquetas formam um tampão e a fibrina estanca o sangramento.',
        'Inflamação: células de defesa limpam o local, com vermelhidão, calor e inchaço.',
        'Proliferação: fibroblastos produzem colágeno e novos vasos se formam; a epiderme cobre a área.',
        'Remodelação: o colágeno é reorganizado ao longo de meses; forma-se a cicatriz.'] } },
      { table: { cap: 'Queimaduras (classificação)', head: ['Grau', 'Camadas atingidas', 'Aspecto'], rows: [
        ['1º grau', 'Epiderme', 'Vermelhidão e dor, sem bolhas'],
        ['2º grau', 'Epiderme e parte da derme', 'Bolhas e muita dor'],
        ['3º grau', 'Todas as camadas, podendo atingir tecidos profundos', 'Pele esbranquiçada ou carbonizada, pouca dor por destruição das terminações nervosas']] } },
      { table: { cap: 'Doenças infecciosas da pele', head: ['Doença', 'Agente e transmissão', 'Prevenção e tratamento'], rows: [
        ['Micoses (frieira, pano branco)', 'Fungos; contato direto e umidade', 'Manter a pele seca, não compartilhar toalhas; antifúngicos'],
        ['Escabiose (sarna)', 'Ácaro Sarcoptes scabiei; contato próximo; coceira', 'Tratamento de todos os contatos; lavar roupas'],
        ['Pediculose', 'Piolho; contato direto e objetos pessoais', 'Pentear com pente fino e tratamento orientado'],
        ['Hanseníase', 'Bactéria Mycobacterium leprae; transmissão por contato prolongado com doentes não tratados; atinge pele e nervos', 'Tem cura; o tratamento (poliquimioterapia) é gratuito no SUS e interrompe a transmissão; o diagnóstico precoce evita sequelas'],
        ['Leishmaniose tegumentar', 'Protozoário do gênero Leishmania transmitido pela picada do flebotomíneo ("mosquito-palha")', 'Controle do vetor, proteção em áreas de mata'],
        ['Herpes-zóster', 'Reativação do vírus da varicela', 'Vacina disponível'],
        ['Tétano', 'Bactéria que entra por feridas', 'Vacinação em dia e limpeza adequada de ferimentos']] } },
    ] },
    { ch: 'Cap. 5, Integração', t: 'A pele e o resto do corpo', h: 'Fronteira e sensor', m: { sys: ['tegumentar', 'cardiovascular', 'nervoso'] }, b: [
      { cols: [['Nervoso', 'Receptores da pele enviam informações de tato, temperatura e dor; o hipotálamo coordena a termorregulação.'], ['Cardiovascular', 'A rede de vasos da derme muda o fluxo para ganhar ou perder calor; a pele pode revelar alterações da circulação, como palidez e cianose.'], ['Imune', 'Barreira e vigilância: células de Langerhans e microbiota residente.']] },
      { cols: [['Endócrino', 'A vitamina D age como hormônio; os androgênios aumentam a atividade das glândulas sebáceas na puberdade.'], ['Esquelético', 'A vitamina D sintetizada na pele permite absorver o cálcio dos ossos.'], ['Urinário e digestório', 'Suor elimina água e sais; diarreia e desidratação refletem-se na pele (turgor).']] },
    ] },
  ],
  sint: {
    text: 'A pele tem epiderme (barreira sem vasos, com queratina e melanócitos), derme (vasos, nervos, glândulas e folículos) e hipoderme (gordura). Protege, percebe o ambiente, regula a temperatura pelo suor e pelo fluxo de sangue, produz vitamina D e participa da defesa. A melanina protege contra a radiação UV, e o excesso de sol aumenta o risco de câncer de pele. O hipotálamo controla a temperatura por retroalimentação negativa.',
    conf: [
      ['Epiderme × derme', 'A epiderme não tem vasos; a derme tem vasos, nervos, glândulas e folículos.'],
      ['Bronzeado × saúde', 'O bronzeado é resposta a dano ao DNA, não um sinal de saúde.'],
      ['Sudoríparas × sebáceas', 'Sudoríparas produzem suor; sebáceas produzem sebo.'],
      ['Febre × hipertermia', 'Febre eleva o ponto de ajuste do hipotálamo por infecção; hipertermia é falha da perda de calor.']],
    cards: [
      ['Que células produzem melanina?', 'Os melanócitos, na epiderme.'],
      ['Por que a epiderme não sangra?', 'Porque não tem vasos sanguíneos.'],
      ['Que radiação sintetiza vitamina D na pele?', 'A UVB.'],
      ['Que respostas ocorrem no calor?', 'Vasodilatação na pele e aumento do suor.'],
      ['Que região do encéfalo controla a temperatura?', 'O hipotálamo.'],
      ['Qual o melanoma e por que é grave?', 'Câncer dos melanócitos; pode se espalhar (metástase) com facilidade.'],
      ['Como se trata a hanseníase?', 'Com poliquimioterapia, gratuita no SUS; tem cura.']],
  },
};
