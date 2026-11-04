// Atlas Vivo — aula aprofundada: sistema reprodutor. Texto original em português, escrito para este projeto.
(window.AV_LESSON_DEEP = window.AV_LESSON_DEEP || {}).reprodutor = {
  dur: 70,
  lead: 'Gametas e hormônios, o ciclo menstrual, a fecundação, a gestação e o parto, além de métodos contraceptivos, infecções sexualmente transmissíveis e pré-natal.',
  goals: [
    'Relacionar meiose, espermatogênese e ovogênese à formação dos gametas.',
    'Descrever as estruturas e as funções dos sistemas reprodutores masculino e feminino.',
    'Interpretar o ciclo menstrual e o controle hormonal por retroalimentação.',
    'Acompanhar fecundação, implantação, desenvolvimento embrionário, placenta, parto e lactação.',
    'Comparar métodos contraceptivos e reconhecer as IST, sua prevenção e o pré-natal.'],
  enem: [
    'Ciclo menstrual: gráficos de FSH, LH, estrógeno e progesterona; ovulação e menstruação.',
    'Métodos contraceptivos: eficácia, mecanismo e proteção contra IST.',
    'IST: HIV, sífilis (incluindo congênita), HPV e vacina; hepatites.',
    'Fecundação, gêmeos, placenta e anexos embrionários; gravidez e pré-natal.',
    'Meiose e produção de gametas; vasectomia e laqueadura; reprodução assistida.'],
  refs: [
    ['OpenStax — Anatomia e Fisiologia 2e, caps. 27–28: Sistema reprodutor e desenvolvimento', 'https://openstax.org/books/anatomy-and-physiology-2e/pages/27-introduction', 'CC BY-NC-SA 4.0, consulta para conferir fatos; texto próprio'],
    ['Ministério da Saúde — Biblioteca Virtual em Saúde (BVS/MS)', 'https://bvsms.saude.gov.br/', 'publicações oficiais, consulta'],
    ['Matriz de Referência do Enem (Inep)', 'https://www.gov.br/inep/pt-br/centrais-de-conteudo/acervo-linha-editorial/publicacoes-institucionais/avaliacoes-e-exames-da-educacao-basica/matrizes-de-referencia-enem', 'documento oficial']],
  secs: [
    { ch: 'Cap. 1, Gametas', t: 'Reprodução sexuada e gametas', h: 'Metade do material genético de cada lado', m: { sys: ['reprodutor'] }, b: [
      { p: 'A reprodução humana é sexuada: um gameta masculino (espermatozoide) e um feminino (óvulo, na prática um ovócito secundário) se unem e formam o zigoto, com 46 cromossomos. Cada gameta tem 23 cromossomos (haploide). Esse número é obtido pela meiose, divisão em que uma célula diploide dá origem a células com metade dos cromossomos e com combinações genéticas diferentes, por recombinação e pela distribuição aleatória dos cromossomos.' },
      { table: { cap: 'Gametogênese: comparação', head: ['Característica', 'Espermatogênese', 'Ovogênese'], rows: [
        ['Onde', 'Túbulos seminíferos dos testículos', 'Ovários'],
        ['Quando começa', 'Na puberdade; contínua por toda a vida adulta', 'Na vida fetal; meiose fica interrompida até a puberdade'],
        ['Produto de cada célula inicial', 'Quatro espermatozoides funcionais', 'Um ovócito funcional e corpos polares pequenos que degeneram'],
        ['Quantidade', 'Milhões por dia', 'Cerca de um ovócito por ciclo, até a menopausa'],
        ['Parada no processo', 'Não há; o espermatozoide se completa e amadurece no epidídimo', 'O ovócito primário para na prófase I; na ovulação sai como ovócito secundário, parado na metáfase II; só completa a meiose II se for fecundado']] } },
      { warn: ['“A mulher nasce sem óvulos e vai fabricando depois da puberdade.”', 'É o contrário: a mulher nasce com milhões de ovócitos primários nos ovários, e o número só diminui com o tempo. Já nos homens, a produção de espermatozoides é contínua após a puberdade.'] },
    ] },
    { ch: 'Cap. 2, Anatomia', t: 'Sistema reprodutor masculino', h: 'Produzir e conduzir espermatozoides', m: { sys: ['reprodutor'], parts: ['reprodutor', ['testículo', 'próstata']] }, b: [
      { fig: 'repmasc', cap: 'Sistema reprodutor masculino em corte lateral.' },
      { table: { cap: 'Estruturas e funções', head: ['Estrutura', 'Função'], rows: [
        ['Testículos', 'Produzem espermatozoides (túbulos seminíferos, com células de Sertoli que nutrem as células germinativas) e testosterona (células de Leydig)'],
        ['Escroto', 'Mantém os testículos cerca de 2 a 3 °C abaixo da temperatura do corpo, necessária para a espermatogênese'],
        ['Epidídimo', 'Maturação e armazenamento dos espermatozoides'],
        ['Ducto deferente', 'Conduz os espermatozoides até a uretra; é seccionado na vasectomia'],
        ['Vesículas seminais e próstata', 'Produzem a maior parte do líquido seminal, com frutose e substâncias que nutrem e protegem os espermatozoides'],
        ['Glândulas bulbouretrais', 'Líquido lubrificante e que neutraliza a acidez da uretra'],
        ['Pênis e uretra', 'Órgão copulador; a uretra conduz sêmen e urina (em momentos diferentes)']] } },
      { p: 'O sêmen é a mistura de espermatozoides e líquido seminal. A testosterona, regulada pelo LH, determina os caracteres sexuais masculinos e mantém a espermatogênese junto com o FSH. A próstata pode aumentar com a idade (hiperplasia benigna) e comprimir a uretra; o exame periódico, conforme orientação médica, serve para a detecção precoce do câncer de próstata.' },
    ] },
    { ch: 'Cap. 2, Anatomia', t: 'Sistema reprodutor feminino', h: 'Ovulação, fecundação e gestação em um mesmo sistema', m: { sys: ['reprodutor'] }, b: [
      { fig: 'repfem', cap: 'Sistema reprodutor feminino em vista frontal.' },
      { table: { cap: 'Estruturas e funções', head: ['Estrutura', 'Função'], rows: [
        ['Ovários', 'Armazenam ovócitos em folículos, liberam um ovócito por ciclo e produzem estrógenos e progesterona'],
        ['Tubas uterinas (trompas)', 'Recebem o ovócito; é onde costuma ocorrer a fecundação, na região da ampola; cílios e contrações o conduzem ao útero'],
        ['Útero', 'Órgão muscular em que o embrião se implanta e o feto se desenvolve; o endométrio (revestimento interno) se renova a cada ciclo e o miométrio (músculo liso) se contrai no parto'],
        ['Colo do útero (cérvix) e vagina', 'Passagem do espermatozoide e do bebê; a vagina é o canal do parto'],
        ['Vulva', 'Estruturas externas'],
        ['Mamas', 'Glândulas que produzem leite sob ação de prolactina e ocitocina']] } },
      { p: 'A gravidez que se implanta fora do útero, em geral na tuba, é chamada ectópica e é uma emergência médica. A endometriose é o crescimento de tecido semelhante ao endométrio fora do útero e pode causar dor e dificultar a gravidez. O exame preventivo (Papanicolau) é o rastreio do câncer do colo do útero, em geral causado pelo HPV.' },
    ] },
    { ch: 'Cap. 3, Hormônios', t: 'Ciclo menstrual', h: 'Hormônios que se alternam e se regulam', m: { sys: ['reprodutor', 'endocrino'] }, b: [
      { p: 'O ciclo menstrual dura em média 28 dias, mas varia de pessoa para pessoa. Envolve o hipotálamo (GnRH), a hipófise (FSH e LH) e os ovários (estrógenos e progesterona), com efeitos sobre o ovário e o útero ao mesmo tempo.' },
      { table: { cap: 'Fases do ciclo (ciclo de 28 dias, como referência)', head: ['Fase', 'Dias aprox.', 'Ovário', 'Útero', 'Hormônios'], rows: [
        ['Menstrual', '1 a 5', 'Folículos começam a crescer', 'Descamação do endométrio (menstruação)', 'Estrógeno e progesterona baixos; FSH sobe'],
        ['Folicular (proliferativa)', '6 a 13', 'Um folículo domina e amadurece', 'Endométrio se reconstrói e espessa', 'FSH estimula o folículo; estrógeno sobe'],
        ['Ovulação', 'Cerca do 14º', 'Ruptura do folículo e liberação do ovócito', 'Muco cervical fica fluido', 'Pico de estrógeno desencadeia o pico de LH'],
        ['Lútea (secretora)', '15 a 28', 'Folículo vira corpo lúteo, que produz progesterona', 'Endométrio fica preparado para a implantação', 'Progesterona alta; estrógeno em segundo pico; LH e FSH baixos']] } },
      { steps: { t: 'controle hormonal', items: [
        'No início do ciclo, o FSH estimula o crescimento de folículos nos ovários.',
        'Os folículos produzem estrógeno, que reconstrói o endométrio e, em níveis baixos, inibe FSH e LH (retroalimentação negativa).',
        'Quando o estrógeno fica alto e se mantém, passa a estimular a hipófise (retroalimentação positiva): ocorre o pico de LH.',
        'O pico de LH provoca a ovulação e transforma o folículo em corpo lúteo, que secreta progesterona.',
        'Se não há fecundação, o corpo lúteo regride, a progesterona e o estrógeno caem, o endométrio descama e o ciclo recomeça.',
        'Se há implantação, o embrião produz hCG, que mantém o corpo lúteo e a progesterona, e a menstruação não ocorre.'] } },
      { note: ['Atenção ao tempo', 'A ovulação ocorre cerca de 14 dias antes da próxima menstruação, e não necessariamente no 14º dia do ciclo. Por isso a “tabelinha” é um método pouco confiável: os ciclos variam. O espermatozoide sobrevive alguns dias no sistema feminino e o ovócito, cerca de um dia.'] },
    ] },
    { ch: 'Cap. 4, Desenvolvimento', t: 'Fecundação, gestação e parto', h: 'Do zigoto ao recém-nascido', m: { sys: ['reprodutor'] }, b: [
      { steps: { t: 'início do desenvolvimento', items: [
        'Fecundação: um espermatozoide penetra no ovócito secundário, que completa a meiose II; os núcleos se unem e formam o zigoto.',
        'Clivagem: divisões mitóticas rápidas formam a mórula e, depois, o blastocisto, enquanto o embrião desce pela tuba.',
        'Cerca de seis a sete dias depois, o blastocisto se implanta no endométrio.',
        'Forma-se a placenta, com tecidos do embrião e do útero, e os anexos embrionários (âmnio, cório, alantoide e saco vitelino).'] } },
      { p: 'A placenta troca gases, nutrientes e resíduos entre mãe e feto sem que o sangue de um se misture ao do outro. Também produz hormônios (hCG, progesterona, estrógenos) e permite a passagem de anticorpos IgG da mãe. Substâncias como álcool, nicotina, alguns medicamentos e vírus (rubéola, zika) também podem atravessá-la, e por isso são tão perigosos na gestação. O âmnio forma a bolsa com líquido que amortece o feto.' },
      { p: 'A gestação humana dura cerca de 40 semanas. O parto é desencadeado por mudanças hormonais e é impulsionado por contrações do útero, que são intensificadas pela ocitocina (retroalimentação positiva). Depois, a prolactina estimula a produção de leite e a ocitocina provoca sua saída (ejeção). O colostro, primeiro leite, é rico em anticorpos. O Ministério da Saúde e a Organização Mundial da Saúde recomendam o aleitamento materno exclusivo até os seis meses.' },
      { table: { cap: 'Gêmeos', head: ['Tipo', 'Como se forma', 'Característica'], rows: [
        ['Monozigóticos (idênticos)', 'Um zigoto se divide em dois embriões', 'Mesmo genoma e mesmo sexo'],
        ['Dizigóticos (fraternos)', 'Dois ovócitos fecundados por dois espermatozoides', 'Genomas diferentes, como irmãos; podem ser de sexos diferentes']] } },
    ] },
    { ch: 'Cap. 5, Saúde', t: 'Contracepção', h: 'Escolher o método com informação', m: { sys: ['reprodutor'] }, b: [
      { table: { cap: 'Métodos contraceptivos', head: ['Método', 'Como atua', 'Observações'], rows: [
        ['Preservativo masculino e feminino', 'Barreira física que impede o contato do sêmen com a vagina', 'É o único que também protege contra IST; distribuído gratuitamente no SUS'],
        ['Pílula combinada e minipílula', 'Hormônios inibem a ovulação e engrossam o muco do colo', 'Exige uso diário; não protege contra IST'],
        ['Injetáveis e implante hormonal', 'Liberam hormônio por semanas ou anos', 'Alta eficácia; o implante é um dos mais eficazes'],
        ['DIU de cobre e DIU hormonal', 'Dispositivo no útero; o de cobre é espermicida e o hormonal afina o endométrio e engrossa o muco', 'Longa duração; reversível'],
        ['Diafragma', 'Barreira sobre o colo do útero com espermicida', 'Menor eficácia'],
        ['Laqueadura', 'Cirurgia que interrompe as tubas', 'Considerada permanente'],
        ['Vasectomia', 'Cirurgia que interrompe os ductos deferentes', 'Permanente; o homem continua ejaculando, mas o sêmen não tem espermatozoides'],
        ['Contracepção de emergência', 'Dose de hormônio que retarda a ovulação, usada até poucos dias após a relação sem proteção', 'Não é método de uso regular; não interrompe uma gravidez já iniciada'],
        ['Tabelinha e coito interrompido', 'Baseiam-se em prever a fertilidade ou na retirada antes da ejaculação', 'Pouco confiáveis']] } },
      { p: 'Nenhum método é 100% eficaz; a eficácia depende do uso correto e consistente. A escolha deve ser feita com orientação de profissionais de saúde e respeitando preferências e condições de saúde de cada pessoa. A dupla proteção (preservativo mais outro método) previne gravidez e IST.' },
    ] },
    { ch: 'Cap. 5, Saúde', t: 'Infecções sexualmente transmissíveis e pré-natal', h: 'Prevenção e cuidado desde antes do nascimento', m: { sys: ['reprodutor', 'linfatico'] }, b: [
      { table: { cap: 'Principais IST', head: ['Infecção', 'Agente', 'Pontos importantes'], rows: [
        ['Sífilis', 'Bactéria Treponema pallidum', 'Tem cura com penicilina; sem tratamento pode causar lesões graves; a sífilis congênita (transmissão da gestante ao bebê) causa aborto, malformações e morte, e é evitada com o pré-natal e o tratamento da gestante e do parceiro'],
        ['Gonorreia e clamídia', 'Bactérias', 'Podem ser assintomáticas; causam infertilidade se não tratadas; há antibióticos'],
        ['HPV', 'Papilomavírus humano', 'Pode causar verrugas e câncer do colo do útero, do pênis e outros; vacina disponível no SUS para meninas e meninos, e exame preventivo'],
        ['Herpes genital', 'Vírus herpes simples', 'Recidivas; antivirais controlam'],
        ['HIV/aids', 'Retrovírus', 'Controlável com terapia antirretroviral; ver aula de imunidade'],
        ['Hepatites B e C', 'Vírus', 'A B tem vacina; a C tem tratamento com cura na maioria dos casos']] } },
      { p: 'O pré-natal é o acompanhamento da gestação: consultas, exames e vacinas. Ele identifica riscos como hipertensão, diabetes gestacional, sífilis, HIV e toxoplasmose (parasita Toxoplasma gondii, adquirido por carne crua ou mal passada e por fezes de gato) e permite tratá-los. A suplementação de ácido fólico antes e no início da gestação reduz o risco de defeitos do tubo neural. Infecções como rubéola e zika na gestação podem causar malformações, como a microcefalia.' },
      { ul: ['Reprodução assistida: a fertilização in vitro une os gametas em laboratório e transfere o embrião ao útero; a injeção intracitoplasmática injeta um espermatozoide no ovócito.', 'Gravidez na adolescência tem riscos de saúde e implicações sociais; educação sexual, acesso a métodos e acolhimento são políticas públicas.', 'A informação confiável, sem preconceito, faz parte do cuidado em saúde sexual e reprodutiva.'] },
    ] },
    { ch: 'Cap. 6, Integração', t: 'O reprodutor e os outros sistemas', h: 'Hormônios, defesa e nutrição', m: { sys: ['reprodutor', 'endocrino', 'urinario'] }, b: [
      { cols: [['Endócrino', 'O eixo hipotálamo–hipófise–gônadas regula gametas, hormônios sexuais e ciclo; prolactina e ocitocina regulam a lactação.'], ['Imune', 'O feto tem antígenos paternos; o sistema imune materno o tolera; IgG atravessa a placenta e IgA chega pelo leite.'], ['Cardiovascular', 'Na gestação o volume de sangue aumenta; a placenta é um órgão de trocas altamente irrigado.']] },
      { cols: [['Urinário', 'No homem, a uretra é via comum de urina e sêmen; na gestação, o útero comprime a bexiga e o rim filtra mais.'], ['Esquelético', 'A queda dos estrógenos na menopausa acelera a perda óssea; na gestação e lactação a demanda de cálcio aumenta.'], ['Nervoso', 'Estímulos sensoriais e emocionais modulam o eixo; a ocitocina age também no encéfalo (vínculo).']] },
      { recall: ['Por que a pílula anticoncepcional impede a ovulação?', 'Porque seus hormônios sintéticos mantêm níveis constantes que, por retroalimentação negativa, inibem FSH e LH; sem o pico de LH, não há ovulação.'] },
    ] },
  ],
  sint: {
    text: 'Os gametas são formados por meiose, nos testículos (espermatogênese contínua) e nos ovários (ovogênese interrompida). O eixo hipotálamo–hipófise–gônadas controla o ciclo menstrual por retroalimentação: FSH faz o folículo crescer; o pico de estrógeno desencadeia o pico de LH, que causa a ovulação; a progesterona prepara o endométrio. A fecundação na tuba leva ao zigoto, à implantação e à placenta. Contracepção, prevenção de IST e pré-natal protegem a saúde.',
    conf: [
      ['Ovulação × menstruação', 'Ovulação é a liberação do ovócito; menstruação é a descamação do endométrio, cerca de 14 dias depois.'],
      ['Vasectomia × laqueadura', 'Vasectomia secciona os ductos deferentes; laqueadura interrompe as tubas uterinas.'],
      ['Gêmeos monozigóticos × dizigóticos', 'Mono: um zigoto; di: dois zigotos.'],
      ['Preservativo × outros métodos', 'Só o preservativo protege também contra IST.']],
    cards: [
      ['Onde ocorre a fecundação?', 'Normalmente na tuba uterina, na região da ampola.'],
      ['Qual hormônio causa a ovulação?', 'O pico de LH, desencadeado pelo pico de estrógeno.'],
      ['Que hormônio mantém o endométrio na fase lútea?', 'A progesterona, produzida pelo corpo lúteo.'],
      ['Por que o escroto é importante?', 'Mantém os testículos mais frios do que o corpo, o que a espermatogênese exige.'],
      ['Que hormônio o embrião produz para evitar a menstruação?', 'A gonadotrofina coriônica (hCG).'],
      ['Como se previne a sífilis congênita?', 'Com o pré-natal: testar e tratar a gestante e o parceiro.'],
      ['Que vacina previne o câncer do colo do útero?', 'A vacina contra o HPV.']],
  },
};
